#!/bin/bash
kill $(ps a |grep mongod | grep port|cut -d ' ' -f 2) 2&> /dev/null

set -e

function ctrl_c {
    kill $(ps a |grep mongod | grep port|cut -d ' ' -f 2)
}

trap ctrl_c INT

rm -rf /tmp/mongo/{1,2,3}
mkdir /tmp/mongo/{1,2,3}
mongod --auth --dbpath /tmp/mongo/1 --port 27020 --keyFile ~/waverbase/mongo/mongo-keyfile --replSet rs0 > /tmp/mongo/1.log &
mongod --auth --dbpath /tmp/mongo/2 --port 27021 --keyFile ~/waverbase/mongo/mongo-keyfile --replSet rs0 > /tmp/mongo/2.log & 
mongod --auth --dbpath /tmp/mongo/3 --port 27022 --keyFile ~/waverbase/mongo/mongo-keyfile --replSet rs0 > /tmp/mongo/3.log
