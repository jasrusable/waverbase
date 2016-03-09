import os
from twisted.application import service, strports
from twisted.conch.ssh.factory import SSHFactory
from twisted.cred.portal import IRealm
from twisted.cred.error import UnauthorizedLogin
from twisted.conch.ssh.keys import  Key
from twisted.conch.ssh import userauth
from twisted.conch import avatar
from lazr.sshserver.session import DoNothingSession
from twisted.conch.interfaces import ISession
from twisted.conch.checkers import (
    ICredentialsChecker,
    SSHPublicKeyDatabase,
)
from twisted.python import components
from twisted.cred.portal import Portal
from zope.interface import implements


class ParsnipSSHAvatar(avatar.ConchUser):
    def __init__(self, user_dict, service):
        pass

    def logout(self):
        #TODO: notify
        pass


class ParsnipSSHRealm(object):
    implements(IRealm)

    def __init__(self, service):
        self.service = service

    def requestAvatar(self, avatar_id, mind, *interfaces):
        user_dict = {}
        avatar = ParsnipSSHAvatar(user_dict, self.service)
        return (interfaces[0], avatar, avatar.logout)


class UserDisplayedUnauthorizedLogin(UnauthorizedLogin):
    """UnauthorizedLogin which should be reported to the user."""


class PublicKeyWaverbaseChecker(SSHPublicKeyDatabase):
    implements(ICredentialsChecker)

    def checkKey(self, credentials):
        """Check whether `credentials` is a valid request to authenticate.

        We check the key data in credentials against the keys the named user
        has registered in Launchpad.
        """
        if (username != 'git'):
            raise UserDisplayedUnauthorizedLogin(
                "Please use the user 'git'."
            )
        if (credentials.algName != 'ssh-rsa'):
            raise UserDisplayedUnauthorizedLogin(
                "Please use ssh-rsa algorithm."
            )
        publicKey = b64encode(credentials.blob)

        raise UserDisplayedUnauthorizedLogin(
            "Your SSH key does not match any key registered for Waverbase."
        )


class ParsnipSSHUserAuthServer(userauth.SSHUserAuthServer):
    pass


class ParsnipSSHFactory(SSHFactory):
    def __init__(self, portal, private_key, public_key, banner, moduli_path):
        # The portal used to turn credentials into users.
        # Although 'portal' isn't part of the defined interface for
        # `SSHFactory`, defining it here is how the `SSHUserAuthServer` gets
        # at it. (Look for the line
        # "self.portal = self.transport.factory.portal").
        self.portal = portal
        self._private_key = private_key
        self._public_key = public_key
        self._banner = banner
        self._moduli_path = moduli_path
        self.services['ssh-userauth'] = self._makeAuthServer

    def _makeAuthServer(self, *args, **kwargs):
        kwargs['banner'] = self._banner
        return ParsnipSSHUserAuthServer()

    def buildProtocol(self, address):
        transport = SSHFactory.buildProtocol(self, address)
        transport._realConnectionLost = transport.connectionLost
        transport.connectionLost = (
            lambda reason: self.connectionLost(transport, reason)
        )
        #notify(events.UserConnected(transport, address))
        print('notify user connected %s %s' % (transport, address))
        return transport

    def connectionLost(self, transport, reason):
        try:
            return transport._realConnectionLost(reason)
        finally:
            # Conch's userauth module sets 'avatar' on the transport if the
            # authentication succeeded. Thus, if it's not there,
            # authentication failed. We can't generate this event from the
            # authentication layer since:
            #
            # a) almost every SSH login has at least one failure to
            # authenticate due to multiple keys on the client-side.
            #
            # b) the server doesn't normally generate a "go away" event.
            # Rather, the client simply stops trying.
            if getattr(transport, 'avatar', None) is None:
                print('Auth failed')
                #notify(events.AuthenticationFailed(transport))
            #notify(events.UserDisconnected(transport))
            print('UserDisconnected')

    def getPublicKeys(self):
        return {'ssh-rsa': self._public_key}

    def getPrivateKeys(self):
        return {'ssh-rsa': self._private_key}

    def getPrimes(self):
        if (self._moduli_path):
            return primes.parseModuliFile(self._moduli_path)
        else:
            return None

class ParsnipSSHService(service.Service):
    def _makePortal(self):
        realm = ParsnipSSHRealm(self)
        return Portal(realm, checkers=[PublicKeyWaverbaseChecker])

    def __init__(self,
                 private_key_path,
                 public_key_path,
                 moduli_path=None,
                 banner=None):
        portal = self._makePortal()
        ssh_factory = ParsnipSSHFactory(
            portal,
            private_key=Key.fromFile(private_key_path),
            public_key=Key.fromFile(public_key_path),
            banner=banner,
            moduli_path=moduli_path
        )
        self.service = strports.service('tcp:22', ssh_factory)

    def startService(self):
        """Start the SSH service."""
        # self.manager = accessLog.LoggingManager(
        #     logging.getLogger(self._main_log),
        #     logging.getLogger(self._access_log_path),
        #     self._access_log_path,
        # )
        # notify(events.ServerStarting())
        print('server starting')

        # By default, only the owner of files should be able to write to them.
        # Perhaps in the future this line will be deleted and the umask
        # managed by the startup script.
        os.umask(0022)

        service.Service.startService(self)
        self.service.startService()

    def stopService(self):
        """Stop the SSH service."""
        deferred = gatherResults([
            defer.maybeDeferred(service.Service.stopService, self),
            defer.maybeDeferred(self.service.stopService),
        ])

        def log_stopped(ignored):
            print('server stopped')
            #notify(events.ServerStopped())&
            #self.manager.tearDown()
            return ignored

        return deferred.addBoth(log_stopped)


class ParsnipSSHSession(DoNothingSession):
    pass

components.registerAdapter(ParsnipSSHSession, ParsnipSSHAvatar, ISession)
