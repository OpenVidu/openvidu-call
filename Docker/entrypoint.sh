#!/bin/bash

[[ -z "${OPENVIDU_URL}" ]] && export OPENVIDU_URL=$(curl -s ifconfig.co)
[[ -z "${OPENVIDU_SECRET}" ]] && export OPENVIDU_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

echo "OPENVIDU URL: ${OPENVIDU_URL}"
echo "OPENVIDU SECRET: ${OPENVIDU_SECRET}"

# openvidu-call configuration
cat>/var/www/openvidu-call/ov-settings.json<<EOF
{
        "openviduSettings": {
                "chat": true,
                "autopublish": false,
                "toolbarButtons": {
                        "audio": true,
                        "video": true,
                        "screenShare": true,
                        "fullscreen": true,
                        "exit": true
                }
        },
        "openviduCredentials": {
                "openvidu_url": "${OPENVIDU_URL}",
                "openvidu_secret": "${OPENVIDU_SECRET}"
        }
}
EOF

chown www-data:www-data /var/www/openvidu-call/ov-settings.json
service nginx restart

tail -f /var/log/nginx/*.log