#!/bin/sh

if [ -n $NODE_ENV ]
then
  if [ "$NODE_ENV" == "production" ]
  then
    npm run build
    npm run start
    exit
  elif [ "$NODE_ENV" == "development" ]
  then
    npm run dev
    exit
  else
    echo "unknown environment"
    exit
  fi
else
  echo -e "NODE_ENV not set\n"
fi