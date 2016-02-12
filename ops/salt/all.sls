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
  pkg.installed

vim:
  pkg.installed

git:
  pkg.installed

htop:
  pkg.installed
