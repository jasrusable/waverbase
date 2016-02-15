#! /bin/bash
set -e
echo $GCLOUD_KEY
echo $GCLOUD_EMAIL
echo $GCLOUD_KEY | base64 --decode > gcloud.json
gcloud auth activate-service-account $GCLOUD_EMAIL --key-file gcloud.json
ssh-keygen -f ~/.ssh/google_compute_engine -N ""
