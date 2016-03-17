Build our custom thrift compiler binary.

  cd thrift
  ./bootstrap.sh
  ./configure --with-cpp --with-nodejs
  make -j `nproc`

Install webpack globally

  npm install -g webpack-dev-server webpack

Install npm dependencies

  npm install

Run the frontend-dev-server

  cd waverbase-www
  webpack-dev-server

Run the backend server

  cd waverbase-api
  webpack --watch --colors --progress
  when-changed -r build/ -c node build/backend.js
