FROM ubuntu:14.04

MAINTAINER avoid3d@gmail.com

RUN apt-get update -y

RUN apt-get upgrade -y

RUN apt-get install python python-pip python-dev libgmp3-dev \
  libffi-dev wget cmake -y

RUN cd /tmp \
  && wget https://github.com/libgit2/libgit2/archive/v0.23.4.tar.gz \
  && tar xzf v0.23.4.tar.gz \
  && cd libgit2-0.23.4/ \
  && cmake . \
  && make \
  && sudo make install

RUN ldconfig

RUN pip install Naked==0.1.31
RUN pip install PyYAML==3.11
RUN pip install Twisted==15.5.0
RUN pip install argparse==1.2.1
RUN pip install cffi==1.5.0
RUN pip install gmpy==1.17
RUN pip install lazr.sshserver==0.1.4
RUN pip install pyasn1==0.1.9
RUN pip install pycparser==2.14
RUN pip install pycrypto==2.6.1
RUN pip install pygit2==0.23.3
RUN pip install requests==2.9.1
RUN pip install shellescape==3.4.1
RUN pip install wsgiref==0.1.2
RUN pip install zope.component==4.2.2
RUN pip install zope.event==4.1.0
RUN pip install zope.interface==4.1.3

COPY ./turnip /waverbase/turnip

WORKDIR /waverbase/turnip

ENTRYPOINT ["twistd", "--nodaemon", "--python", "sshserver.tac"]
