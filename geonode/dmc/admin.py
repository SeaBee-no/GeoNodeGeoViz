from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from leaflet.admin import LeafletGeoAdmin
from .models import  *

# Register your models here.
# class dmc_main_Admin(ImportExportModelAdmin,SimpleHistoryAdmin,LeafletGeoAdmin):
#     #form = user_profilesForm
#     list_display = ('mision_name',)
#     search_fields = ('mision_name',)
# admin.site.register(dmc_main,dmc_main_Admin )


# class dmc_droneInfo_Admin(ImportExportModelAdmin,SimpleHistoryAdmin):
#     #form = user_profilesForm
#     list_display = ('model',)
#     search_fields = ('model',)
# admin.site.register(drone_info_list,dmc_droneInfo_Admin )

# class dmc_sensorInfo_Admin(ImportExportModelAdmin,SimpleHistoryAdmin):
#     #form = user_profilesForm
#     list_display = ('model',)
#     search_fields = ('model',)
# admin.site.register(sensor_info_list,dmc_sensorInfo_Admin )


# Register your models here.
class ddc_main_Admin(ImportExportModelAdmin,SimpleHistoryAdmin):
    #form = user_profilesForm
    list_display = ('flight_mission_name','flight_mission_guid')
    search_fields = ('flight_mission_name','flight_mission_guid')
admin.site.register(ddc_main,ddc_main_Admin )



# upload datat.
class ddc_upload_Admin(ImportExportModelAdmin,SimpleHistoryAdmin):
    #form = user_profilesForm
    list_display = ('flight_mission_guid',)
    search_fields = ('flight_mission_guid',)
admin.site.register(ddc_upload,ddc_upload_Admin )