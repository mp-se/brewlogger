import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
# from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def scheduler_shutdown():
    logger.info("Shutting down scheduler")
    scheduler.shutdown()


def task_example():
    logger.info(f"Task is running at {datetime.now()}")


def scheduler_setup():
    pass
    # trigger = CronTrigger(second=0)
    # scheduler.add_job(task_example, trigger)
    # scheduler.start()


# EOF
