import os.path
import os
from util import get_app_service, get_k8s, is_primary, get_mongo_pods
import subprocess

PERSISTENT_DIR = '/data/db'
INITIALISED_FILE = os.path.join(PERSISTENT_DIR, 'db_initted')

INIT_MONGO = 'mongo'
DONE_MONGO = 
    
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

def init_mongo():
    mongo_password = ''.join([random.choice('abcdefghijklmnopqrstuvwxyz1234567890') for i in range(20)])
    

def start_auth_mongo():
    os.execlp('mongo', '--replSet', 'rs0', '--auth', '--smallfiles', '--noprealloc')

if not os.path.isfile(INITIALISED_FILE) and primary:
    init_mongo()

# start mongo normally
start_auth_mongo()
