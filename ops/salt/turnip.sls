turnip:
  file.managed:
    - contents_pillar: turnip_deploy_key
    - user: waverbase
    - group: waverbase
    - mode: 400
  git.latest:
    - name: git@github.com:Waverbase/turnip.git
    - rev: master
    - identity:
      - /waverbase/turnip-deploy-key
    - require:
      - file: turnip
