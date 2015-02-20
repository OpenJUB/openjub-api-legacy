#!/bin/bash

curl -c cookie.jar --data "username=$1&password=$2" http://localhost:6969/login/signin
curl -c cookie.jar http://localhost:6969/login/status
rm cookie.jar
