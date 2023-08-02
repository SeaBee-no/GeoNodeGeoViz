from django.conf import settings as conf_settings
from rest_framework.views import APIView
from pathlib import Path
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import json
# Create your views here.


jsonPath=""
#inside geonode enviroment 
jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'geonode' ,'dmc','tempfolder')
if jsonPath_test.exists():
    jsonPath=Path.joinpath(conf_settings.BASE_DIR,'geonode','dmc','tempfolder')

#outside geonode enviroment 
jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'dmc','tempfolder')
if jsonPath_test.exists():
    jsonPath=Path.joinpath(conf_settings.BASE_DIR,'dmc','tempfolder')


#@login_required
def droneViz(request):
    return render(request, 'mapMyDrone/index_geoviz_mymap.html')






class get_dronelogbook_flight_project_info (APIView):
    def get(self, request, format=None):
        try:
            
            #print("path to json >>>>>"+ str(jsonPath) ,flush=True)
            obj = None
            with open(jsonPath / 'flightList.json','r') as f:
                obj = json.load(f)
            
            flightInfo = [
                {
                    "name": record["name"],
                    "location": record["placInfo"][0]["name"],
                    "lat": record["placInfo"][0]["latitude"],
                    "lng": record["placInfo"][0]["longitude"]
                        
                }
                for record in obj
                if record.get("placInfo") and record["placInfo"]
            ]

          
            #return Response(obj.json()['data'])
            return Response(flightInfo)

        except Exception as e:
            return Response('NA')











class get_droneFlight_geonode_info (APIView):
    def get(self, request, format=None):
        try:
            
            #print("path to json >>>>>"+ str(jsonPath) ,flush=True)
            obj = None
            with open(jsonPath / 'geonodeLayers.json','r') as f:
                obj = json.load(f)
            
            flightInfo = [
                {
                    "Name": record["title"],
                    "flightsxy": record["bbx_xy"],
                   
                }
                for record in obj
          
            ]

          
            #return Response(obj.json()['data'])
            return Response(flightInfo)

        except Exception as e:
            return Response('NA')