import celery
import os

broker = 'amqp://guest@%s:%s/' % (
    os.environ['RABBITMQ_SERVICE_HOST'],
    os.environ['RABBITMQ_SERVICE_PORT']
    )
result_backend = 'redis://%s:%s' % (
    os.environ['REDIS_SERVICE_HOST'],
    os.environ['REDIS_SERVICE_PORT']
    )
app = celery.Celery('tasks', broker=broker, backend=backend)

from create_app import create_app
import gcloud
import k8s
import mongo

