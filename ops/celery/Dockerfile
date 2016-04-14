FROM app-service
RUN pip install celery
WORKDIR /app-service/src
ENV C_FORCE_ROOT yes
CMD celery worker -A task -l debug --concurrency=20
