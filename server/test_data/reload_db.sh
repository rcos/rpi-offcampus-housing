#!/bin/bash

# $1 is uri 
# example uri format: mongodb+srv://<username>:<password>@<cluster>/<database>

# Generate test data first
npm run gen-test-data \
  && bash ./reload_collection.sh $1 students \
  && bash ./reload_collection.sh $1 landlords \
  && bash ./reload_collection.sh $1 properties \
  && bash ./reload_collection.sh $1 reviews