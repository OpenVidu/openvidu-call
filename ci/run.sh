#!/bin/bash -x

/usr/bin/supervisord &
sleep 2
/usr/local/bin/startvnc.sh &

sleep 30

chmod -R 777 /workdir
cd /home/ubuntu
git clone https://github.com/openvidu/openvidu-call.git
cd openvidu-call/front/openvidu-call/
npm install
chown -R ubuntu.ubuntu /home/ubuntu/*
python /home/ubuntu/run-test.py

cat /workdir/results.txt

EXIT_CODE=$(grep "Process exited with error code 1" /workdir/results.txt )
if [ -z "$EXIT_CODE" ]; then 
	exit 0;
else 
	exit 1;
fi
