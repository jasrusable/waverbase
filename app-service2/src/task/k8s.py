from plumbum import local, FG, ProcessExecutionError
import logging
import os.path

from task import app

kubectl = local["kubectl"]

@app.task
def create_kube_from_template(file_name, args):
  template = open(os.path.join('..', file_name)).read() % args
  logging.info((kubectl["create", "-f", "-", "--logtostderr"] << template)())

@app.task
def delete_kube_by_name(name):
  try:
      logging.info((kubectl["delete", name])())
      return True
  except ProcessExecutionError:
    return False
