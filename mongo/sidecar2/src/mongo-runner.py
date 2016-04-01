import os.path
import os
from util import get_app_service, get_k8s, is_primary, get_mongo_pods
import subprocess
import pymongo

PERSISTENT_DIR = '/data/db'
INITIALISED_FILE = os.path.join(PERSISTENT_DIR, 'db_initted')

app_name = os.environ['APP_NAME']
creator_name = os.environ['CREATOR_NAME']
external_ip = os.environ['EXTERNAL_IP']

k8s = get_k8s()
pods = get_mongo_pods(
    k8s,
    app_name,
    creator_name
)
primary = is_primary(pods, external_ip)

app_service = get_app_service()

def init_mongo(port=27017):
    mongo_password = ''.join([random.choice('abcdefghijklmnopqrstuvwxyz1234567890') for i in range(20)])
    with subprocess.Popen(['mongod', '--port=%d' % port]) as mongo_process:
        mongo_client = pymongo.MongoClient(('127.0.0.1', port))
        mongo_client.admin.add_user(
            name='waverbase',
            password=mongo_password,
            roles=[
                {'role':'root','db':'admin'},
                {'role':'userAdminAnyDatabase','db':'admin'}
            ])
    
        app_service.set_mongo_password(
            app_name,
            creator_name,
            mongo_password)

    open(INITIALISED_FILE, 'w').write('Mongo db initted')
    
def start_auth_mongo():
    os.execlp('mongod', '--replSet', 'rs0', '--auth', '--smallfiles', '--noprealloc')

if not os.path.isfile(INITIALISED_FILE):
    if primary:
        init_mongo()


# start mongo normally
start_auth_mongo()
