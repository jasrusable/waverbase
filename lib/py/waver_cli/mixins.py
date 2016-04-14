class GenericDockerMixin(object):
    def build(self):
        click.echo('Doing generic docker build.')

    def test(self):
        click.echo('Doing generic docker test.')

    def run(self):
        click.echo('Doing generic docker run.')

    def push(self):
        click.echo('Doing generic docker push.')

    def deploy(self):
        click.echo('Doing generic docker deploy.')
