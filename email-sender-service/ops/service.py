from waver_cli.service import BaseService
from waver_cli.mixins import GenericDockerMixin



class Service(GenericDockerMixin, BaseService):
    def build(self):
        click.echo('Doing custom build stuff...')
