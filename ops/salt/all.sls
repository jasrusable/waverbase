waverbase:
  user.present:
    - shell: /bin/zsh
    - home: /home/waverbase
  file.directory:
    - name: /waverbase
    - user: waverbase
    - group: waverbase
    - mode: 750

zsh:
  pkg.installed:
    - name: zsh
  file.managed:
    - name: /home/waverbase/.zshrc
    - source: salt://zshrc
    - user: waverbase
    - group: waverbase
    - mode: 640
    - require:
      - user: waverbase
      - file: waverbase

vim:
  pkg.installed

git:
  pkg.installed

htop:
  pkg.installed
