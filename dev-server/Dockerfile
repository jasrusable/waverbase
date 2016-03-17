FROM debian:8.3

RUN apt-get update --yes

RUN apt-get upgrade --yes

#TODO: --yes
RUN apt-get install build-essential -y

RUN apt-get install --yes curl
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install --yes nodejs

RUN apt-get install ssh --yes

RUN npm install -g nuclide

EXPOSE 22
cmd ["/usr/sbin/sshd", "-D"]
