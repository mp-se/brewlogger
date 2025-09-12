
FROM python:3.13
WORKDIR /app
ENV PYTHONFAULTHANDLER 1
ENV PYTHONUNBUFFERED 1
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY *.py /app
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]
