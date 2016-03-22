from oauth2client.client import GoogleCredentials
from googleapiclient import discovery
from googleapiclient.errors import HttpError

import time

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'
START_DISK_SIZE = 50

class Gcloud:
  def __init__(self):
    credentials = GoogleCredentials.get_application_default()
    self.compute = discovery.build('compute', 'v1', credentials=credentials)

  def wait_for_region_operation(self, project, region, operation):
    print('Waiting for operation to finish...')
    while True:
      result = self.compute.regionOperations().get(
      region=region,
      project=project,
      operation=operation).execute()

      if result['status'] == 'DONE':
        print("done.")
      if 'error' in result:
        raise Exception(result['error'])
      return result

      time.sleep(1)

  def delete_ip(self, name):
    try:
        result = self.compute.addresses().delete(
        project=GCLOUD_PROJECT,
        region=GCLOUD_REGION,
        address=name
        ).execute()
        return True
    except HttpError, err:
      print 'Unable to delete IP %s' % err
      return False


  def reserve_ip(self, name):
    print 'Reserving IP address'
    result = self.compute.addresses().insert(
      project=GCLOUD_PROJECT,
      region=GCLOUD_REGION,
      body={
        "name": name
      }
    ).execute()

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
          print 'Waiting for IP...'

    print 'Got IP %s' % ip_address
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
        disk = self.compute.disks().delete(
            project=GCLOUD_PROJECT,
            zone=GCLOUD_ZONE,
            disk=name
        ).execute()
    except HttpError, e:
      if e.resp.status == 404:
        print 'Disk does not exist. Unable to delete'
      elif e.resp.status == 400:
        print 'Disk still in use. Unable to delete'
      else:
        raise


# Go Globals!
gcloud = Gcloud()
