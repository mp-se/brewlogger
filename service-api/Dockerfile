FROM python:3.13
WORKDIR /app
ENV PYTHONFAULTHANDLER 1
ENV PYTHONUNBUFFERED 1
RUN apt-get update && apt-get install avahi-utils -y
COPY ./requirements/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./app /app
RUN rm -f ./app/test
RUN rm -fr /app/test
RUN rm -fr /*.sqlite
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod a+x entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]
