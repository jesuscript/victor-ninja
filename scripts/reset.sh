#!/bin/bash

git submodule init
git submodule update
cd routing-service/
git submodule foreach git checkout develop
git checkout develop
git submodule foreach git pull
git pull
npm install

