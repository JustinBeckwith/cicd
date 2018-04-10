#!/bin/bash
TAG=$(date +%s)
docker build -t gcr.io/cicd-ftw/ccworker:$TAG .
gcloud docker -- push gcr.io/cicd-ftw/ccworker:$TAG
kubectl set image deployment cloudcats-worker cloudcats-worker=gcr.io/cicd-ftw/ccworker:$TAG
kubectl rollout status deployment cloudcats-worker
