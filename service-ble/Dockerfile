FROM python:3.11
WORKDIR /app
RUN apt-get update && apt-get install -y bluez bluetooth dbus libcap2-bin
ENV PYTHONFAULTHANDLER 1
ENV PYTHONUNBUFFERED 1
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
#RUN setcap cap_net_raw,cap_net_admin+eip /usr/local/bin/python3.11
COPY ./*.py /app/
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]