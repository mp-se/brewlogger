FROM python:3.11
WORKDIR /app
ENV PYTHONFAULTHANDLER 1
ENV PYTHONUNBUFFERED 1
COPY ./requirements/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./app /app
RUN rm -f ./app/test
RUN rm /app/*.sqlite
RUN rm -fr /app/test
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "80", "--log-config", "log_conf.yaml"]
