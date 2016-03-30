import pymongo
import os
import operator
import logging
import threading
import time
import re
import sys

from pykube.config import KubeConfig
from pykube.http import HTTPClient
from pykube.objects import Pod

import thriftpy
import thriftpy.rpc
AppService_thrift = thriftpy.load('app.thrift', module_name='AppService_thrift')

logging.basicConfig(level=logging.DEBUG)

IP_RE = R'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:(\d+))?$'

def ip_with_port(ip, if_not_port=27017):
    match = re.match(IP_RE, ip)
    if not match:
        raise Exception()
    return ip
    
def get_app_service():
    return thriftpy.rpc.make_client(
        AppService_thrift.AppService,
        os.environ['APP_SERVICE_SERVICE_HOST'],
        int(os.environ['APP_SERVICE_SERVICE_PORT']))


class ReplicaManager(threading.Thread):
    def __init__(
            self, 
            app_name,
            creator_name,
            external_ip,
            k8s,
            local_mongo_server_conn
            ):
        threading.Thread.__init__(self, name='ReplicaManager %s' % local_mongo_server_conn)
        
        self.app_service = get_app_service()
        self.k8s = k8s
        self.local_mongo_server_conn = local_mongo_server_conn
        self.app_name = app_name
        self.creator_name = creator_name
        self.external_ip = external_ip
        self.local_mongo = pymongo.MongoClient(self.local_mongo_server_conn)

    def get_mongo_pods(self):
        pods = Pod.objects(self.k8s).filter(
            selector={
                'role': 'mongo',
                'app': self.app_name,
                'creator': self.creator_name
            }
        )

        ready_pods = list(filter(operator.attrgetter("ready"), pods))

        if not ready_pods:
            raise Exception('Empty pod list. That is weird')
        return ready_pods

    def in_replica_set(self, mongo=None):
        if mongo is None:
            mongo = self.local_mongo

        try:
            return mongo.admin.command('replSetGetStatus')
        except pymongo.errors.OperationFailure as e:
            if e.code == 94:
                return False
            else:
                raise

    def is_primary(self):
        def key(ip):
            return re.sub(r'[^0-9]', '', ip)

        minimum = sorted([p.obj['metadata']['labels']['external_ip'] for p in self.pods], key=key)[0]
        return minimum == self.external_ip

    def create_replica_set(self):
        logging.info('Creating replica set')
        self.local_mongo.admin.command('replSetInitiate', {
            '_id': 'rs0',
            'version': 1,
            'members': [{'_id': 0, 'host': ip_with_port(self.external_ip)}]
        })
        time.sleep(3)

    def update_replica_members(self):
        self.pods = self.get_mongo_pods()
        config = self.local_mongo.admin.command('replSetGetConfig')['config']

        mongo_ips = set(ip_with_port(m['host']) for m in config['members'])
        pod_ips = set(ip_with_port(p.obj['metadata']['labels']['external_ip']) for p in self.pods)

        to_add = pod_ips - mongo_ips
        to_remove = mongo_ips - pod_ips

        if to_add or to_remove:
            logging.info('Adding to rs: %s', sorted(list(to_add)))
            logging.info('Removing from rs: %s', sorted(list(to_remove)))

            # add members to the config
            config_id = max(m['_id'] for m in config['members']) + 1
            for add in to_add:
                config['members'].append({
                    '_id': config_id,
                    'host': add
                })
                config_id += 1

            # remove members from config
            for member in list(config['members']):
                if member['host'] in to_remove:
                    config['members'].remove(member)


            # update the mongo config
            config['version'] += 1
            self.local_mongo.admin.command('replSetReconfig', config)
                                       
    def wait_until_in_replica(self):
        while not self.in_replica_set():
            logging.debug('Waiting to be added to replica set')
            time.sleep(1)
        

    def ensure_in_replica_set(self):
        wait_for_replica = False
        
        if not self.in_replica_set():
            # check other mongo instances to see if they are in a replica set
            for pod in self.pods:
                pod_mongo = pymongo.MongoClient(pod.obj['metadata']['labels']['external_ip'])
                if self.in_replica_set(pod_mongo):
                    wait_for_replica = True
                    logging.info('Pod %s is already in a replica set. Assuming we will be added to it', pod.metadata.external_ip)
                    break

            # no other mongo instance is in a replica set so it needs to be created
            if self.is_primary():
                self.create_replica_set()
            else:
                logging.info('We are not primary. Waiting')
                wait_for_replica = True

        # wait until we are added to other mongos replica
        if wait_for_replica:
            self.wait_until_in_replica()

    def init_mongo_auth(self):
        mongo_password = self.app_service.get_mongo_password(
            self.app_name,
            self.creator_name)

        if not mongo_password:
            logging.debug('Mongo auth not yet set up. Initting')

        while not mongo_password and not self.is_primary():
            mongo_password = self.app_service.get_mongo_password(
                self.app_name,
                self.creator_name)
            time.sleep(3)

        if not mongo_password and self.is_primary():
            logging.info('Primary. Creating password')
            mongo_password = ''.join(random.choice('abcdefghijklmnopqrstuvwxyz1234567890' for i in xrange(20)))
            self.local_mongo.admin.add_user(
                name='waverbase',
                password=mongo_password,
                roles=[{'role':'userAdminAnyDatabase','db':'admin'}]
            )
            logging.debug('Created user waverbase on local mongo')
            self.app_service.set_mongo_password(
                self.app_name,
                self.creator_name,
                mongo_password)
            logging.debug('Told app-service about our password')

        self.local_mongo.admin.auth('waverbase', mongo_password)
        logging.debug('Authenticated to mongo')

    def run(self):
        self.init_mongo_auth()
        self.pods = self.get_mongo_pods()
        if self.is_primary():
            logging.info('We are primary')
            self.ensure_in_replica_set()

            while True:
                self.update_replica_members()
                time.sleep(5)



def test():
    num = 3
    base = 27018

    
    k8s = HTTPClient(KubeConfig.from_service_account())
    k8s.url = 'http://127.0.0.1:8001'
    k8s.session  = k8s.build_session()
    def get_mongo_pods():
        return [
            Pod(None, {
                'metadata': {
                    'labels': {
                        'external_ip': '127.0.0.1:%d' % p
                    }
                }
            }
            )
            for p in range(base, base+num)
        ]

    for p in range(base, base+num):

        replica_manager = ReplicaManager(
            app_name='testapp',
            creator_name='testcreator',
            external_ip='127.0.0.1:%d' % p,
            k8s=k8s,
            local_mongo_server_conn = 'mongodb://127.0.0.1:%d' % p
        )
        replica_manager.get_mongo_pods = get_mongo_pods
        replica_manager.start()
    
    
def run():
    k8s = HTTPClient(KubeConfig.from_service_account())
    k8s.url = 'http://127.0.0.1:8001'
    k8s.session  = k8s.build_session()
    
    replica_manager = ReplicaManager(
        app_name=os.environ['APP_NAME'],
        creator_name=os.environ['CREATOR_NAME'],
        external_ip=os.environ['EXTERNAL_IP'],
        k8s=k8s,
        local_mongo_server_conn = os.environ['MONGO_CONNECTION_STRING'],
    )
    replica_manager.start()

if __name__ == '__main__':
    test()
