from django.urls import include,path
from .views import *
from rest_framework import routers


urlpatterns = [

    path('droneViz/', droneViz, name='droneViz'),


]