cmake:
  pkg.installed

pygit2:
  cmd.run:
    - creates: /usr/local/lib/libgit2.so
    - require:
      - pkg.installed: cmake
    - name: |
      cd /tmp
      wget https://github.com/libgit2/libgit2/archive/v0.23.4.tar.gz
      tar xzf v0.23.4.tar.gz
      cd libgit2-0.23.4/
      cmake .
      make
      sudo make install

turnip:
  file.managed:
    - name: /waverbase/turnip_deploy_key
    - contents_pillar: turnip_deploy_key
    - user: waverbase
    - group: waverbase
    - mode: 400
    - require:
      - file: waverbase
  git.latest:
    - name: git@github.com:Waverbase/turnip.git
    - rev: master
    - target: /waverbase/turnip
    - identity:
      - /waverbase/turnip_deploy_key
    - require:
      - file: turnip
      - pkg: git
  pkg.installed:
    - pkgs:
      - python-pip
      - python-virtualenv
      - python-dev
      - libgmp3-dev
      - libffi-dev
  virtualenv.managed:
    - name: /waverbase/turnip_venv
    - system_site_packages: False
    - requirements: salt://turnip_requirements.txt
    - require:
      - pkg: turnip
