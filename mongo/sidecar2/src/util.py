import thriftpy
import thriftpy.rpc
AppService_thrift = thriftpy.load('app.thrift', module_name='AppService_thrift')

from pykube.config import KubeConfig
from pykube.http import HTTPClient
from pykube.objects import Pod

import operator
import re
import os

def get_app_service():
    return thriftpy.rpc.make_client(
        AppService_thrift.AppService,
        os.environ['APP_SERVICE_SERVICE_HOST'],
        int(os.environ['APP_SERVICE_SERVICE_PORT']))

def is_primary(pods, me):
    def key(ip):
        return re.sub(r'[^0-9]', '', ip)

    minimum = sorted([p.obj['metadata']['labels']['external_ip'] for p in pods], key=key)[0]
    return minimum == me

def get_k8s():
    k8s = HTTPClient(KubeConfig.from_service_account())
    k8s.url = 'http://127.0.0.1:8001'
    k8s.session  = k8s.build_session()

def get_mongo_pods(k8s, app_name, creator_name):
    pods = Pod.objects(k8s).filter(
        selector={
            'role': 'mongo',
            'app': app_name,
            'creator': creator_name
        }
    )

    ready_pods = list(filter(operator.attrgetter("ready"), pods))

    if not ready_pods:
        raise Exception('Empty pod list. That is weird')
    return ready_pods

# FOR DEV
def get_mongo_pods(*args):
    base = 27018
    num = 3
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
