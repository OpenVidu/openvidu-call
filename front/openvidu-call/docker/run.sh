#!/bin/bash -x
set -eu -o pipefail

if [ "$OV_PROFILE" == "ngrok" ]; then
	cp /supervisord-ngrok.conf /etc/supervisor/conf.d/supervisord.conf
else
	sed -i "s/OV_PROFILE/$OV_PROFILE/" /etc/supervisor/conf.d/supervisord.conf
    sed -i "s/OV_PUBLIC_URL/$OV_PUBLIC_URL/" /etc/supervisor/conf.d/supervisord.conf
fi

/usr/bin/supervisord