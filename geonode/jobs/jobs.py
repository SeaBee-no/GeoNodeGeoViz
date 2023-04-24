
import json, requests, os
from pathlib import Path
from django.conf import settings as conf_settings




def schedule_api():

    try:
        opration= 'flight'
        page_num=1
        has_more = 1
        projects = []
        proj_filter=['BF3E1518-4E07-4FA0-CF45-24CD26C43D86','9D344F75-FBD7-C872-5F6C-E1BEEB9538EF']
        
        
        jsonPath=""
        #inside geonode enviroment 
        jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'geonode' ,'dmc','tempfolder')
        if jsonPath_test.exists():
            jsonPath=Path.joinpath(conf_settings.BASE_DIR,'geonode','dmc','tempfolder')

        #outside geonode enviroment 
        jsonPath_test=Path.joinpath(conf_settings.BASE_DIR, 'dmc','tempfolder')
        if jsonPath_test.exists():
            jsonPath=Path.joinpath(conf_settings.BASE_DIR,'dmc','tempfolder')
        
    
        
        while has_more == 1:
            pro_data = requests.get(f'https://api.dronelogbook.com/{opration}?num_page={page_num}', 
            headers={"accept": "application/json",
            "ApiKey": os.environ['DRONELOGBOOK_API_KEY'],

            })
            projects = projects + pro_data.json()['data']
            page_num=page_num +1
            has_more = pro_data.json()['has_more']
            print(page_num)
        
        projects = list(filter(lambda item: item['project_guid'] in proj_filter, projects ))

        

        with open( Path.joinpath(jsonPath / 'flightList.json') ,'w+') as f:
            json.dump(projects, f)
        
        print('flightList.json updated >>>',flush=True)

    except Exception as e:
        print (e)

