import sys
sys.path.append('gen-py')

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from app import AppService

class AppHandler(object):
  def getApp(self, name, creator):
    pass


  def initialiseApp(self, app):
    pass

  def getParseServerAddress(self, app):
    pass

  def getMongoAddress(self, app):
    pass

  def ping(self):
    return 'pong'


if __name__ == '__main__':
  handler = AppHandler()
  processor = AppService.Processor(handler)
 
  transport = TSocket.TServerSocket(port=9090)
  tfactory = TTransport.TBufferedTransportFactory()
  pfactory = TBinaryProtocol.TBinaryProtocolFactory()

  server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)
  server.serve()
