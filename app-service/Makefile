thrift:
	thrift --gen py:new_style app.thrift
	cp gen-py/app/AppService-remote gen-py

all: thrift
	pip install -r requirements.txt

docker: 
	docker build -t app-service .
	docker tag app-service eu.gcr.io/api-project-1075799951054/app-service:latest
	gcloud docker push eu.gcr.io/api-project-1075799951054/app-service:latest
