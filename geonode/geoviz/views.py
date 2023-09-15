from django.conf import settings as conf_settings
from rest_framework.views import APIView
from pathlib import Path
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import json, requests, os, base64
import uuid
from minio import Minio
# Create your views here.
from pathlib import Path
from datetime import  timedelta


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