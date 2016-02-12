ssh_client:
  ssh_auth.present:
    - user: waverbase
    - enc: ssh-rsa
    - name: {{pillar['saltmaster_ssh_public_key']}}
