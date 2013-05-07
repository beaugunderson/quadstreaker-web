#!/usr/bin/env python2.7

# This proxy is necessary because using an Apache2 proxy results in 5xx errors
# on the quadstreaker side.

import cgi
#import cgitb; cgitb.enable()
import os
import requests

qs = cgi.parse_qs(os.environ["QUERY_STRING"])

BASE_URI = "https://api.quadstreaker.com/mobile"
ACCESS_TOKEN = open('.access_token', 'r').read()

login_request = requests.get('%s/login/?accessToken=%s' % (BASE_URI,
    ACCESS_TOKEN), verify=False)

map_request = requests.get('%s/getVisitMap/?userId=%s' % (BASE_URI,
    qs["userId"][0]), verify=False, cookies=login_request.cookies)

print "Content-Type: %s" % map_request.headers['Content-Type']
print

print map_request.text
