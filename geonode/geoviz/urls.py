from django.urls import include,path
from .views import *
from rest_framework import routers


urlpatterns = [

    path('droneViz/', droneViz, name='droneViz'),
    path('api/droneViz/otterlist', get_mission_ottre_list.as_view(), name='get_project_info_otter'),
    path('api/dronproject/projectinfo', get_dronelogbook_flight_project_info.as_view(), name='get_project_info_DLB'),
    path('api/droneViz/layerlist', get_droneFlight_geonode_info.as_view(), name='get_geonode_layer_list_GN'),
    path('api/droneViz/layerlist/<str:dataset_id>/', get_droneFlight_geonodeLayer_info_byid.as_view(), name='get_geonode_layer_lsyer_byID_GN'),
    path('api/droneViz/minio/<str:bucket>/<path:fileWithPath>', get_download_url_by_bucket.as_view(), name='get_download_url_by_bucket_minio'),
]