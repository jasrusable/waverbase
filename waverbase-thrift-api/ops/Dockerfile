FROM debian:latest
MAINTAINER "Pierre Hugo" <avoid3d@gmail.com>

RUN apt-get update
RUN apt-get upgrade

RUN apt-get install ssh --yes
RUN service ssh start
EXPOSE 22

RUN useradd -ms /bin/bash waverbase

RUN apt-get install --yes \
  build-essential \
  automake \
  python-dev \
  curl \
  ssh \
  libboost-all-dev \
  libssl-dev

RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install nodejs --yes

RUN npm install -g webpack

COPY ./thrift /home/waverbase/waverbase/thrift
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/thrift

WORKDIR /home/waverbase/waverbase/thrift
RUN ./configure --with-cpp --with-nodejs
RUN make -j `nproc` install

USER waverbase
