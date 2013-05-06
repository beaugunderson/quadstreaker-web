#!/usr/bin/env python2.7

# This proxy is necessary because using an Apache2 proxy results in 5xx errors
# on the quadstreaker side.

import cgi
#import cgitb; cgitb.enable()
import os
import requests

qs = cgi.parse_qs(os.environ["QUERY_STRING"])

r = requests.get('https://api.quadstreaker.com/mobile/getVisitMap/?userId=%s' %
        qs["userId"][0], verify=False)

print "Content-Type: %s" % r.headers['Content-Type']
print

print r.text
