FROM node:5.8

COPY parse /parse-server

WORKDIR /parse-server
RUN npm install 

ENTRYPOINT [ "/parse-server/bin/parse-server" ]
