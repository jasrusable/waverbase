all:
	docker build -t celery .
	docker tag celery eu.gcr.io/api-project-1075799951054/celery:latest
	gcloud docker push eu.gcr.io/api-project-1075799951054/celery:latest
