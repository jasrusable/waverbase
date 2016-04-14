all:
	docker build -t app-service .
	docker tag app-service eu.gcr.io/api-project-1075799951054/app-service:latest
	gcloud docker push eu.gcr.io/api-project-1075799951054/app-service:latest
