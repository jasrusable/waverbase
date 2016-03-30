import pymongo
import os
import operator
import logging
import threading
import time
import re

from pykube.config import KubeConfig
from pykube.http import HTTPClient
from pykube.objects import Pod

IP_RE = r'(\d{1,3}\.\d{1,3}\.\d{1,3})(:(\d+))?'

class ReplicaManager(threading.Thread):
    def __init__(
            self, 
            app_name,
            creator_name,
            external_ip,
            k8s,
            local_mongo_server_conn
            ):
        self.k8s = k8s
        self.local_mongo_server_conn
        self.app_name = app_name
        self.creator_name = creator_name
        self.external_ip = external_ip
        self.local_mongo = pymongo.MongoClient(self.local_mongo_server_conn)

    def get_mongo_pods(self):
        pods= Pod.objects(self.k8s).filter(
            selector={
                role: 'mongo',
                app: self.app_name
            }
        )

        ready_pods = filter(operator.attrgetter("ready"), pods)
        return ready_pods

    def in_replica_set(self, mongo=None):
        if mongo is None:
            mongo = self.local_mongo

        try:
            mongo.admin.command('replSetGetStatus')
            return True
        except pymongo.errors.OperationFailure as e:
            if e.code == 94:
                return False
            else:
                raise

    def is_primary(self):
        def key(ip):
            return re.sub(r'[^0-9]', '', ip)

        minimum = sort([p.metadata.external_ip for p in self.pods], key=key)[0]
        return minimum == self.external_ip

    def create_replica_set(self):
        logging.info('Creating replica set')
        self.local_mongo.admin.command('replSetInitiate', {
            _id: 'rs0',
            version: 1,
            members: [{_id: 0, host: self.external_ip+':27017']}
        })

    def update_replica_members(self):
        self.pods = self.get_mongo_pods()
        config = self.local_mongo.admin.command('replSetGetConfig')

        mongo_ips = set(m.name for m in config.members)
        pod_ips = set(p.metadata.external_ip for p in self.pods)

        to_add = pod_ips - mongo_ips
        to_remove = mongo_ips - pod_ips

        logging.info('Adding to rs: ', to_add)
        logging.info('Removing from rs: ', to_add)

        # add members to the config
        config_id = max(m.id for m in config.members) + 1
        for add in to_add:
            config.members.append({
                _id: config_id += 1,
                host: add
            })
            config_id += 1

        # remove members from config
        for member in list(config.members):
            if member.host in to_remove:
                config.members.remove(member)

        
        # update the mongo config
        config.version += 1
        self.local_mongo.admin.command('replSetReconfig', config)
                                       

    def ensure_in_replica_set(self):
        if not self.in_replica_set():
            # check other mongo instances to see if they are in a replica set
            other_mongo_in_replica = False
            for pod in self.pods:
                pod_mongo = None
                if self.exists_replica_set(pod_mongo):
                    other_mongo_in_replica = True
                    logging.info('Pod %s is already in a replica set. Assuming we will be added to it', pod.metadata.external_ip)
                    break

            # wait until we are added to other mongos replica
            if other_mongo_in_replica:
                while not self.in_replica_set():
                    logging.debug('Waiting to be added to replica set')
                    time.sleep(1)
                return 

            # no other mongo instance is in a replica set so it needs to be created
            if self.is_primary():
                self.create_replica_set()


    def run(self):
        self.pods = self.get_mongo_pods()
        if self.is_primary():
            logging.info('We are primary')
        self.ensure_in_replica_set()

        while True:
            self.update_replica_members()
            time.sleep(5)


    
if __name__ == '__main__':
    k8s = HTTPClient(KubeConfig.from_file("/Users/MrHamdulay/.kube/config"))

    
    replica_manager = ReplicaManager(
        app_name=os.environ['APP_NAME'],
        creator_name=os.environ['CREATOR_NAME'],
        external_ip=os.environ['EXTERNAL_IP'],
        k8s=k8s,
        mongo_server_conn = os.environ['MONGO_CONNECTION_STRING'],
    )
    replica_manager.start()
