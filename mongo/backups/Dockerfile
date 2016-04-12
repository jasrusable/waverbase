FROM debian:jessie

RUN apt-get -y update && apt-get -y install \
  curl \
  init-system-helpers \
  git \
  libsasl2-2 \
  wget

RUN mkdir /mongorocks
WORKDIR /mongorocks

RUN wget "https://www.percona.com/downloads/percona-server-mongodb/percona-server-mongodb-3.0.10-1.5/binary/debian/jessie/x86_64/percona-server-mongodb-server_3.0.10-1.5.jessie_amd64.deb"
RUN wget "https://www.percona.com/downloads/percona-server-mongodb/percona-server-mongodb-3.0.10-1.5/binary/debian/jessie/x86_64/percona-server-mongodb-shell_3.0.10-1.5.jessie_amd64.deb"

RUN dpkg -i percona-server-mongodb-*

RUN curl https://storage.googleapis.com/golang/go1.5.3.linux-amd64.tar.gz | tar xzf - -C /usr/local
RUN mkdir /go
RUN chmod 0777 /go

ENV PATH="/usr/local/go/bin:${PATH}:"
ENV GOPATH=/go

RUN go get github.com/facebookgo/rocks-strata/strata/cmd/mongo/lreplica_s3storage_driver/strata
RUN go install github.com/facebookgo/rocks-strata/strata/cmd/mongo/lreplica_s3storage_driver/strata

ENV PATH="/go/bin:${PATH}:"

USER mongod

RUN mkdir /tmp/db
# CMD mongod --dbpath /tmp/db --storageEngine rocksdb
