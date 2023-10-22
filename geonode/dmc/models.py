from functools import partial
from django.db.models.fields.files import FieldFile
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django_minio_backend import MinioBackend, iso_date_prefix
import datetime
from django.contrib.postgres.fields import DateTimeRangeField
from django.db import models
from simple_history.models import HistoricalRecords
from django.contrib.gis.db.models.fields import MultiPointField
from django.conf import settings
User = settings.AUTH_USER_MODEL


class ddc_main(models.Model):
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE,
                                   related_name='ddc_for_metadata')
    flight_mission_guid = models.CharField(
        null=True, blank=True, max_length=300, verbose_name='Dronelogbook Id', unique=True)

    flight_mission_name = models.CharField(
        null=True, blank=True, max_length=300, verbose_name='Flight Mission Name')

    drone_type = models.CharField(
        null=False, blank=False, max_length=300, verbose_name='Drone Type')

    image_overlap = models.PositiveIntegerField(
        null=True, blank=True, verbose_name='Image Overlap')

    cdom = models.PositiveIntegerField(null=True, blank=True,
                                       verbose_name='Cdom– ug/l Quinine sulphate (0-500 -upper figure is a maximum guess and should be adjustable)')
    turbidity = models.PositiveIntegerField(null=True, blank=True,
                                            verbose_name='Turbidity- FNU (0-100)')
    salinity = models.PositiveIntegerField(null=True, blank=True,
                                           verbose_name='Salinity- PSU (0-40)')
    water_temperature = models.PositiveIntegerField(null=True, blank=True,
                                                    verbose_name='Water Temperature (1.7C – 35C)')
    secchi_depth = models.PositiveIntegerField(null=True, blank=True,
                                               verbose_name='Secchi Depth (metres)')
    sensor_dates_last_calibration = models.DateField(
        verbose_name='Dates of last calibration', blank=True, null=True)
    sensor_dates_last_maintenance = models.DateField(verbose_name='Dates of last maintenance',
                                                     blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.flight_mission_name or 'NA'

    class Meta:
        verbose_name_plural = "Dronelogbook additional parameter"


def get_iso_date() -> str:
    now = datetime.datetime.utcnow().replace(tzinfo=utc)
    return f"{now.year}-{now.month}-{now.day}"


def get_upload_path(instance, filename, folder):
    return 'niva/{}/{}/{}/{}'.format(datetime.date.today().year, instance.flight_mission_name, folder, filename)


class ddc_upload(models.Model):

    flight_mission_guid = models.CharField(
        null=True, blank=True, max_length=300, verbose_name='Dronelogbook Id', unique=True)

    flight_mission_name = models.CharField(
        null=True, blank=True, max_length=300, verbose_name='Flight Mission Name')
    mosaiced_image = models.FileField(verbose_name="Upload single mosaiced file",
                                      storage=MinioBackend(
                                          bucket_name='geoviz-upload-data',
                                      ), upload_to=partial(get_upload_path, folder='orthomosaic'), null=True, blank=True)
    row_image = models.FileField(verbose_name="Upload raw images a single .zip file",
                                 storage=MinioBackend(
                                     bucket_name='geoviz-upload-data',
                                 ), upload_to=partial(get_upload_path, folder='raw_images'), null=True, blank=True)
    
    configyaml = models.FileField(verbose_name="Upload NodeODM config file as .yaml",
                                          storage=MinioBackend(
                                              bucket_name='geoviz-upload-data',
                                          ), upload_to=partial(get_upload_path, folder=''), null=True, blank=True)

    ground_control_point = models.FileField(verbose_name="Upload ground control point as .csv",
                                            storage=MinioBackend(
                                                bucket_name='geoviz-upload-data',
                                            ), upload_to=partial(get_upload_path, folder='gcp'), null=True, blank=True)
    ground_truth_point = models.FileField(verbose_name="Upload ground truth point as .csv",
                                          storage=MinioBackend(
                                              bucket_name='geoviz-upload-data',
                                          ), upload_to=partial(get_upload_path, folder='ground_truth'), null=True, blank=True)
    dronePath = models.FileField(verbose_name="Upload drone path file as .kml",
                                 storage=MinioBackend(
                                     bucket_name='geoviz-upload-data',
                                 ), upload_to=partial(get_upload_path, folder='drone_path'), null=True, blank=True)
    other = models.FileField(verbose_name="Upload any supporting data such pdf, report, photo in a zip format etc",
                                 storage=MinioBackend(
                                     bucket_name='geoviz-upload-data',
                                 ), upload_to=partial(get_upload_path, folder='other'), null=True, blank=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.flight_mission_guid or 'NA'

    class Meta:
        verbose_name_plural = "Seabee bucket"
