#!/bin/bash

echo "Testing OpenJUB real quick with curl..."
echo "If this does not crash OpenJUB, then you are in luck. "
echo "The usage is: "
echo "$1 user password"

echo "LOGOUT"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/signout
echo ""
echo "STATUS"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/status
echo ""
echo "LOGIN"
curl -c cookie.jar --data "username=$1&password=$2" http://localhost:6969/auth/signin
echo ""
echo "STATUS"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/status
echo ""
echo "LOGOUT"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/signout
echo ""
echo "STATUS"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/status
echo ""
rm cookie.jar
