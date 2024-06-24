#!/bin/bash

docker build --target businesses-server --tag businesses-server .

gnome-terminal -- docker run -it -t businesses-server

docker build --target categories-server --tag categories-server .

gnome-terminal -- docker run -it -t categories-server

docker build --target dishes-server --tag dishes-server .

gnome-terminal -- docker run -it -t dishes-server

docker build --target kitchens-server --tag kitchens-server .

gnome-terminal -- docker run -it -t kitchens-server

docker build --target payments-server --tag payments-server .

gnome-terminal -- docker run -it -t payments-server

docker build --target settings-server --tag settings-server .

gnome-terminal -- docker run -it -t settings-server

docker build --target users-server --tag users-server .

gnome-terminal -- docker run -it -t users-server

docker build --target zones-server --tag zones-server .

gnome-terminal -- docker run -it -t zones-server