from django.urls import include,path
from .views import *
from rest_framework import routers


urlpatterns = [

#path('api-auth/', include('rest_framework.urls')),
path('api/dronproject/', get_dronelogbook_flight_data_coustom_form.as_view(), name='get_drone_data'),
path('api/flight/<str:opration>/<str:guid>/', get_flight_mission.as_view(), name='get_flight'),
path('ddc/', ddc, name='ddc'),
path('ddclist/', ddc_list, name='ddclist'),

path('api/ddcreg/', dronelogBook_add.as_view(), name='ddcadd'),
path('api/ddcreg/<str:flight_mission_guid>/',  dronelogBook_update.as_view(), name='ddcupdate'),
path('api/ddcregcheck/<str:guid>/', dronelogBook_recordcheck.as_view(), name='ddccheck'),

path('api/uploadreg/', uploaddata_add.as_view(), name='uploadadd'),
path('api/uploadreg/<str:flight_mission_guid>/',  uploaddata_update.as_view(), name='uploadupdate'),
path('api/uploadregdel/<str:flight_mission_guid>/',  uploaddata_delete.as_view(), name='uploadregdel'),
path('api/miniodownload/<str:fileWithPath>/', get_download_url.as_view(), name='miniodownload'),
path('api/uploadregcheck/<str:guid>/', uploadData_recordcheck.as_view(), name='uploadcheck'),

path('api/geonodepublish/<str:filelocation>/', publish_to_geonode.as_view(), name='geonodepublish'),
path('api/jobstatus/<int:jobid>/', check_active_geonode_job.as_view(), name='jobstatus'),

]