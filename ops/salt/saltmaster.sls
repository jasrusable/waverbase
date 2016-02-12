ssh:
  file.managed:
    - contents_pillar: saltmaster_ssh_key
    - name: /waverbase/saltmaster_ssh_key
    - user: waverbase
    - group: waverbase
    - mode: 400
    - require:
      - user: waverbase
      - file: waverbase
