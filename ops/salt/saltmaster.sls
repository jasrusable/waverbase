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
  file.managed:
    - template: jinja
    - source: salt://saltmaster_ssh_config.jinja
    - name: /waverbase/.ssh/config
    - user: waverbase
    - group: waverbase
    - mode: 644
    - require:
      - user: waverbase
