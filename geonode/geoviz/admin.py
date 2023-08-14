from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from .models import  *


# class minioObjectList_Admin(ImportExportModelAdmin):
#     #form = user_profilesForm
#     list_display = ('file_name','object_name','bucket_name','size')
#     search_fields = ('file_name','object_name','bucket_name','size')
# admin.site.register(minioObjectList,minioObjectList_Admin )