from django.conf import settings as conf_settings
from rest_framework.views import APIView
from pathlib import Path
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import json, requests, os, base64

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





# drone logbook fetch from json
class get_dronelogbook_flight_project_info (APIView):
    def get(self, request, format=None):
        try:
            
            #print("path to json >>>>>"+ str(jsonPath) ,flush=True)
            obj = None
            with open(jsonPath / 'flightList.json','r') as f:
                obj = json.load(f)
               # add coustom attribute to tag the json origin   "jsonorg"
            flightInfo = [
                {
                    "name": record["name"],
                    "place_name": record["place_name"],
                    "complete_status": record["complete_status"],
                    "flight_date": record["flight_date"],
                    "max_altitude": record["max_altitude"],
                    "personnel": record["personnel"][0]['full_name'],
                    "payload_description": record["payload_description"],
                    "lat": record["placInfo"][0]["latitude"],
                    "lng": record["placInfo"][0]["longitude"],
                    "json_org":"DLB",
                        
                }
                for record in obj
                if record.get("placInfo") and record["placInfo"]
            ]

          
            #return Response(obj.json()['data'])
            return Response(flightInfo)

        except Exception as e:
            return Response('NA')



# drone geonode layer bb fetch from json
class get_droneFlight_geonode_info (APIView):
    def get(self, request, format=None):
        try:
            
            #print("path to json >>>>>"+ str(jsonPath) ,flush=True)
            obj = None
            with open(jsonPath / 'geonodeLayers.json','r') as f:
                obj = json.load(f)
            # add coustom attribute to tag the json origin   "jsonorg"
            flightInfo = [
                {
                    "Name": record["title"],
                    "published": record["date"],
                    "abstract_table": record["abstract"],
                    "flightsxy": record["bbx_xy"],
                    "dataset_id": record["pk"],
                    "detail_url":record["detail_url"],
                     "thumbnail_url":record["links"][4].get('url'),
                    "json_org":"GN",
                   
                }
                for record in obj
          
            ]

          
            #return Response(obj.json()['data'])
            return Response(flightInfo)

        except Exception as e:
            return Response('NA')
        

# drone geonode layer metatdata perticular dataset
class get_droneFlight_geonodeLayer_info_byid (APIView):
    def get(self, request, format=None,dataset_id=None):
        try:
            credentials = f"{os.environ['GEONODE_USER_ID']}:{os.environ['GEONODE_PASSWORD']}".encode('utf-8')

            encoded_credentials = base64.b64encode(credentials).decode('utf-8')

            
            headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Basic {encoded_credentials}"
                        } 
        
            url = f"https://geonode.seabee.sigma2.no/api/v2/datasets/{dataset_id}"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                json_obj = response.json()
                return Response(json_obj)
            else:
                return Response({"NA"})


        except Exception as e:
            return Response('NA')