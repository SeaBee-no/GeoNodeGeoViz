from django.urls import include,path
from .views import *
from rest_framework import routers


urlpatterns = [

    path('droneViz/', droneViz, name='droneViz'),
    path('api/dronproject/projectinfo', get_dronelogbook_flight_project_info.as_view(), name='get_project_info'),
    path('api/droneViz/layerlist', get_droneFlight_geonode_info.as_view(), name='get_geonode_layer_list'),


]