#!/bin/sh

if [ -n $NODE_ENV ]
then
  if [ "$NODE_ENV" == "production" ]
  then
    npm i -g @vercel/ncc
    ncc build src/index.ts -o dist
    node dist/index.js
    exit
  elif [ "$NODE_ENV" == "development" ]
  then
    npm run start
    exit
  else
    echo "unknown environment"
    exit
  fi
else
  echo -e "NODE_ENV not set\n"
fi