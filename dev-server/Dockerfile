FROM debian:latest
MAINTAINER "Pierre Hugo" <avoid3d@gmail.com>

# Install packages
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install openssh-server sudo
ADD dev-server/set_root_pw.sh /set_root_pw.sh
ADD dev-server/run.sh /run.sh
RUN chmod +x /*.sh
RUN mkdir -p /var/run/sshd && sed -i "s/UsePrivilegeSeparation.*/UsePrivilegeSeparation no/g" /etc/ssh/sshd_config \
  && sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
  && touch /root/.Xauthority \
  && true

## Set a default user. Available via runtime flag `--user docker`
## User should also have & own a home directory, but also be able to sudo
RUN useradd docker \
        && passwd -d docker \
        && mkdir /home/docker \
        && chown docker:docker /home/docker \
        && addgroup docker sudo \
        && true

RUN apt-get install build-essential automake python-dev curl ssh --yes

RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install --yes nodejs

USER docker
WORKDIR /home/docker

RUN curl -OsL https://github.com/facebook/watchman/archive/v4.5.0.tar.gz
RUN tar xvf v4.5.0.tar.gz
RUN cd watchman-4.5.0 && ./autogen.sh
RUN cd watchman-4.5.0 && ./configure
RUN cd watchman-4.5.0 && sudo make install

RUN sudo npm install -g nuclide

USER root

ADD ../ /home/docker/waverbase

RUN apt-get install git vim zsh --yes
RUN chsh -s `which zsh` docker

USER docker
RUN sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)" || true
USER root

EXPOSE 22
EXPOSE 9090

RUN apt-get install mongodb --yes

EXPOSE 8080

RUN apt-get install supervisor --yes

USER docker
RUN sudo npm install -g webpack webpack-dev-server
RUN cd /home/waverbase/waverbase-www && npm install
USER root

ADD dev-server/run-copy.sh /run.sh

CMD ["/run.sh"]
