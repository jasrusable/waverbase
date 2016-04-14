FROM debian:jessie

RUN echo "deb http://debian.mirror.neology.co.za/debian jessie main\n"\
         "deb http://security.debian.org/ jessie/updates main contrib non-free\n"\
         "deb http://debian.mirror.neology.co.za/debian jessie-updates main \n"> /etc/apt/sources.list

RUN apt-get -y update && apt-get -y install \
  python3 \
  python3-pip \
  build-essential \
  git \
  python3-dev

RUN pip3 install pymongo
