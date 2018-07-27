#!/bin/bash -x
set -eu -o pipefail

OV_PROFILE=${OV_PROFILE:-docker}  #

if [ "$OV_PROFILE" == "ngrok" ]; then
	cp /supervisord-ngrok.conf /etc/supervisor/conf.d/supervisord.conf
fi

/usr/bin/supervisord