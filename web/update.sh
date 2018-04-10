#!/bin/bash
TAG=$(date +%s)
docker build -t gcr.io/cloudcats-next/ccweb:$TAG .
gcloud docker -- push gcr.io/cloudcats-next/ccweb:$TAG
kubectl set image deployment cloudcats-web cloudcats-web=gcr.io/cloudcats-next/ccweb:$TAG
kubectl rollout status deployment cloudcats-web
