#!/bin/bash -x

IMAGE="${1:-?echo "Error: You need to specify an image name as first argument"?}"
if [[ -n $IMAGE ]]; then
    cd ..
    export BUILDKIT_PROGRESS=plain && docker build --pull --no-cache --rm=true -f docker/Dockerfile -t "$IMAGE"-demos --build-arg BASE_HREF=/openvidu-call/ .
else
    echo "Error: You need to specify the image name as first argument"
fi
