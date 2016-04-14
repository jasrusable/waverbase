import click
import subprocess
import inspect
from os import path
from waver_cli import BaseService
from waver_cli import GenericDockerMixin


current_directory = path.dirname(path.abspath(inspect.getfile(inspect.currentframe())))
service_root = path.join(current_directory, '../')


class Service(GenericDockerMixin, BaseService):
    def install_dependencies_on_host(self):
        # TODO: Memoise and uncomment.
        # subprocess.call('sudo npm install -g webpack'.split())
        subprocess.call('npm install'.split(), cwd=service_root)

    def run_on_host(self):
        subprocess.call('webpack-dev-server --watch'.split(), cwd=service_root)
