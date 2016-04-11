from tasks import app
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
            size=replica,
            creator=creator,
            app=name
        ))
        k8s.create_kube_from_template.delay(
            'mongo-service-template.yaml',
            args[-1])

    ip_results = []
    wait = []

    for replica in range(1, replicas+1):
        a = args[replica-1]
        wait.append(gcloud.add_dns_record.delay(host_name(a, replica)))
        wait.append(gcloud.reserve_disk.delay(disk_name(a, replica)))
        ip_results.append(gcloud.reserve_ip.delay(ip_name(a, replica)))

    # wait until all previous tasks have completed
    for w in wait:
        w.get()

    # TODO: figure out if k8s service has been created correctly

    # create the rc from all the resources we now have
    for i, ip_r in enumerate(ip_results):
        args[i]['ip'] = ip_r.get()

        k8s.create_kube_from_template.delay(
            'mongo-controller-template.yaml',
            args[i])

@app.task
def delete_mongo_replica(creator, name):
    # TODO: count the number of replicas
    replicas = 3
    args = [
        {
            hostname=host_name({'app':name}, replica),
            size=replica,
            creator=creator,
            app=name
        }
        for replica in range(1, replicas+1)
    ]
    group(*[
        gcloud.delete_kube_by_name(
                'rc/'+replication_controller_name(a, replica))
        gcloud.delete_kube_by_name(
                'svc/'+service_name(a, replica))
        gcloud.delete_disk(disk_name(a, replica))
        gcloud.delete_ip(ip_name(a, replica))
        gcloud.delete_dns_record(host_name(a, replica))
            for replica in range(1, replicas+1)
    ])().collect()

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
