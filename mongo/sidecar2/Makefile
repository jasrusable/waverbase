thrift:
	cp ../../app-service/app.thrift ./src/app.thrift

docker:
	docker build -t sidecar .
	docker tag sidecar eu.gcr.io/api-project-1075799951054/sidecar:latest
	gcloud docker push eu.gcr.io/api-project-1075799951054/sidecar:latest
