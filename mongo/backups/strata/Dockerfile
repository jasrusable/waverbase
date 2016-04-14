FROM debian:jessie

RUN echo "deb http://debian.mirror.neology.co.za/debian jessie main\n"\
         "deb http://security.debian.org/ jessie/updates main contrib non-free\n"\
         "deb http://debian.mirror.neology.co.za/debian jessie-updates main \n"> /etc/apt/sources.list

RUN apt-get -y update && apt-get -y install \
  curl \
  init-system-helpers \
  git \
  libsasl2-2 \
  wget

RUN curl https://storage.googleapis.com/golang/go1.5.3.linux-amd64.tar.gz | tar xzf - -C /usr/local
RUN mkdir /go
RUN chmod 0777 /go

ENV PATH="/usr/local/go/bin:${PATH}:"
ENV GOPATH=/go

RUN go get github.com/facebookgo/rocks-strata/strata/cmd/mongo/lreplica_s3storage_driver/strata
RUN go install github.com/facebookgo/rocks-strata/strata/cmd/mongo/lreplica_s3storage_driver/strata

ENV PATH="/go/bin:${PATH}:"
