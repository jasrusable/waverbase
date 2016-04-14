class BaseService(object):
    def build(self):
        raise NotImplementedError('Service has not implemented build.')

    def test(self):
        raise NotImplementedError('Service has not implemented test.')

    def run(self):
        raise NotImplementedError('Service has not implemented run.')

    def push(self):
        raise NotImplementedError('Service has not implemented push.')

    def deploy(self):
        raise NotImplementedError('Service has not implemented deploy.')

    def smoke_test(self):
        raise NotImplementedError('Service has not implemented smoke_test.')

    def run_on_host(self):
        raise NotImplementedError('Service has not implemented run_on_host.')

    def install_dependencies_on_host(self):
        raise NotImplementedError('Service has not implemented install_dependencies_on_host.')
