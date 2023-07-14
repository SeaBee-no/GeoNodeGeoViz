import os
from django.apps import AppConfig


class DmcConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'geonode.dmc'
    label= 'geonode_dmc'


 
    # # enbable this code in prodcution
    def ready(self):
        #run_once = os.environ.get('.\')
        run_once = os.environ.get('CMDLINERUNNER_RUN_ONCE')
        if run_once is not None:
            return
        os.environ['CMDLINERUNNER_RUN_ONCE'] = 'True'
        from ..jobs import updater
        updater.start()
