FROM python:3
MAINTAINER Waverbase

WORKDIR /sidecar
COPY requirements.txt /sidecar/requirements.txt
RUN pip install -r requirements.txt

COPY src /sidecar/src

WORKDIR /sidecar/src
CMD ["python", "sidecar.py"]
