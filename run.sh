#!/bin/bash

# Navigate to the servers/businesses directory
cd servers/businesses

# Print a message to the console
echo "Starting the businesses server..."

# Run the pnpm start command
pnpm dev &

# Print a message to the console
cd ../../

# Navigate to the servers/users directory
cd servers/users

# Run the pnpm start command

pnpm dev &

echo "Starting the users server..."

cd ../../

# Navigate to the servers/reviews directory
cd servers/categories

# Print a message to the console
echo "Starting the categories server..."

# Run the pnpm start command
pnpm dev &

cd ../../

# Navigate to the servers/reviews directory

cd servers/dishes

# Print a message to the console

echo "Starting the dishes server..."

# Run the pnpm start command

pnpm dev &

cd ../../

# Navigate to the servers/reviews directory

cd servers/kitchens

# Print a message to the console

echo "Starting the kitchens server..."

# Run the pnpm start command

pnpm dev &

cd ../../

# Navigate to the servers/reviews directory

cd servers/payments

# Print a message to the console

echo "Starting the payments server..."

# Run the pnpm start command

pnpm dev &

cd ../../

# Navigate to the servers/reviews directory

cd servers/settings

# Print a message to the console

echo "Starting the settings server..."

# Run the pnpm start command

pnpm dev &

cd ../../

# Navigate to the servers/reviews directory

cd servers/zones

# Print a message to the console

echo "Starting the zones server..."

# Run the pnpm start command

pnpm dev &


cd ../../

# Navigate to the servers/reviews directory

cd clients/client-hi-biz/

pnpm run dev

# Print a message to the console

echo "Starting the client-hi-biz server..."

cd ../../

# Navigate to the servers/reviews directory

cd clients/client-hitable

# Print a message to the console

echo "Starting the client-hitable server..."

# Run the pnpm start command

pnpm run dev &

cd ../../

# Navigate to the directory

cd clients/client-pro-hipal

# Print a message to the console

echo "Starting the client-pro-hipal server..."

# Run the pnpm start command
pnpm i &&
pnpm run dev &

cd ../../
