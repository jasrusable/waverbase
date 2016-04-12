eval $(docker-machine env)
DOCKER_HOST_IP=$(echo $DOCKER_HOST| grep -E -o '\d{1,3}(\.\d{1,3}){3}')

REDIS_ID= $(docker run -d -p 6379:6379 redis:alpine)
export REDIS_SERVICE_HOST=$DOCKER_HOST_IP
export REDIS_SERVICE_HOST=6379

RABBIT_ID=$(docker run -d -p 4369:4369 -p 5671:5671 -p 5672:5672 rabbitmq)
export RABBITMQ_SERVICE_HOST=$DOCKER_HOST_IP
export RABBITMQ_SERVICE_PORT=5672

export MONGO_WAVER_SERVICE_HOST=127.0.0.1
export MONGO_WAVER_SERVICE_PORT=27017
cd src

mkdir -p /tmp/mongo-service
mongod  --dbpath /tmp/mongo-service 2>/dev/null > /dev/null &
MONGO_PID=$!

celery worker -A task &
CELERY_PID=$!

python service.py
docker stop $RABBIT_ID
docker stop $REDIS_IP

kill $MONGO_PID
kill $CELERY_PID
