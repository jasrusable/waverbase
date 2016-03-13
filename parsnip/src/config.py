from __future__ import unicode_literals
import os
import yaml


class ParsnipConfig(object):
    """Return configuration from environment or defaults."""

    def __init__(self):
        """Load default configuration from config.yaml"""
        config_file_path = os.path.join(
            os.path.dirname(__file__),
            'config.yaml',
        )
        config_file = open(config_file_path)
        self.defaults = yaml.load(config_file)

    def get(self, key):
        return os.getenv(key.upper()) or self.defaults.get(key.lower()) or ''