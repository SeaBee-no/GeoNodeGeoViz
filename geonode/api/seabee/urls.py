from django.urls import path

from .metadata import Metadata


app_name = "seabee"

# app_name will help us do a reverse look-up latter.
urlpatterns = [
    path('metadata/', Metadata.as_view()),
]