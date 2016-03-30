FROM debian:latest
MAINTAINER "Pierre Hugo" <avoid3d@gmail.com>

RUN useradd -ms /bin/bash waverbase

RUN apt-get update
RUN apt-get install --yes \
  build-essential \
  automake \
  python-dev \
  curl \
  flex \
  bison \
  pkg-config \
  libboost-all-dev \
  libssl-dev

RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install nodejs --yes

COPY ./thrift /home/waverbase/waverbase/thrift
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/thrift

RUN npm install -g webpack pm2

WORKDIR /home/waverbase/waverbase/thrift
RUN ./bootstrap.sh
RUN ./configure --with-cpp --with-nodejs
RUN make -j `nproc` install

COPY ./email-sender/package.json /home/waverbase/waverbase/email-sender/package.json
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/email-sender
WORKDIR /home/waverbase/waverbase/email-sender
USER waverbase
RUN npm install
USER root

EXPOSE 9098

COPY ./email-sender /home/waverbase/waverbase/email-sender
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/email-sender

WORKDIR /home/waverbase/waverbase/email-sender
CMD pm2 start ops/processes.json && \
    pm2 logs
