from oauth2client.client import GoogleCredentials
from googleapiclient import discovery
from googleapiclient.errors import HttpError

import time
import logging

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'
GCLOUD_DNS_ZONE = 'waverbase'
START_DISK_SIZE = 50

class Gcloud:
  def __init__(self):
    credentials = GoogleCredentials.get_application_default()
    self.compute = discovery.build('compute', 'v1', credentials=credentials)
    self.dns = discovery.build('dns', 'v1', credentials=credentials)

  def wait_for_region_operation(self, project, region, operation):
    logging.debug('Waiting for operation to finish...')
    while True:
      result = self.compute.regionOperations().get(
      region=region,
      project=project,
      operation=operation).execute()

      if result['status'] == 'DONE':
        logging.debug("done.")
        if 'error' in result:
          raise Exception(result['error'])
        return result

      time.sleep(1)

  def add_dns_record(self, host, ip):
    logging.debug('Creating DNS A record for %s' % host)
    changes = self.dns.changes()
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

  def delete_dns_record(self, host):
    logging.debug('Deleting DNS record')
    recordsResource = self.dns.resourceRecordSets()
    records = recordsResource.list(
      project=GCLOUD_PROJECT,
      managedZone=GCLOUD_DNS_ZONE,
      name='%s.' % host,
      type='A'
      ).execute()['rrsets']
    print(records)
    if records:
        changesResource = self.dns.changes()
        changesResource.create(
        project=GCLOUD_PROJECT,
        managedZone=GCLOUD_DNS_ZONE,
        body={
            "kind": "dns#change",
            "deletions": records 
        }).execute()
    else:
      logging.debug('No records to remove')

  def delete_ip(self, name):
    try:
        result = self.compute.addresses().delete(
        project=GCLOUD_PROJECT,
        region=GCLOUD_REGION,
        address=name
        ).execute()
        return True
    except HttpError, err:
      logging.error('Unable to delete IP %s' % err)
      return False


  def reserve_ip(self, name):
    logging.info('Reserving IP address')
    try:
        result = self.compute.addresses().insert(
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
        result = self.compute.addresses().get(
        project=GCLOUD_PROJECT,
        region=GCLOUD_REGION,
        address=name
        ).execute()

        ip_address = result.get('address')
        time.sleep(1)
        if not ip_address:
          logging.debug('Waiting for IP...')

    logging.info('Got IP %s' % ip_address)
    return ip_address

  def reserve_disk(self, name, size):
    disk = self.compute.disks().insert(
        project=GCLOUD_PROJECT,
        zone=GCLOUD_ZONE,
        body={
          "sizeGb": str(size),
          "name": name,
        }
    ).execute()

  def delete_disk(self, name):
    try:
      self.compute.disks().delete(
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


# Go Globals!
gcloud = Gcloud()
