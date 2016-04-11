from oauth2client.client import GoogleCredentials
from googleapiclient import discovery
from googleapiclient.errors import HttpError

import logging

from tasks import app

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'
GCLOUD_DNS_ZONE = 'waverbase'

credentials = GoogleCredentials.get_application_default()
compute = discovery.build('compute', 'v1', credentials=credentials)
dns = discovery.build('dns', 'v1', credentials=credentials)

@app.task
def reserve_ip():
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

@app.task
def reserve_disk(self, name, size):
  disk = self.compute.disks().insert(
      project=GCLOUD_PROJECT,
      zone=GCLOUD_ZONE,
      body={
        "sizeGb": str(size),
        "name": name,
      }
  ).execute()
  return disk

@app.task
def delete_disk(self, name):
  try:
    return self.compute.disks().delete(
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

