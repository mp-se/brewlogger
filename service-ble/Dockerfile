FROM python:3.11
WORKDIR /app
RUN apt-get update && apt-get install -y bluez bluetooth dbus libcap2-bin supervisor
ENV PYTHONFAULTHANDLER 1
ENV PYTHONUNBUFFERED 1
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
RUN mkdir -p /var/log/supervisor
COPY ./scan.py /app/
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord"]
