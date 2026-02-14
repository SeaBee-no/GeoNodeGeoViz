from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from leaflet.admin import LeafletGeoAdmin
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from django.http import JsonResponse
import threading

from .models import *
from geonode.jobs.jobs import schedule_geonodeLayers_api, get_job_status


# Custom Admin View for triggering GeoNode sync
class GeonodeSyncAdminView(View):
    @method_decorator(staff_member_required)
    def get(self, request):
        context = {
            'title': 'GeoViz Layer Sync',
            'site_header': admin.site.site_header,
            'site_title': admin.site.site_title,
            'has_permission': True,
        }
        return render(request, 'admin/dmc/geonode_sync.html', context)
    
    @method_decorator(staff_member_required)
    def post(self, request):
        try:
            # Run in background thread
            thread = threading.Thread(target=schedule_geonodeLayers_api, kwargs={'trigger': 'manual'})
            thread.daemon = True
            thread.start()
            messages.success(request, 'GeoViz layer sync job started! Check server logs for progress.')
        except Exception as e:
            messages.error(request, f'Error starting sync: {str(e)}')
        
        return redirect('admin:geonode_sync')


class GeonodeSyncStatusView(View):
    """Returns the current job status as JSON. Admin-only."""
    @method_decorator(staff_member_required)
    def get(self, request):
        status = get_job_status()
        return JsonResponse(status)


# Custom AdminSite to add extra URLs
class DmcAdminSite(admin.AdminSite):
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('geonode-sync/', GeonodeSyncAdminView.as_view(), name='geonode_sync'),
        ]
        return custom_urls + urls


# Add custom URLs to the default admin site (sync views used by geoviz admin)
original_get_urls = admin.site.get_urls

def get_urls_with_geonode_sync():
    urls = original_get_urls()
    custom_urls = [
        path('geonode-sync/', GeonodeSyncAdminView.as_view(), name='geonode_sync'),
        path('geonode-sync/status/', GeonodeSyncStatusView.as_view(), name='geonode_sync_status'),
    ]
    return custom_urls + urls

admin.site.get_urls = get_urls_with_geonode_sync

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