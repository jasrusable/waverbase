import signal
import sys

from twisted.internet import reactor
from twisted.python import (
    log,
    logfile,
    )
from zope.interface import implements


class RotatableFileLogObserver:
    """A log observer that uses a log file and reopens it on SIGHUP."""

    implements(log.ILogObserver)

    def __init__(self, logfilepath):
        """Set up the logfile and possible signal handler.

        :param logfilepath: The path to the logfile. If None, stdout is used
            for logging and no signal handler will be installed.
        """
        if logfilepath is None:
            logFile = sys.stdout
            return
        else:
            logFile = logfile.LogFile.fromFullPath(
                logfilepath, rotateLength=None)
            # Override if signal is set to None or SIG_DFL (0)
            if not signal.getsignal(signal.SIGHUP):
                def signalHandler(signal, frame):
                    reactor.callFromThread(logFile.reopen)
                signal.signal(signal.SIGHUP, signalHandler)
        self.observer = log.FileLogObserver(logFile)

    def __call__(self, eventDict):
        self.observer.emit(eventDict)
