
from geonode.layers.models import Dataset, Style

from tastypie.authentication import MultiAuthentication, SessionAuthentication
from ..authentication import OAuthAuthentication
from geonode.api.authorization import GeonodeApiKeyAuthentication

from rest_framework.response import Response
from rest_framework.views import APIView

class Metadata(APIView):
    def get(self, request):
        print(request)
        return Response({"articles": "hei"})

#authentication = MultiAuthentication(SessionAuthentication(),
#                                             OAuthAuthentication(),
#                                             GeonodeApiKeyAuthentication())
