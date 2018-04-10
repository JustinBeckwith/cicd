#!/bin/bash
gcloud config set project cicd-ftw
gcloud services enable vision.googleapis.com
gcloud services enable clouddebugger.googleapis.com
gcloud services enable cloudtrace.googleapis.com
gcloud services enable bigquery-json.googleapis.com

