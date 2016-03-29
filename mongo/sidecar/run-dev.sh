export APP_NAME='book'
export CREATOR_NAME='yaseen'
export APP_SERVICE_SERVICE_HOST='127.0.0.1'
export APP_SERVICE_SERVICE_PORT=9090
# ensure kubectl proxy is running
export KUBERNETES_SERVICE_HOST=localhost
export KUBERNETES_SERVICE_PORT=8001
export KUBERNETES_PROTOCOL=http

forever -w src/index.js
