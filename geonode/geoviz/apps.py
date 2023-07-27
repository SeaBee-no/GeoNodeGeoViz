from django.apps import AppConfig
import os

class GeovizConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'geonode.geoviz'
    label= 'geonode_geoviz'


    # # enbable this code in prodcution
    def ready(self):
        #run_once = os.environ.get('.\')
        run_once = os.environ.get('getGNayers_RUN_ONCE')
        if run_once is not None:
            return
        os.environ['getGNayers_RUN_ONCE'] = 'True'
        from ..jobs import updater
        updater.start_GN_layers()