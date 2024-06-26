#!/bin/sh

# Function to handle termination signals
terminate_process() {
    echo "Terminating Node.js process..."
    pkill -TERM node
}

# Trap termination signals
trap terminate_process TERM INT

if [ -z "${LIVEKIT_URL}" ]; then
    echo "LIVEKIT_URL is required"
    echo "example: docker run -e LIVEKIT_URL=https://livekit-server:7880 -e LIVEKIT_API_KEY=api_key -e LIVEKIT_API_SECRET=api_secret -p 5000:5000 openvidu-call"
    exit 1
fi
if [ -z "${LIVEKIT_API_KEY}" ]; then
    echo "LIVEKIT_API_KEY is required"
    echo "example: docker run -e LIVEKIT_URL=https://livekit-server:7880 -e LIVEKIT_API_KEY=api_key -e LIVEKIT_API_SECRET=api_secret -p 5000:5000 openvidu-call"
    exit 1
fi
if [ -z "${LIVEKIT_API_SECRET}" ]; then
    echo "LIVEKIT_API_SECRET is required"
    echo "example: docker run -e LIVEKIT_URL=https://livekit-server:7880 -e LIVEKIT_API_KEY=api_key -e LIVEKIT_API_SECRET=api_secret -p 5000:5000 openvidu-call"
    exit 1
fi

# openvidu-call configuration
cat>/opt/openvidu-call/.env<<EOF
SERVER_PORT=${SERVER_PORT}
LIVEKIT_URL=${LIVEKIT_URL}
LIVEKIT_URL_PRIVATE=${LIVEKIT_URL_PRIVATE}
LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
USE_HTTPS=${USE_HTTPS}
CALL_ADMIN_SECRET=${CALL_ADMIN_SECRET}
CALL_PRIVATE_ACCESS=${CALL_PRIVATE_ACCESS}
CALL_USER=${CALL_USER}
CALL_SECRET=${CALL_SECRET}
CALL_RECORDING=${CALL_RECORDING}
CALL_BROADCAST=${CALL_BROADCAST}
CALL_RECORDING_PATH=${CALL_RECORDING_PATH}
EOF

cd /opt/openvidu-call
node dist/server.js &

# Save the PID of the Node.js process
node_pid=$!

# Wait for the Node.js process to finish
wait $node_pid