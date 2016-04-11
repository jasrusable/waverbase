from plumbum import local, FG, ProcessExecutionError
import logging

from tasks import app

kubectl = local["kubectl"]

@app.task
def create_kube_from_template(self, file_name, args):
  template = open(file_name).read() % args
  logging.info((kubectl["create", "-f", "-", "--logtostderr"] << template)())

@app.task
def delete_kube_by_name(self, name):
  try:
      logging.info((kubectl["delete", name])())
      return True
  except ProcessExecutionError:
    return False
