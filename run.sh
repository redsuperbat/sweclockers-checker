#!/bin/bash

FILE=index.js

if [ -f "$FILE"]; then
  npm run start
else
  npm run prod
fi
