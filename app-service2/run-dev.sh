eval $(docker-machine env)
RABBIT_ID=$(docker run -d -p 4369:4369 -p 5671:5671 -p 5672:5672 rabbitmq)

export RABBITMQ_SERVICE_HOST=$(echo $DOCKER_HOST| grep -E -o '\d{1,3}(\.\d{1,3}){3}')
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
kill $MONGO_PID
kill $CELERY_PID
