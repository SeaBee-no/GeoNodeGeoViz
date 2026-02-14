
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


from pathlib import Path
import requests
import io, base64, json
from requests.auth import HTTPBasicAuth
from shapely.geometry import Polygon
from bs4 import BeautifulSoup
import re
import pyproj
from shapely.ops import transform
import uuid
import time
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import math
from datetime import datetime
import threading
import tempfile

# Thread-safe lock for status file writes
_status_lock = threading.Lock()

jsonPath=""
#inside geonode enviroment 
jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'geonode' ,'dmc','tempfolder')
if jsonPath_test.exists():
    jsonPath=Path.joinpath(conf_settings.BASE_DIR,'geonode','dmc','tempfolder')

#outside geonode enviroment 
jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'dmc','tempfolder')
if jsonPath_test.exists():
    jsonPath=Path.joinpath(conf_settings.BASE_DIR,'dmc','tempfolder')



def update_job_status(status_data):
    """Update the job status file using atomic write (write to temp, then rename)."""
    try:
        with _status_lock:
            status_file = Path.joinpath(jsonPath, 'geonode_sync_status.json') if jsonPath else None
            if status_file:
                # Write to a temp file first, then rename for atomic update
                tmp_fd, tmp_path = tempfile.mkstemp(
                    dir=str(jsonPath), suffix='.tmp', prefix='sync_status_'
                )
                try:
                    with os.fdopen(tmp_fd, 'w') as f:
                        json.dump(status_data, f)
                    # Atomic rename (overwrites existing file)
                    os.replace(tmp_path, str(status_file))
                except Exception:
                    # Clean up temp file on error
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)
                    raise
    except Exception as e:
        print(f"Error updating job status: {e}")


def get_job_status():
    """Read the current job status with retry on transient errors."""
    status_file = Path.joinpath(jsonPath, 'geonode_sync_status.json') if jsonPath else None
    if not status_file or not status_file.exists():
        return {'status': 'never_run', 'message': 'Job has never been run.',
                'total_entries': 0, 'fetched': 0, 'processed': 0, 'ml_checked': 0,
                'started_at': None, 'finished_at': None, 'progress': 0, 'step': '', 'error': None}
    # Retry up to 3 times on transient read errors
    for attempt in range(3):
        try:
            content = status_file.read_text()
            if content.strip():
                return json.loads(content)
        except Exception as e:
            print(f"Error reading job status (attempt {attempt + 1}/3): {e}")
            if attempt < 2:
                time.sleep(0.1)
    # Only return never_run if all retries fail AND file exists but is unreadable
    return {'status': 'never_run', 'message': 'Job has never been run.',
            'total_entries': 0, 'fetched': 0, 'processed': 0, 'ml_checked': 0,
            'started_at': None, 'finished_at': None, 'progress': 0, 'step': '', 'error': None}


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


def fetch_page(page_num, headers):
    """Fetch a single page of resources. Thread-safe with retry logic."""
    url = f"https://geonode.seabee.sigma2.no/api/v2/resources/?filterdataset=raster&page={page_num}"
    
    for attempt in range(3):
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                return {'page': page_num, 'data': response.json(), 'success': True}
            elif response.status_code == 429:  # Rate limited
                time.sleep(2 ** attempt)
            else:
                print(f"Error fetching page {page_num}: Status code {response.status_code}")
                if attempt < 2:
                    time.sleep(1)
        except requests.RequestException as e:
            if attempt < 2:
                time.sleep(1)
            else:
                print(f"Request failed for page {page_num}: {e}")
    
    return {'page': page_num, 'data': None, 'success': False}


def process_resource(el):
    """Process a single resource - extract metadata from abstract."""
    bbxy_arae = bounding_box_to_centroid(el['ll_bbox_polygon']['coordinates'][0])
    
    el["bbx_xy"] = bbxy_arae[0]   # centroid in 4326 epgs
    el["area_sqkm"] = bbxy_arae[1]  # area in km2
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
        el["flight_date"] = matchDate.group()
    else:
        el["flight_date"] = ''
    
    return el


def schedule_geonodeLayers_api(trigger='scheduled'):
    start_time = datetime.now().isoformat()
    # Preserve timestamps from previous runs
    prev_status = get_job_status()
    last_scheduled_at = prev_status.get('last_scheduled_at')
    last_manual_at = prev_status.get('last_manual_at')
    # Backfill from previous run if fields were missing (pre-tracking runs)
    prev_trigger = prev_status.get('trigger')
    prev_finished = prev_status.get('finished_at')
    if not last_scheduled_at and prev_trigger == 'scheduled' and prev_finished:
        last_scheduled_at = prev_finished
    if not last_manual_at and prev_trigger != 'scheduled' and prev_finished and prev_status.get('status') != 'never_run':
        last_manual_at = prev_finished
    update_job_status({
        'status': 'running',
        'step': 'Starting',
        'message': 'Initializing GeoNode layers sync...',
        'progress': 0,
        'started_at': start_time,
        'finished_at': None,
        'total_entries': 0,
        'fetched': 0,
        'processed': 0,
        'ml_checked': 0,
        'error': None,
        'trigger': trigger,
        'last_scheduled_at': last_scheduled_at,
        'last_manual_at': last_manual_at
    })
    
    try:
        credentials = f"{os.environ['GEONODE_USER_ID']}:{os.environ['GEONODE_PASSWORD']}".encode('utf-8')
        encoded_credentials = base64.b64encode(credentials).decode('utf-8')
           
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {encoded_credentials}"
        } 
        
        # Step 1: Fetch first page to get total count and page size
        print("Fetching page 1 to determine total pages...")
        update_job_status({
            'status': 'running',
            'step': 'Fetching pages',
            'message': 'Fetching page 1 to determine total pages...',
            'progress': 5,
            'started_at': start_time,
            'finished_at': None,
            'total_entries': 0,
            'fetched': 0,
            'processed': 0,
            'ml_checked': 0,
            'error': None,
            'trigger': trigger,
            'last_scheduled_at': last_scheduled_at,
            'last_manual_at': last_manual_at
        })
        
        first_page_result = fetch_page(1, headers)
        
        if not first_page_result['success']:
            print("Failed to fetch first page. Exiting.")
            update_job_status({
                'status': 'failed',
                'step': 'Fetching pages',
                'message': 'Failed to fetch first page from GeoNode API.',
                'progress': 0,
                'started_at': start_time,
                'finished_at': datetime.now().isoformat(),
                'total_entries': 0,
                'fetched': 0,
                'processed': 0,
                'ml_checked': 0,
                'error': 'Failed to fetch first page',
                'trigger': trigger,
                'last_scheduled_at': last_scheduled_at,
                'last_manual_at': last_manual_at
            })
            return
        
        first_page_data = first_page_result['data']
        total_entries = first_page_data['total']
        page_size = len(first_page_data['resources'])
        total_pages = math.ceil(total_entries / page_size) if page_size > 0 else 1
        
        print(f"Total entries: {total_entries}, Page size: {page_size}, Total pages: {total_pages}")
        
        # Collect all resources - start with page 1
        all_resources = first_page_data['resources']
        
        # Step 2: Fetch remaining pages in parallel (5 concurrent)
        if total_pages > 1:
            remaining_pages = list(range(2, total_pages + 1))
            pages_done = 1  # page 1 already fetched
            
            with ThreadPoolExecutor(max_workers=5) as executor:
                futures = {executor.submit(fetch_page, page_num, headers): page_num for page_num in remaining_pages}
                
                for future in tqdm(as_completed(futures), total=len(futures), desc="Fetching pages"):
                    try:
                        result = future.result()
                        if result['success'] and result['data']:
                            all_resources.extend(result['data']['resources'])
                        else:
                            print(f"Failed to fetch page {result['page']}")
                    except Exception as e:
                        print(f"Error fetching page: {e}")
                    
                    pages_done += 1
                    pct = int(5 + (pages_done / total_pages) * 40)  # 5-45%
                    update_job_status({
                        'status': 'running',
                        'step': 'Fetching pages',
                        'message': f'Fetched {pages_done}/{total_pages} pages ({len(all_resources)} resources)...',
                        'progress': pct,
                        'started_at': start_time,
                        'finished_at': None,
                        'total_entries': total_entries,
                        'fetched': len(all_resources),
                        'processed': 0,
                        'ml_checked': 0,
                        'error': None,
                        'trigger': trigger,
                        'last_scheduled_at': last_scheduled_at,
                        'last_manual_at': last_manual_at
                    })
        
        print(f"Total resources fetched: {len(all_resources)}")
        
        # Step 3: Filter and process resources
        filtered_resources = [el for el in all_resources if len(el['abstract']) >= 30]
        
        print(f"Processing {len(filtered_resources)} filtered resources...")
        processed_count = 0
        for el in tqdm(filtered_resources, desc="Processing resources"):
            process_resource(el)
            processed_count += 1
            if processed_count % 50 == 0 or processed_count == len(filtered_resources):
                pct = int(45 + (processed_count / len(filtered_resources)) * 25)  # 45-70%
                update_job_status({
                    'status': 'running',
                    'step': 'Processing metadata',
                    'message': f'Processed {processed_count}/{len(filtered_resources)} resources...',
                    'progress': pct,
                    'started_at': start_time,
                    'finished_at': None,
                    'total_entries': total_entries,
                    'fetched': len(all_resources),
                    'processed': processed_count,
                    'ml_checked': 0,
                    'error': None,
                    'trigger': trigger,
                    'last_scheduled_at': last_scheduled_at,
                    'last_manual_at': last_manual_at
                })
        
        # Step 4: Batch ML layer checks with ThreadPoolExecutor (5 concurrent workers)
        resources_needing_ml_check = [el for el in filtered_resources if el.get('Theme') in ('Seabirds', 'Mammals', 'Habitat')]
        resources_no_ml_check = [el for el in filtered_resources if el.get('Theme') not in ('Seabirds', 'Mammals', 'Habitat')]
        
        # Set ml_result=False for resources that don't need ML check
        for el in resources_no_ml_check:
            el['ml_result'] = False
        
        # Parallel fetch ML layer info
        ml_checked_count = 0
        if resources_needing_ml_check:
            total_ml = len(resources_needing_ml_check)
            print(f"Checking ML layers for {total_ml} resources...")
            with ThreadPoolExecutor(max_workers=5) as executor:
                futures = {executor.submit(knowMlLayer, el, headers): el for el in resources_needing_ml_check}
                for future in tqdm(as_completed(futures), total=len(futures), desc="ML layer checks"):
                    try:
                        future.result()
                    except Exception as e:
                        print(f"Error in ML check: {e}")
                    
                    ml_checked_count += 1
                    if ml_checked_count % 20 == 0 or ml_checked_count == total_ml:
                        pct = int(70 + (ml_checked_count / total_ml) * 25)  # 70-95%
                        update_job_status({
                            'status': 'running',
                            'step': 'Checking ML layers',
                            'message': f'Checked {ml_checked_count}/{total_ml} ML layers...',
                            'progress': pct,
                            'started_at': start_time,
                            'finished_at': None,
                            'total_entries': total_entries,
                            'fetched': len(all_resources),
                            'processed': processed_count,
                            'ml_checked': ml_checked_count,
                            'error': None,
                            'trigger': trigger,
                            'last_scheduled_at': last_scheduled_at,
                            'last_manual_at': last_manual_at
                        })
        
        # Step 5: Save results
        if total_entries == len(all_resources):
            with open(Path.joinpath(jsonPath / 'geonodeLayers.json'), 'w+') as f:
                json.dump(all_resources, f)
        
            print(f'Total entries saved: {len(all_resources)}')
            print('Geonode raster layers list fetched >>', flush=True)
            
            finished_time = datetime.now().isoformat()
            update_job_status({
                'status': 'success',
                'step': 'Completed',
                'message': f'Successfully synced {len(all_resources)} resources ({processed_count} processed, {ml_checked_count} ML checked).',
                'progress': 100,
                'started_at': start_time,
                'finished_at': finished_time,
                'total_entries': total_entries,
                'fetched': len(all_resources),
                'processed': processed_count,
                'ml_checked': ml_checked_count,
                'error': None,
                'trigger': trigger,
                'last_scheduled_at': finished_time if trigger == 'scheduled' else last_scheduled_at,
                'last_manual_at': finished_time if trigger == 'manual' else last_manual_at
            })
        else:
            msg = f'Total entries mismatch (expected {total_entries}, got {len(all_resources)})'
            print(f'Error: {msg}', flush=True)
            finished_time = datetime.now().isoformat()
            update_job_status({
                'status': 'failed',
                'step': 'Saving results',
                'message': msg,
                'progress': 95,
                'started_at': start_time,
                'finished_at': finished_time,
                'total_entries': total_entries,
                'fetched': len(all_resources),
                'processed': processed_count,
                'ml_checked': ml_checked_count,
                'error': msg,
                'trigger': trigger,
                'last_scheduled_at': last_scheduled_at,
                'last_manual_at': last_manual_at
            })

    except Exception as e:
        print(e)
        update_job_status({
            'status': 'failed',
            'step': 'Error',
            'message': str(e),
            'progress': 0,
            'started_at': start_time,
            'finished_at': datetime.now().isoformat(),
            'total_entries': 0,
            'fetched': 0,
            'processed': 0,
            'ml_checked': 0,
            'error': str(e),
            'trigger': trigger,
            'last_scheduled_at': last_scheduled_at,
            'last_manual_at': last_manual_at
        })


def knowMlLayer(resource, headersInfo):
    """Check ML layer availability for a resource. Thread-safe with retry logic."""
    ml_type_mapping = {
        'Seabirds': 'detections',
        'Mammals': 'detections',
        'Habitat': 'classifications'
    }

    title = resource['title']
    theme = resource.get('Theme', '')
    ml_type = ml_type_mapping.get(theme)

    if ml_type:
        url = f"https://geonode.seabee.sigma2.no/api/v2/resources/?filterdataset=vector&search={title}_{ml_type}&search_fields=title"
        
        # Retry logic with exponential backoff
        for attempt in range(3):
            try:
                response = requests.get(url, headers=headersInfo, timeout=30)
                if response.status_code == 200:
                    resource['ml_result'] = response.json()['total'] > 0
                    return resource
                elif response.status_code == 429:  # Rate limited
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print(f"Error fetching layer: Status code {response.status_code}")
                    break
            except requests.RequestException as e:
                if attempt < 2:
                    time.sleep(1)
                else:
                    print(f"Request failed for {title}: {e}")

    resource['ml_result'] = False
    return resource