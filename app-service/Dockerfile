FROM python:2

RUN curl -L https://storage.googleapis.com/kubernetes-release/release/v1.1.7/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl

COPY requirements.txt /
RUN pip install -r /requirements.txt

COPY gen-py /app-service/gen-py
COPY src /app-service/src

WORKDIR /app-service/src
CMD python service.py
