#!/bin/bash

# Navigate to the servers/businesses directory
cd servers/businesses

# Print a message to the console
echo "Starting the businesses server..."

# Run the pnpm start command
pnpm start &

# Print a message to the console
cd ../../

# Navigate to the servers/users directory
cd servers/users

# Run the pnpm start command

pnpm start &

echo "Starting the users server..."

cd ../../

# Navigate to the servers/reviews directory
cd servers/categories

# Print a message to the console
echo "Starting the categories server..."

# Run the pnpm start command
pnpm start &

cd ../../

# Navigate to the servers/reviews directory

cd servers/dishes

# Print a message to the console

echo "Starting the dishes server..."

# Run the pnpm start command

pnpm start &

cd ../../

# Navigate to the servers/reviews directory

cd servers/kitchens

# Print a message to the console

echo "Starting the kitchens server..."

# Run the pnpm start command

pnpm start &

cd ../../

# Navigate to the servers/reviews directory

cd servers/payments

# Print a message to the console

echo "Starting the payments server..."

# Run the pnpm start command

pnpm start &

cd ../../

# Navigate to the servers/reviews directory

cd servers/settings

# Print a message to the console

echo "Starting the settings server..."

# Run the pnpm start command

pnpm start &

cd ../../

# Navigate to the servers/reviews directory

cd servers/zones

# Print a message to the console

echo "Starting the zones server..."

# Run the pnpm start command

pnpm start &


cd ../../

# Navigate to the servers/reviews directory

cd client-hi-biz 

# Print a message to the console

echo "Starting the client-hi-biz server..."

# Run the pnpm start command

npm run dev &

cd ../../

# Navigate to the servers/reviews directory

cd client-hitable

# Print a message to the console

echo "Starting the client-hitable server..."

# Run the pnpm start command

npm run dev &

cd ../../

# Navigate to the directory

cd client-pro-hipal

# Print a message to the console

echo "Starting the client-pro-hipal server..."

# Run the pnpm start command
npm i &&
npm run dev &

cd ../../