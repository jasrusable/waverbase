import os
from celery import Celery
from common import connect_mongo

app = Celery(
    'task',
    broker=os.environ.get('BROKER', 'amqp://guest@localhost'))

def create_app(app, creator):
    pass
