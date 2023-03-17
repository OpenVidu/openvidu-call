#!/bin/bash -x

VERSION=$1
if [[ ! -z $VERSION ]]; then
    cd ..
    docker build --pull --no-cache --rm=true -f docker/Dockerfile.node -t openvidu/openvidu-call:$VERSION-demos --build-arg BASE_HREF=/openvidu-call/ .
else
    echo "Error: You need to specify a version as first argument"
fi
