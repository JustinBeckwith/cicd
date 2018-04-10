#!/bin/bash
TAG=$(date +%s)
docker build -t gcr.io/cicd-ftw/ccweb:$TAG .
gcloud docker -- push gcr.io/cicd-ftw/ccweb:$TAG
kubectl set image deployment cloudcats-web cloudcats-web=gcr.io/cicd-ftw/ccweb:$TAG
kubectl rollout status deployment cloudcats-web
