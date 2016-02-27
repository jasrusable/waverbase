''' Mastery.

Usage:
  leader.py [CANDIDATES ...] [--script=SCRIPT]



This only works for a small number of candidates as each candidate will mae N^2 connections
with a thread for each.'''

import struct
import sys
from random import randint
from Queue import Queue
import pickle
import threading
import socket
import time

candidate_hosts = sys.argv[1:]
my_hostname = candidate_hosts[int(candidate_hosts[-1])-1]
candidate_hosts.pop(int(candidate_hosts[-1])-1)
candidate_hosts.pop(-1)

timeout = 10
CONNECT_TRIES = 4

# state where we tell all the candidates our number
TELLING_STATE = 1
# state where we tell all candidates who we think is the winner
WINNER_STATE = 2
# state where we tell all candidates whether we agree
AGREE_STATE = 3


# connect to all the candidates
class CandidateHandler:
    def __init__(self, host, port):
        self.send_queue = Queue()
        self.host = host
        self.port = port

    def connect(self):
        for i in xrange(CONNECT_TRIES):
            try:
                self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.sock.connect((self.host, self.port))
                SendThread(self.send_queue, self.sock).start()
            except socket.error:
                print 'Could not connect to %s, retrying' % str(self)
                if i == CONNECT_TRIES-1:
                    raise
                time.sleep(3)

    def send(self, message):
        self.send_queue.put(message)

    def __str__(self):
        return '%s:%d' % (self.host, self.port)

class LeaderElection:
    def __init__(self, port):
        self.round = 1
        self.state = TELLING_STATE
        self.listen(port)
        self.connect_candidates()
        self.elect()

    def listen(self, port):
        self.receive_queue = Queue()
        ReceiveThread(self.receive_queue, port).start()

    def connect_candidates(self):
        self.candidates = {}
        for candidate_host in candidate_hosts:
            host, port = candidate_host.split(':')
            port = int(port)
            candidate = CandidateHandler(host, port)
            candidate.connect()
            self.candidates[candidate_host] = candidate

    def sendAll(self, message):
        for candidate in self.candidates.itervalues():
            candidate.send(message)

    def receiveAll(self, expected_type):
        print 'Waiting for all messages of type', expected_type
        messages = []
        for i in xrange(len(self.candidates)):
            c, message = self.receive_queue.get(timeout)
            candidate = self.candidates[c]
            if message[0] != expected_type:
                raise Exception('%s:%s had type of %s instead of %s' % (candidate.host, candidate.port, message[0], expected_type))
            messages.append((candidate, message[1:]))
        return messages

    def tellState(self):
        self.state = TELLING_STATE
        self.number = randint(1, 1e6)
        print 'In telling state. My number is ', self.number
        self.sendAll(('my number is', self.number))

    def winnerState(self):
        print 'In winner state'
        self.state = WINNER_STATE
        messages = self.receiveAll('my number is')
        highest_candidate, highest_number = ME, self.number
        for candidate, number in messages:
            number = number[0]
            print 'Candidate %s has number %d' % (str(candidate), number)
            if number == highest_number:
                raise Exception('two candidates guessed the same number :( handle this better. we can just restart')
            if number > highest_number:
                highest_candidate, highest_number = candidate, number

        self.sendAll(('i think', str(highest_candidate), 'is the winner'))

        return highest_candidate

    def agreeState(self, my_winner):
        print 'In agree state. I think', my_winner, 'is the winner'
        self.state = AGREE_STATE
        winners = self.receiveAll('i think')
        for candidate, winner in winners:
            if winner[0] != str(my_winner):
                raise Exception('%s thought %s not %s was the winner' % (candidate, winner, str(my_winner)))
        print 'Everyone agrees'

    def elect(self):
        self.tellState()
        winner = self.winnerState()
        self.agreeState(winner)
        return winner

class ReceiveThread(threading.Thread):
    def __init__(self, queue, port):
        threading.Thread.__init__(self)
        self.daemon = True
        self.queue = queue
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.bind(('0.0.0.0', port))
        self.port = port

    def run(self):
        self.socket.listen(1)
        print 'Listening on port %d' % self.port
        while True:
            sock, addr = self.socket.accept()
            ReceiveSocketThread(self.queue, sock).start()


class ReceiveSocketThread(threading.Thread):
    def __init__(self, queue, sock):
        threading.Thread.__init__(self)
        self.daemon = True
        self.queue = queue
        self.socket = sock

    def run(self):
        data = b''
        length = 0
        while True:
            try:
                data += self.socket.recv(4096)
            except EOFError:
                print 'EOFError in receivesocketthread'
                return
            # if we have not parsed a length field yet
            if length == 0 and len(data) >= 4:
                length = struct.unpack('>L', data[0:4])[0]
            # if we have all the data
            if len(data)+4 >= length:
                message = data[4:length+4]
                self.queue.put(pickle.loads(message))
                data = data[length+4:]
                length = 0
        

class SendThread(threading.Thread):
    def __init__(self, queue, sock):
        threading.Thread.__init__(self)
        self.daemon = True
        self.queue = queue
        self.socket = sock

    def send(self, data):
        raw_message = pickle.dumps(data)
        self.socket.sendall(struct.pack('>L', len(raw_message)))
        try:
            self.socket.sendall(raw_message)
        except EOFError:
            print 'EOFError in sendthread'
            return


    def run(self):
        while True:
            message = self.queue.get()
            self.send([my_hostname, message])

my_host, my_port = my_hostname.split(':')
my_port = int(my_port)
ME = CandidateHandler(my_host, my_port)


if __name__ == '__main__':
    LeaderElection(my_port)
