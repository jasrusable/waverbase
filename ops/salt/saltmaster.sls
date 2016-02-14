ssh_config:
  file.managed:
    - template: jinja
    - source: salt://saltmaster_ssh_config.jinja
    - name: /home/waverbase/.ssh/config
    - user: waverbase
    - group: waverbase
    - makedirs: True
    - mode: 644
    - require:
      - user: waverbase

ssh:
  ssh_auth.present:
    - user: waverbase
    - enc: ssh-rsa
    - names:
      - {{pillar['avoid3d_ssh_public_key']}}
      - {{pillar['yaseen_ssh_public_key']}}
  file.managed:
    - contents_pillar: saltmaster_ssh_key
    - name: /waverbase/saltmaster_ssh_key
    - user: waverbase
    - group: waverbase
    - mode: 400
    - require:
      - user: waverbase
      - file: waverbase
