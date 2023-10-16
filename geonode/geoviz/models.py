from django.db import models
from simple_history.models import HistoricalRecords
import uuid


class seabee_otter_mission(models.Model):
    mission_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name="Mission Id", unique=True)

    location_name = models.CharField(
        null=True, blank=True, max_length=300, verbose_name='Location name')
    
    project_name = models.CharField(
        null=True, blank=True, max_length=300, verbose_name='Project name')
    
    mission_date = models.DateField(
        verbose_name='Mission date', blank=True, null=True)
    
    latitude = models.FloatField(verbose_name='Latitude',null=True, blank=True,)

    logitude = models.FloatField(verbose_name='Logitude',null=True, blank=True,)

    comments = models.TextField(null=True, blank=True, verbose_name='Comment')
    history = HistoricalRecords()


    def __str__(self):
        return self.location_name or 'NA'

    class Meta:
        verbose_name_plural = "Seabee Otter mission"