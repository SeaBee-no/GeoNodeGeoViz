from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from .models import *
from import_export import resources



class seabee_otter_mission_Resource(resources.ModelResource):
    class Meta:
        model = seabee_otter_mission
        import_id_fields = ('mission_id',)


class seabee_otter_mission_Admin(ImportExportModelAdmin):
    resource_class= seabee_otter_mission_Resource
    list_display = ('mission_id','location_name','project_name')
    search_fields = ('location_name','project_name')
    
admin.site.register(seabee_otter_mission,seabee_otter_mission_Admin )