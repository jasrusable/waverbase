thrift:
	cp ../../app-service/app.thrift .
	thrift --gen js:node app.thrift

docker: thrift
	docker build -t mongo-k8s-sidecar .
	docker tag mongo-k8s-sidecar eu.gcr.io/api-project-1075799951054/mongo-k8s-sidecar:latest
	gcloud docker push eu.gcr.io/api-project-1075799951054/mongo-k8s-sidecar:latest
