# Generated by Django 3.2.16 on 2023-08-11 09:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geonode_geoviz', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='minioobjectlist',
            name='size',
            field=models.BigIntegerField(blank=True, null=True, verbose_name='File size'),
        ),
    ]
