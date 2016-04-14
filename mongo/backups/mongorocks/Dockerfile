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

RUN mkdir /mongorocks
WORKDIR /mongorocks

RUN wget "https://www.percona.com/downloads/percona-server-mongodb/percona-server-mongodb-3.0.10-1.5/binary/debian/jessie/x86_64/percona-server-mongodb-server_3.0.10-1.5.jessie_amd64.deb"
RUN wget "https://www.percona.com/downloads/percona-server-mongodb/percona-server-mongodb-3.0.10-1.5/binary/debian/jessie/x86_64/percona-server-mongodb-shell_3.0.10-1.5.jessie_amd64.deb"

RUN dpkg -i percona-server-mongodb-*
