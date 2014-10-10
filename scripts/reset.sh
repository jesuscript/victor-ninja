#!/bin/bash

git submodule init
git submodule update
cd routing-service/
git submodule foreach --recursive git checkout develop
git checkout develop
git submodule foreach --recursive git pull
git pull
npm install

