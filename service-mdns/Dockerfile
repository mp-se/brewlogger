
FROM python:3.11
WORKDIR /app
RUN apt-get update && apt-get install avahi-utils -y
COPY ./requirements/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./app /app
ENTRYPOINT [ "python", "main.py" ]
