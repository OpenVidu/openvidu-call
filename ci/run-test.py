#!/usr/bin/python2.7

from vncdotool import api
import time

client = api.connect('localhost::5900', 'selenoid')

client.keyPress('alt-f1')
time.sleep(5) 

for k in "su - ubuntu":
  client.keyPress(k)
client.keyPress('enter')
time.sleep(1)

for k in "cd openvidu-call/front/openvidu-call/":
  client.keyPress(k)
client.keyPress('enter')
time.sleep(1)

for k in "./node_modules/":
  client.keyPress(k)

for k in "\@":
  client.keyPress(k)

for k in "angular/cli/bin/ng e2e > /workdir/results.txt ":
  client.keyPress(k)
time.sleep(2)
client.keyPress('enter')

time.sleep(300)

