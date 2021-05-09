#!/bin/bash
gcloud auth activate-service-account beautifultrouble@appspot.gserviceaccount.com --key-file=beautifultrouble-4923d9842172.json
gcloud app deploy --project beautifultrouble
