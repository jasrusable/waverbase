turnip:
  file.managed:
    - name: /waverbase/turnip_deploy_key
    - contents_pillar: turnip_deploy_key
    - makedirs: True
    - user: waverbase
    - group: waverbase
    - mode: 400
  git.latest:
    - name: git@github.com:Waverbase/turnip.git
    - rev: master
    - target: /waverbase/turnip
    - identity:
      - /waverbase/turnip_deploy_key
    - require:
      - file: turnip
      - pkg: git
