
import json, requests, os
from pathlib import Path
from django.conf import settings as conf_settings
import base64

from shapely.geometry import Polygon
import pyproj
from shapely.ops import transform

import uuid
from bs4 import BeautifulSoup
import re

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
                el['object_uuid'] = str(uuid.uuid4())
            
            
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
# get the centroid from the bounding box
def bounding_box_to_centroid(coordinates):
    try:
        
        # Check if coordinates are in EPSG:4326
        if all(-180 <= x[0] <= 180 and -90 <= x[1] <= 90 for x in coordinates):
            polygon = Polygon(coordinates)
        else:
            # Convert coordinates to EPSG:4326
            transformer = pyproj.Transformer.from_crs('epsg:3857', 'epsg:4326', always_xy=True).transform
            coordinates = [transformer(x[0], x[1]) for x in coordinates]
            polygon = Polygon(coordinates)
        

        centroid = polygon.centroid

        transformer = pyproj.Transformer.from_crs('epsg:4326', 'epsg:3035', always_xy=True).transform

        poly_proj = transform(transformer, polygon)
        area = poly_proj.area / 1_000_000  # in km2

        return [{'lat': centroid.y, 'log': centroid.x}, area]
    except Exception as e:
        print(f"An error occurred: {e}")
        return [{'lat': 0, 'log': 0}, 0]
    


def schedule_geonodeLayers_api():

    try:
        page = 1
        nextPage= True
        jsondata=[]
        json_obj= None
        total_entries = 0
        itemcount = 0
   
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
                total_entries = json_obj['total']
                itemcount += len(json_obj['resources'])
                # Filter resources with abstract length >= 30
                filtered_resources = [el for el in json_obj['resources'] if len(el['abstract']) >= 30]
                # loop through the bbx of a mission and add a centroid
                for el in  filtered_resources:
                    
                    bbxy_arae = bounding_box_to_centroid(el['ll_bbox_polygon']['coordinates'][0])
                    el["bbx_xy"] =  bbxy_arae[0]   # centroid in 4623 epgs
                    el["area_sqkm"] =  bbxy_arae[1] # area in km2

                    el['object_uuid'] = str(uuid.uuid4())

                    # capture the theme from the abstract
                    if len(el['abstract']) > 0 and (el['abstract']).count('Theme') > 0:
                             soup = BeautifulSoup(el['abstract'], 'html.parser')
                             theme_row = soup.find('th', string='Theme').find_next('td')
                             theme_value = theme_row.text.strip()
                             el["Theme"] = theme_value
                    else:
                        el["Theme"] = ''


                    # capture the Spectrum from the abstract
                    if len(el['abstract']) > 0 and (el['abstract']).count('Spectrum') > 0:
                             soup = BeautifulSoup(el['abstract'], 'html.parser')
                             spectrum_row = soup.find('th', string='Spectrum').find_next('td')
                             spectrum_value = spectrum_row.text.strip()
                             el["Spectrum"] = spectrum_value
                    else:
                        el["Spectrum"] = ''
                    


                    
                    # capture the flight date from the abstract
                    matchDate = re.search(r'\d{4}-\d{2}-\d{2}', el['abstract'])
                    if matchDate:
                        dateMatch = matchDate.group()
                        el["flight_date"] = dateMatch 
                    else:
                        el["flight_date"] = ''

                    #check ml layer avalability
                    el["ml_result"] =knowMlLayer(el['title'],el["Theme"], headers)  


                jsondata = jsondata + json_obj['resources']
                
                if  json_obj.get("links").get("next") is None:  # If "next" is not present, no more pages
                    nextPage= False
                
                page += 1
        
            else:
                print(f"Error fetching page {page}: Status code {response.status_code}")
                break
        if total_entries == itemcount and itemcount > 0:
            with open( Path.joinpath(jsonPath / 'geonodeLayers.json') ,'w+') as f:
                json.dump(jsondata, f)
            print('Geonode raster layers list fetched >>',flush=True)
        else:
            print('Error in layers list fetched',flush=True)

    except Exception as e:
        print (e)

def knowMlLayer(title, theme, headersInfo):
        ml_type_mapping = {
            'Seabirds': 'detections',
            'Mammals': 'detections',
            'Habitat': 'classifications'
        }

        ml_type = ml_type_mapping.get(theme)

        if ml_type:
            url = f"https://geonode.seabee.sigma2.no/api/v2/resources/?filterdataset=vector&search={title}_{ml_type}&search_fields=title"
            response = requests.get(url, headers=headersInfo)

            if response.status_code == 200:
                if response.json()['total'] > 0:
                    return True
            else:
                print(f"Error fetching layer: Status code {response.status_code}")

        return False