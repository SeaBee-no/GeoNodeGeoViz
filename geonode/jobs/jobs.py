
import json, requests, os
from pathlib import Path
from django.conf import settings as conf_settings
import base64
from shapely.geometry import Polygon



jsonPath=""
#inside geonode enviroment 
jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'geonode' ,'dmc','tempfolder')
if jsonPath_test.exists():
    jsonPath=Path.joinpath(conf_settings.BASE_DIR,'geonode','dmc','tempfolder')

#outside geonode enviroment 
jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'dmc','tempfolder')
if jsonPath_test.exists():
    jsonPath=Path.joinpath(conf_settings.BASE_DIR,'dmc','tempfolder')




def schedule_api():

    try:
        opration1= 'flight'
        opration2= 'place'
        page_num=1
        has_more = 1
        projects = []
        proj_filter=['BF3E1518-4E07-4FA0-CF45-24CD26C43D86','9D344F75-FBD7-C872-5F6C-E1BEEB9538EF']
        
        
        while has_more == 1:
            pro_data = requests.get(f'https://api.dronelogbook.com/{opration1}?num_page={page_num}', 
            headers={"accept": "application/json",
            "ApiKey": os.environ['DRONELOGBOOK_API_KEY'],

            })
            
            pro_data_obj= pro_data.json()['data']
            
            # loop through the places and get the cordinate of drone mission
            for el in  pro_data_obj:

                place_guid = el.get("place_guid")
                if(place_guid):
                    place = requests.get(f'https://api.dronelogbook.com/{opration2}/{place_guid}', 
                                        headers={"accept": "application/json", 
                                                "ApiKey": os.environ['DRONELOGBOOK_API_KEY']
                                                })
                    if place.status_code == 200:
                        el['placInfo'] = place.json()['data']
                    else:
                        el['placInfo'] = None
            
            
            projects = projects + pro_data_obj
            page_num=page_num +1
            has_more = pro_data.json()['has_more']
            #print(page_num)
        
        projects = list(filter(lambda item: item['project_guid'] in proj_filter, projects ))

        

        with open( Path.joinpath(jsonPath / 'flightList.json') ,'w+') as f:
            json.dump(projects, f)
        
        print('flightList.json updated >>>',flush=True)

    except Exception as e:
        print (e)




# get the centroid from the bounding box
def bounding_box_to_centroid(coordinates):
    
    polygon = Polygon(coordinates)
    centroid = polygon.centroid
    return {'lat': centroid.y, 'log': centroid.x} 

def schedule_geonodeLayers_api():

    try:
        page = 1
        nextPage= True
        jsondata=[]
        json_obj= None
   
        credentials = f"{os.environ['GEONODE_USER_ID']}:{os.environ['GEONODE_PASSWORD']}".encode('utf-8')

        encoded_credentials = base64.b64encode(credentials).decode('utf-8')

           
        headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Basic {encoded_credentials}"
                    } 
        
    
       
        while nextPage:
            url = f"https://geonode.seabee.sigma2.no/api/v2/resources/?filterdataset=raster&page={page}"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                json_obj = response.json()
                # loop through the bbx of a mission and add a centroid
                for el in  json_obj['resources']:
                    el["bbx_xy"] =  bounding_box_to_centroid(el['ll_bbox_polygon']['coordinates'][0])

                jsondata = jsondata + json_obj['resources']
                
                if  json_obj.get("links").get("next") is None:  # If "next" is not present, no more pages
                    nextPage= False
                
                page += 1
        
            else:
                print(f"Error fetching page {page}: Status code {response.status_code}")
                break
        with open( Path.joinpath(jsonPath / 'geonodeLayers.json') ,'w+') as f:
            json.dump(jsondata, f)

        print('Geonode raster layers list fetched',flush=True)

    except Exception as e:
        print (e)