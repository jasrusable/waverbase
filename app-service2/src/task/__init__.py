import celery
import os

broker='amqp://guest@%s:%s/' % (
    os.environ['RABBITMQ_SERVICE_HOST'],
    os.environ['RABBITMQ_SERVICE_PORT']
    )
app = celery.Celery('tasks', broker=broker)

from create_app import create_app
import gcloud
import k8s
import mongo

