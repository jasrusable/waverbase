all:
	docker build -t redis-waver .
	docker tag redis-waver eu.gcr.io/api-project-1075799951054/redis:latest
	gcloud docker push eu.gcr.io/api-project-1075799951054/redis:latest
