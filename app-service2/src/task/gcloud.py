from oauth2client.client import GoogleCredentials
from googleapiclient import discovery
from googleapiclient.errors import HttpError

import logging
import time

from task import app

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'
GCLOUD_DNS_ZONE = 'waverbase'

credentials = GoogleCredentials.get_application_default()
compute = discovery.build('compute', 'v1', credentials=credentials)
dns = discovery.build('dns', 'v1', credentials=credentials)

@app.task
def reserve_ip(name):
    logging.info('Reserving IP address')
    try:
        result = compute.addresses().insert(
            project=GCLOUD_PROJECT,
            region=GCLOUD_REGION,
            body={
                "name": name
            }
        ).execute()
    except HttpError, e:
      if e.resp.status == 409:
        logging.debug('IP address %s already exists. Reusing' % name)
      else:
        raise

    ip_address = None

    while ip_address is None:
        result = compute.addresses().get(
            project=GCLOUD_PROJECT,
            region=GCLOUD_REGION,
            address=name
        ).execute()

        ip_address = result.get('address')
        # BAD
        time.sleep(1)
        if not ip_address:
          logging.debug('Waiting for IP...')

    logging.info('Got IP %s' % ip_address)
    return ip_address

@app.task
def delete_ip(name):
  try:
      result = compute.addresses().delete(
      project=GCLOUD_PROJECT,
      region=GCLOUD_REGION,
      address=name
      ).execute()
      return True
  except HttpError, err:
    logging.error('Unable to delete IP %s' % err)
    return False

@app.task
def reserve_disk(name, size):
  disk = compute.disks().insert(
      project=GCLOUD_PROJECT,
      zone=GCLOUD_ZONE,
      body={
        "sizeGb": str(size),
        "name": name,
      }
  ).execute()
  return disk

@app.task
def delete_disk(name):
  try:
    return compute.disks().delete(
          project=GCLOUD_PROJECT,
          zone=GCLOUD_ZONE,
          disk=name
      ).execute()
  except HttpError, e:
    if e.resp.status == 404:
      logging.debug('Disk does not exist. Unable to delete')
    elif e.resp.status == 400:
      logging.debug('Disk in use.')
    else:
      raise

@app.task
def add_dns_record(host, ip):
  logging.debug('Creating DNS A record for %s' % host)
  changes = dns.changes()
  changes.create(
    project=GCLOUD_PROJECT,
    managedZone='waverbase',
    body={
      "kind": "dns#change",
      "additions": [
        {
          "rrdatas": [ip],
          "type":"A",
          "name": host+'.',
          "ttl": 5,
          "kind": "dns#resourceRecordSet"
        }
      ]
    }).execute()

@app.task
def delete_dns_record(host):
  logging.debug('Deleting DNS record')
  recordsResource = dns.resourceRecordSets()
  records = recordsResource.list(
    project=GCLOUD_PROJECT,
    managedZone=GCLOUD_DNS_ZONE,
    name='%s.' % host,
    type='A'
    ).execute()['rrsets']
  print(records)
  if records:
      changesResource = dns.changes()
      changesResource.create(
      project=GCLOUD_PROJECT,
      managedZone=GCLOUD_DNS_ZONE,
      body={
          "kind": "dns#change",
          "deletions": records
      }).execute()
  else:
    logging.debug('No records to remove')
