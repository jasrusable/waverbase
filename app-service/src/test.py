
from oauth2client.client import GoogleCredentials
from googleapiclient import discovery
from googleapiclient.errors import HttpError

GCLOUD_ZONE = 'europe-west1-b'
GCLOUD_REGION = 'europe-west1'
GCLOUD_PROJECT = 'api-project-1075799951054'
GCLOUD_DNS_ZONE = 'waverbase'

google_credentials = GoogleCredentials.get_application_default()

dns = discovery.build('dns', 'v1', credentials=google_credentials)
recordsResource = dns.resourceRecordSets()

records = recordsResource.list(
    project=GCLOUD_PROJECT,
    managedZone=GCLOUD_DNS_ZONE,
    name='waverbase.com.',
    type='A'
).execute()

print(records)
