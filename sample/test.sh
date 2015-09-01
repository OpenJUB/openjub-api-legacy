#!/bin/bash
echo "LOGOUT"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/signout
echo ""
echo "STATUS"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/status
echo ""
echo "ONCAMPUS"
curl -b cookie.jar -c cookie.jar http://localhost:6969/auth/isoncampus
echo ""
echo "LOGIN"
curl -c cookie.jar --data "username=$1&password=$2" http://localhost:6969/auth/signin
echo ""
echo "ME"
curl -b cookie.jar -c cookie.jar http://localhost:6969/user/me
echo ""
echo "NAME=TWIESING"
curl -b cookie.jar -c cookie.jar http://localhost:6969/user/name/twiesing
echo ""
echo "ID=30352,somefields"
curl -b cookie.jar -c cookie.jar http://localhost:6969/user/id/30352?fields=lastName,phone
echo ""
echo "SEARCH=Tom"
curl -b cookie.jar -c cookie.jar http://localhost:6969/search/Tom
echo ""
echo "QUERY=username:dkundel"
curl -b cookie.jar -c cookie.jar http://localhost:6969/query/username:dkundel
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
