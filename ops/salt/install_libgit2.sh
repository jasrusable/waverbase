cd /tmp
wget https://github.com/libgit2/libgit2/archive/v0.23.4.tar.gz
tar xzf v0.23.4.tar.gz
cd libgit2-0.23.4/
cmake .
make
sudo make install
