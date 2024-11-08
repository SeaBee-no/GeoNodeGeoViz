from django.conf import settings as conf_settings
from rest_framework.views import APIView
from pathlib import Path
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import json, requests, os, base64
import uuid
from minio import Minio
from rest_framework import serializers
# Create your views here.
from pathlib import Path
from datetime import  timedelta
from .models import *
from geoserver.catalog import Catalog
from xml.dom.minidom import  parseString


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
                    "uuid": record["object_uuid"],
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
                     "thumbnail_url": [
                         item.get('url')
                         for item in record["links"]
                         if item.get('name') == 'PNG'
                     ],
                    "uuid": record["object_uuid"],
                    "json_org":"GN",
                    "theme":record["Theme"],
                    "thumbnail_url_compress":record["thumbnail_url"],
                    "flight_date":record["flight_date"],
                    "area_sqkm":record["area_sqkm"],
                    "ml_result":record["ml_result"],
                    "spectrum":record["Spectrum"],
                   
                }
                for record in obj
                if record["subtype"] == "raster"
          
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
        




# class get_download_url_by_text(APIView):
        
#         def get(self, request,format=None, serchtext=None ):
#             try:
#                 minioClient = Minio(
#                            "storage.seabee.sigma2.no",
#                         access_key=os.getenv('MINIO_ACCESS_KEY'),
#                         secret_key=os.getenv('MINIO_SECRET_KEY'),
#                         )
#                 # File name to search for
#                 file_name = "Team1Dag10_floskjaeret_202305241111"
                
#                # List of buckets to search in
#                #niva bucket excluded
#                 buckets_to_check = ['seabirds' , 'niva-tidy','niva','geoviz-upload-data','dmc']
    
                
#                 # empty the table
#                 minioObjectList.objects.all().delete()

#                 # Iterate over each bucket
#                 for bucket_name in buckets_to_check:
#                     objects = minioClient.list_objects(
#                         bucket_name, 
#                         recursive=True,
#                         )
#                     print(objects)
#                 # Search for the file by name in the current bucket
#                     # for obj in objects:
#                     #     len(objects.gi_frame.f_locals.get('objects'))
#                         # minioObjectList.objects.create(object_name=obj.object_name,
#                         #                                bucket_name=obj.bucket_name,
#                         #                                file_name=Path(obj.object_name).stem,
#                         #                                size=obj.size)
#                         #file_url = minioClient.presigned_get_object("geoviz-upload-data",  Path(obj.object_name), expires=timedelta(hours=1))
#                         # if Path(obj.object_name).stem == file_name:
#                         #     print(f"File '{file_name}' found in bucket '{bucket_name}'.")
#                         #     break
#                 else:
#                     print(f"File '{file_name}' not found in bucket '{bucket_name}'.")

#                 return Response("NA")
                
#             except Exception as e:
#                 print(e, flush=True)
#                 return Response('something went wrong')



class get_download_url_by_bucket(APIView):
        
        def get(self, request, bucket=None,fileWithPath=None ):
            try:
                minioClient = Minio(
                           "storage.seabee.sigma2.no",
                        access_key=os.getenv('MINIO_ACCESS_KEY'),
                        secret_key=os.getenv('MINIO_SECRET_KEY'),
                        )
                #found = minioClient.bucket_exists("dmc")
                
                file_url = minioClient.presigned_get_object(bucket.lower(), fileWithPath, expires=timedelta(hours=1))

                return Response(file_url)
                
            except Exception as e:
                print(e, flush=True)
                return Response('something went wrong')
            


class SeabeeOtterMissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = seabee_otter_mission
        fields = '__all__'



class get_mission_ottre_list(APIView):
        def get(self, request ):
            try:
               query = seabee_otter_mission.objects.all()
               serializer = SeabeeOtterMissionSerializer(query, many=True)
               return Response(serializer.data)
                
            except Exception as e:
                print(e, flush=True)
                return Response('something went wrong')
            


class get_ml_results_getfeature(APIView):
    def get(self, request, format=None):
        
        layerName = self.request.query_params.get('layerName')
        x = int(round(float(self.request.query_params.get('x'))))
        y = int(round(float(self.request.query_params.get('y'))))
        width = self.request.query_params.get('width')
        height = self.request.query_params.get('height')
        bbox = self.request.query_params.get('bbox')

          # Split the bbox string into individual values
        bbox_values = bbox.split(',')

         # Convert each value to a float and then back to a string
        box_values = [str(float(value)) for value in bbox_values]

        # Join the values back into a string
        bbox = ','.join(box_values)
        
        try:
            url =f'https://geonode.seabee.sigma2.no/geoserver/geonode/wms?SERVICE=WMS&VERSION=1.1.1&' \
                f'REQUEST=GetFeatureInfo&' \
                f'QUERY_LAYERS=geonode%3A{layerName}&LAYERS=geonode%3A{layerName}&' \
                f'INFO_FORMAT=application%2Fjson&' \
                f'X={x}&Y={y}&SRS=EPSG%3A4326&WIDTH={width}&HEIGHT={height}&BBOX={bbox}&'  \
                f'BUFFER=60'
        
            response = requests.get(url)
            return Response(response.json())
        except Exception as e:
            print(e, flush=True)
            return Response('something went wrong')


class get_layer_style_label(APIView):

    def get(self, request, format=None):
        geoserver_url = "https://geonode.seabee.sigma2.no/geoserver/rest"
        username = "admin"
        password = os.environ['GEOSERVER_PASSWORD']

        # Layer details
        layerName = self.request.query_params.get('layerName')
        grayid = self.request.query_params.get('grayid')
        
        cat = Catalog(service_url=geoserver_url, username=username, password=password)
    
        try:
            layer = cat.get_layer(f"{layerName}")
            if layer:
                    # Get the default style
                style = layer.default_style
                if style:
                        # Fetch the style object
                    style_content = style.sld_body
                    dom = parseString(style_content)
                        
                        # Find all ColorMapEntry elements
                    entries = dom.getElementsByTagName('sld:ColorMapEntry')
                    label = None
                        
                    # Search for the ColorMapEntry with the matching quantity
                    for entry in entries:
                        if entry.getAttribute('quantity') == str(grayid):
                            label = entry.getAttribute('label')
                            return Response(label)
                        

                else:
                    return Response(f"Style not found for layer '{layerName}'.")
            else:
                return Response(f"Layer '{layerName}' not found.")

        except Exception as e:
            print(e, flush=True)
            return Response('something went wrong')


class get_layer_id_geoserver(APIView):
        def get(self, request, format=None, layername=None):

            geoserver_url = "https://geonode.seabee.sigma2.no/geoserver/rest"
            username = "admin"
            password = os.environ['GEOSERVER_PASSWORD']

            cat = Catalog(service_url=geoserver_url, username=username, password=password)

            try:
                layer = cat.get_layer(f"{layername}")
                if layer:
                    bbox = layer.resource.latlon_bbox
                return Response(bbox)

            except Exception as e:
                print(e, flush=True)
                return Response('something went wrong')
