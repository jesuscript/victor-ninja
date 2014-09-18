#!/bin/bash

cd routing-service/
git submodule foreach --recursive git checkout develop
git checkout develop
git submodule foreach --recursive git pull
git pull


