all:
	docker build -t mongo .
	docker tag mongo eu.gcr.io/api-project-1075799951054/mongo:latest
	gcloud docker push eu.gcr.io/api-project-1075799951054/mongo:latest
