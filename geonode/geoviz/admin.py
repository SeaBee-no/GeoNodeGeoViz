from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from django.shortcuts import redirect
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


# GeoViz Layer Sync - shows as a link under Geonode_Geoviz section
class GeoVizLayerSyncAdmin(admin.ModelAdmin):
    """Admin entry that redirects to the GeoViz Layer Sync page."""

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        return redirect('admin:geonode_sync')

admin.site.register(GeoVizLayerSync, GeoVizLayerSyncAdmin)