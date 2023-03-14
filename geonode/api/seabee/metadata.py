
from geonode.layers.models import Dataset, Style

from tastypie.authentication import MultiAuthentication, SessionAuthentication
from ..authentication import OAuthAuthentication
from geonode.api.authorization import GeonodeApiKeyAuthentication
#see dataset_upload_metadata
from geonode.resource.utils import update_resource

from rest_framework.response import Response
from rest_framework.views import APIView
from geonode.layers.metadata import parse_metadata
class Metadata(APIView):
    def get(self, request):
       
        with open("./geonode/api/seabee/sample.xml", "r") as f:
            xml = f.read()
        
        identifier, vals, regions, keywords, custom = parse_metadata(xml)
        return Response({
        "identifier":identifier,
        "vals":vals,
        "regions":regions,
        "keywords":keywords,
        "custom":custom,
        })

#authentication = MultiAuthentication(SessionAuthentication(),
#                                             OAuthAuthentication(),
#                                             GeonodeApiKeyAuthentication())
