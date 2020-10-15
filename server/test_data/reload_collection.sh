#!/bin/bash

# $1 is uri 
# example uri format: mongodb+srv://<username>:<password>@<cluster>/<database>

mongoimport \
  --uri $1 \
  --collection $2 \
  --type json \
  --file $2.json \
  --jsonArray \
  --drop # replace collection entirely