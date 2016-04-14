FROM debian:jessie

RUN echo "deb http://debian.mirror.neology.co.za/debian jessie main\n"\
         "deb http://security.debian.org/ jessie/updates main contrib non-free\n"\
         "deb http://debian.mirror.neology.co.za/debian jessie-updates main \n"> /etc/apt/sources.list

RUN apt-get -y update && apt-get -y install \
  python3 \
  python3-pip \
  git \
  python3-dev

RUN git clone https://github.com/facebook/rocksdb.git
WORKDIR /rocksdb
RUN make -j `nproc` shared_lib
RUN make install-shared INSTALL_PATH=/usr

WORKDIR /

RUN pip3 install pyrocksdb
RUN pip3 install ipython

COPY ./backup.py /backup.py
