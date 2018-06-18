#!/bin/bash -x

/usr/bin/supervisord &
sleep 2
/usr/local/bin/startvnc.sh &

sleep 30

python /home/ubuntu/run-test.py

cat /workdir/results.txt

EXIT_CODE=$(grep "Process exited with error code 1" /workdir/results.txt )
if [ -z "$EXIT_CODE" ]; then 
	exit 0;
else 
	exit 1;
fi
