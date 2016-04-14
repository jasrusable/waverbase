import click
import logging
import sys
import imp
from os import path
import inspect


logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


SERVICES = {
    'app-service': './app-service2/ops/service.py',
    'website-service': './website-service/ops/service.py',
}


_SERVICES = {}


def load_service(name, filename):
    logger.info('Loading {0} from {1}'.format(name, filename))
    module = imp.load_source(name, filename)
    return module.Service()


def get_service(service):
    if (service not in _SERVICES):
        click.echo(click.style('Service {0} not defined.'.format(service), fg='red'))
        sys.exit(-1)
    return _SERVICES[service]


@click.group()
@click.option('--debug', default=False, is_flag=True, help='Verbose logging.')
def cli(debug):
    if debug:
        click.echo(click.style('Using debug log level.', fg='green'))
        logger.setLevel(logging.DEBUG)

@click.command()
@click.argument('service')
def build(service):
    """Builds the service image."""
    click.echo('Buliding service {0}.'.format(service))
    service = get_service(service)
    service.build()

@click.command()
@click.argument('service')
def test(service):
    """Test the service image."""
    click.echo('Testing service {0}.'.format(service))
    service = get_service(service)
    service.test()

@click.command()
@click.argument('service')
def run(service):
    """Run the service image using docker-compose."""
    click.echo('Running service {0}.'.format(service))
    service = get_service(service)
    service.run()

@click.command()
@click.argument('service')
def push(service):
    """Pushes the service image to the Google Container Registry."""
    click.echo('Pushing service {0}.'.format(service))
    service = get_service(service)
    service.push()

@click.command()
@click.argument('service')
def deploy(service):
    """Deploys the service image to kubernetes."""
    click.echo('Deploying service {0}.'.format(service))
    service = get_service(service)
    service.deploy()

@click.command()
@click.argument('service')
def smoke_test(service):
    """Smoke tests the service deployed to kubernetes."""
    click.echo('Smoke testing service {0}.'.format(service))
    service = get_service(service)
    service.smoke_test()

@click.command()
@click.argument('service')
def install_dependencies_on_host(service):
    """Installs the service dependencies on host."""
    click.echo('Installing service {0} dependencies on host.'.format(service))
    service = get_service(service)
    service.install_dependencies_on_host()

@click.command()
@click.argument('service')
def run_on_host(service):
    """Runs the service on host."""
    click.echo('Running service {0} on host.'.format(service))
    service = get_service(service)
    service.run_on_host()

def main():
    for name, filename in SERVICES.items():
        current_directory = path.dirname(path.abspath(inspect.getfile(inspect.currentframe())))
        base_directory = path.join(current_directory, '../../../')
        _SERVICES[name] = load_service(name, path.join(base_directory, filename))

    cli.add_command(build)
    cli.add_command(test)
    cli.add_command(run)
    cli.add_command(push)
    cli.add_command(deploy)
    cli.add_command(smoke_test)
    cli.add_command(install_dependencies_on_host)
    cli.add_command(run_on_host)
    cli()


if __name__ == '__main__':
    main()
