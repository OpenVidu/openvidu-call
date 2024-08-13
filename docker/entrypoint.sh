#!/bin/sh

# Function to handle termination signals
terminate_process() {
    echo "Terminating Node.js process..."
    pkill -TERM node
}

# Trap termination signals
trap terminate_process TERM INT

cd /opt/openvidu-call || { echo "Can't cd into /opt/openvidu-call"; exit 1; }
node dist/src/server.js &

# Save the PID of the Node.js process
node_pid=$!

# Wait for the Node.js process to finish
wait $node_pid
