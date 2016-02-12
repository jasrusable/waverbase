base:
  '*':
    - all
  'saltmaster.waverbase.com':
    - saltmaster
  'turnip.waverbase.com':
    - turnip
    - ssh_client
  'app*.waverbase.com':
    - app
    - ssh_client
