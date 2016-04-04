from twisted.application import service
from twisted.scripts.twistd import ServerOptions

from log import RotatableFileLogObserver
from config import ParsnipConfig
from ssh import ParsnipSSHService

def getSSHService():
  config = ParsnipConfig()

  return ParsnipSSHService(
    private_key_path=config.get('private_ssh_key_path'),
    public_key_path=config.get('public_ssh_key_path'),

  )

options = ServerOptions()
options.parseOptions()

application = service.Application('Parsnip SmartSSH Service')
# application.addComponent(
#     RotatableFileLogObserver(options.get('logfile')),
#     ignoreClass=1
# )
getSSHService().setServiceParent(application)
