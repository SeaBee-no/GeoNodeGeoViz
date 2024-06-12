from apscheduler.schedulers.background import BackgroundScheduler
from .jobs import schedule_api,schedule_geonodeLayers_api
from tzlocal import get_localzone

def start():
	scheduler = BackgroundScheduler({'apscheduler.timezone': get_localzone()})
	scheduler.add_job(schedule_api, 'interval', seconds = 14400,max_instances=1)
	scheduler.start()
# actual time to execute 21600
def start_GN_layers():
	scheduler = BackgroundScheduler({'apscheduler.timezone': get_localzone()})
	scheduler.add_job(schedule_geonodeLayers_api, 'interval', seconds = 21600,max_instances=1)
	scheduler.start()