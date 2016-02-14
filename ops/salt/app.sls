include:
  - node

app:
  file.managed:
    - name: /waverbase/parse_server_deploy_key
    - contents_pillar: parse_server_deploy_key
    - user: waverbase
    - group: waverbase
    - mode: 400
    - require:
      - user: waverbase
      - file: waverbase
  git.latest:
    - name: git@github.com:Waverbase/turnip.git
    - rev: master
    - target: /waverbase/parse_server
    - identity:
      - /waverbase/parse_server_deploy_key
    - require:
      - file: /waverbase/parse_server_deploy_key
      - pkg: git
  npm.bootstrap:
    - name: /waverbase/parse_server
    - require:
      - git: app
