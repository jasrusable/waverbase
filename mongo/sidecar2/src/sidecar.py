import pymongo
import os
import operator
import logging
import threading
import time
import re
import sys
import random
import socket

from pykube.config import KubeConfig
from pykube.http import HTTPClient
from pykube.objects import Pod

import thriftpy
import thriftpy.rpc
AppService_thrift = thriftpy.load('app.thrift', module_name='AppService_thrift')

from oauth2client.client import GoogleCredentials
from googleapiclient import discovery
from googleapiclient.errors import HttpError

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'

google_credentials = GoogleCredentials.get_application_default()

logging.basicConfig(level=logging.DEBUG, format='%(relativeCreated)6d %(threadName)s:   %(message)s')
#logging.basicConfig(level=logging.DEBUG)

IP_RE = R'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:(\d+))?$'

def ip_with_port(ip, if_not_port=27017):
    match = re.match(IP_RE, ip)
    if not match:
        raise Exception()
    host, port = match.group(1), match.group(3)
    if not port:
        port = if_not_port
    return '%s:%s' % (host, port)
    
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
            hostname,
            k8s,
            local_mongo_server_conn,
            external_ip
            ):
        threading.Thread.__init__(self, name='ReplicaManager %s' % local_mongo_server_conn)
        
        self.local_pod_ip = socket.gethostbyname(socket.getfqdn())
        #logging.info('Local pod IP is %s', self.local_pod_ip)
        self.k8s = k8s
        self.local_mongo_server_conn = local_mongo_server_conn
        self.app_name = app_name
        self.creator_name = creator_name
        self.hostname = hostname
        self.external_ip = external_ip

    def get_mongo_pods(self):
        pods = Pod.objects(self.k8s).filter(
            selector={
                'role': 'mongo',
                'app': self.app_name,
                'creator': self.creator_name
            }
        )

        return pods
        ready_pods = list(filter(operator.attrgetter("ready"), pods))

        if not ready_pods:
            raise Exception('Empty pod list. That is weird')
        return ready_pods

    def wait_until_started(self, mongo=None):
        ''' if we are in a replica set and the RS is fully initialised return True '''
        while True:
            status = self.local_mongo.admin.command('replSetGetStatus')
            for member in status['members']:
                if member['stateStr'] not in ('PRIMARY', 'SECONDARY'):
                    logging.debug('Member in state %s. Waiting. ', member['stateStr'])
                    continue
            break

    def in_replica_set(self, mongo=None):
        ''' if we are in a replica set and the RS is fully initialised return True '''
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

        minimum = sorted([p.obj['status']['podIP'] for p in self.pods], key=key)[0]
        return minimum == self.local_pod_ip

    def create_replica_set(self):
        logging.info('Creating replica set')
        self.local_mongo.admin.command('replSetInitiate', {
            '_id': 'rs0',
            'version': 1,
            'members': [{'_id': 0, 'host': ip_with_port(self.local_pod_ip)}]
        })
        time.sleep(3)

    def update_dns_record(self):
        dns = discovery.build('dns', 'v1', credentials=google_credentials)
        changes = self.dns.changes()
        changes.create(
            project=GCLOUD_PROJECT,
            managedZone='waverbase',
            body={
                "additions": [
                '%s. A %s' % (host, self.local_pod_ip)
                ]
            })

    def update_replica_members(self):
        self.pods = self.get_mongo_pods()
        config = self.local_mongo.admin.command('replSetGetConfig')['config']

        mongo_ips = set(ip_with_port(m['host']) for m in config['members'])
        pod_ips = set(ip_with_port(p.obj['status']['podIP']) for p in self.pods)

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
            logging.debug('Updating RS config: %s', config)
            self.local_mongo.admin.command('replSetReconfig', config)
                                       
    def wait_until_in_replica(self):
        while not self.in_replica_set():
            time.sleep(2)
        

    def ensure_in_replica_set(self):
        wait_for_replica = False
        
        if not self.in_replica_set():
            logging.debug('Not in replica set')
            # check other mongo instances to see if they are in a replica set
            '''for pod in self.pods:
                pod_mongo = pymongo.MongoClient(pod.obj['status']['podIP'])
                if self.in_replica_set(pod_mongo):
                    wait_for_replica = True
                    logging.info('Pod %s is already in a replica set. Assuming we will be added to it', pod.obj['status']['podIP'])
                    break
                pod_mongo.close()
                pod_mongo = None'''

            # no other mongo instance is in a replica set so it needs to be created
            if self.is_primary() and not wait_for_replica:
                self.create_replica_set()
            else:
                logging.info('We are not primary. Waiting')
                self.wait_until_in_replica()

            from pprint import pprint
            print(pprint(self.local_mongo.admin.command('replSetGetStatus'), indent=2))

        self.wait_until_started()
        logging.debug('We are in a replica. Yaay')

    @property
    def is_master(self):
        return self.local_mongo.admin.command('isMaster')['ismaster']

    def init_mongo_auth(self):
        logging.debug('Authenticating...')
        mongo_password = self.app_service.get_mongo_password(
            self.app_name,
            self.creator_name)

        # ask mongo if we are mongo master. Whether we are primary doesn't help all that much
        is_master = self.is_master

        while not mongo_password and not is_master:
            mongo_password = self.app_service.get_mongo_password(
                self.app_name,
                self.creator_name)
            time.sleep(3)

        if not mongo_password and is_master:
            logging.info('Mongo master. Creating password')
            mongo_password = ''.join([random.choice('abcdefghijklmnopqrstuvwxyz1234567890') for i in range(20)])
            self.local_mongo.admin.add_user(
                name='waverbase',
                password=mongo_password,
                roles=[
                    {'role':'root','db':'admin'},
                    {'role':'userAdminAnyDatabase','db':'admin'}]
            )
            logging.debug('Created user waverbase on local mongo')
            self.app_service.set_mongo_password(
                self.app_name,
                self.creator_name,
                mongo_password)
            logging.debug('Told app-service about our password')


        logging.debug('Have password. Attempting to auth')
        for i in range(5):
            try:
                self.local_mongo.admin.authenticate('waverbase', mongo_password)
                break
            except pymongo.errors.OperationFailure as e:
                print(e.code)
                logging.debug('Auth failed. Assume that we have not properly synced yet')
                time.sleep(2)
        else:
            raise e
                
        logging.debug('Authenticated to mongo')

    def run(self):
        self.local_mongo = pymongo.MongoClient(self.local_mongo_server_conn)
        self.app_service = get_app_service()
        self.pods = self.get_mongo_pods()

        if self.is_primary():
            logging.info('We are PRIMARY')
        else:
            logging.info('SECONDARY')

        self.ensure_in_replica_set()

        self.init_mongo_auth()

        while True:
            if self.is_master:
                self.update_replica_members()
            else:
                #logging.debug('We are not master but lets wait and see if we become master')
                pass
            time.sleep(10)


def test():
    num = 3
    base = 27020
    
    k8s = HTTPClient(KubeConfig.from_service_account())
    k8s.url = 'http://127.0.0.1:8001'
    k8s.session  = k8s.build_session()
    def get_mongo_pods():
        return [
            Pod(None, {
                'metadata': {
                    'labels': {
                        'hostname': '127.0.0.1:%d' % p
                    }
                },
                'status': {
                    'podIP': '127.0.0.1:%d' % p
                }
            }
            )
            for p in range(base, base+num)
        ]

    for p in range(base, base+num):

        replica_manager = ReplicaManager(
            app_name='testapp',
            creator_name='testcreator',
            hostname='127.0.0.1:%d' % p,
            k8s=k8s,
            local_mongo_server_conn = 'mongodb://127.0.0.1:%d' % p,
            external_ip='127.0.0.1:%d' % p
        )
        replica_manager.local_pod_ip = '127.0.0.1:%d' % p
        replica_manager.get_mongo_pods = get_mongo_pods
        replica_manager.start()
    
    
def run():
    k8s = HTTPClient(KubeConfig.from_service_account())
    mongo_connection_string = os.environ.get('MONGO_CONNECTION_STRING', 'mongodb://127.0.0.1')
    logging.info('Mongo server %s', mongo_connection_string)
    
    replica_manager = ReplicaManager(
        app_name=os.environ['APP_NAME'],
        creator_name=os.environ['CREATOR_NAME'],
        hostname=os.environ['MONGO_HOSTNAME'],
        k8s=k8s,
        local_mongo_server_conn = mongo_connection_string,
        external_ip=os.environ['EXTERNAL_IP']
    )
    replica_manager.start()

if __name__ == '__main__':
    logging.debug('Starting and stuff')
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        test()
    else:
        run()
