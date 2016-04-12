from task import app
from celery import group, chain
from celery.result import ResultBase

import gcloud
import k8s

@app.task
def add_mongo_replicas(creator, name, db_size, replicas=3):
    args = []
    for replica in range(1, replicas+1):
        args.append(dict(
            hostname=host_name({'app':name}, replica),
            creator=creator,
            app=name
        ))

    ip_results = []
    wait = []

    for replica in range(1, replicas+1):
        a = args[replica-1]
        wait.append(gcloud.reserve_disk.delay(disk_name(a, replica), db_size))
        ip_results.append(gcloud.reserve_ip.delay(ip_name(a, replica)))

    # wait until all previous tasks have completed
    for w in wait:
        w.get()

    # TODO: figure out if k8s service has been created correctly

    # create the rc from all the resources we now have
    for i, ip_r in enumerate(ip_results):
        args[i]['ip'] = ip = ip_r.get()
        gcloud.add_dns_record.delay(host_name(a, replica), ip)
        k8s.create_kube_from_template.delay(
            'mongo-service-template.yaml',
            args[-1])
        k8s.create_kube_from_template.delay(
            'mongo-controller-template.yaml',
            args[i])

@app.task
def delete_mongo_replica(name, creator):
    # TODO: count the number of replicas
    replicas = 3
    a = [
        {
            'hostname': host_name({'app':name}, replica),
            'creator': creator,
            'app': name
        }
        for replica in range(1, replicas+1)
    ]
    ss = group(*sum(([k8s.delete_kube_by_name.s(
                'rc/'+replication_controller_name(a[r], r)),
        k8s.delete_kube_by_name.s(
                'svc/'+service_name(a[r], r)),
        gcloud.delete_disk.s(disk_name(a[r], r)),
        gcloud.delete_ip.s(ip_name(a[r], r)),
        gcloud.delete_dns_record.s(host_name(a[r], r))]
            for r in range(replicas)), []))()

def ip_name(args, replica):
  return 'ip-mongo-%(creator)s-%(app)s-%(size)d' % dict(size=replica, **args)

def disk_name(args, replica):
  return "mongo-app-%(app)s-%(size)d-disk" % dict(size=replica, **args)

def replication_controller_name(args, replica):
  return 'mongo-%(app)s-%(replica)d' % dict(replica=replica, **args)

def service_name(args, replica):
  return 'mongo-%(app)s-%(replica)d' % dict(replica=replica, **args)

def host_name(args, replica):
    return '%(app)s-%(replica)d.db.waverbase.com' % dict(replica=replica, **args)
