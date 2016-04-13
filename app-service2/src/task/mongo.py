from task import app
from celery import group, chain
from celery.result import ResultBase
import logging

import gcloud
import k8s

@app.task(trail=True)
def add_mongo_replicas(name, creator, db_size, replicas=3):
    logging.error('Add mongo replicas')
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

    # TODO: figure out if k8s service has been created correctly

    # create the rc from all the resources we now have
    for i, ip_r in enumerate(ip_results):
      # wait for disk to be up
      args[i]['ip'] = ip = ip_r.get()
      logging.info('Got IP %s', ip)
      wait[i].get()

      args[i]['size'] = i+1
      gcloud.add_dns_record.delay(host_name(a, replica), ip)
      k8s.create_kube_from_template.delay(
          'mongo-service-template.yaml',
          args[i])
      k8s.create_kube_from_template.delay(
          'mongo-controller-template.yaml',
          args[i])

@app.task
def delete_mongo_replica(name, creator):
    # TODO: count the number of replicas
    replicas = 3
    tasks = []
    for r in range(1, replicas+1):
      a = {
              'hostname': host_name({'app':name}, r),
              'creator': creator,
              'app': name
          }
      tasks.extend([
        k8s.delete_kube_by_name.s(
                'rc/'+replication_controller_name(a, r)),
        k8s.delete_kube_by_name.s(
                'svc/'+service_name(a, r)),
        gcloud.delete_disk.s(disk_name(a, r)),
        gcloud.delete_ip.s(ip_name(a, r)),
        gcloud.delete_dns_record.s(host_name(a, r))
      ])

    group(*tasks).delay()

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
