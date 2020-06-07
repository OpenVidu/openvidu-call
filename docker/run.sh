#!/usr/bin/env bash

if [[ -z "$1" ]] || [[ -z "$2" ]]; then
    if [[ -z "$1" ]]; then
        echo "RELEASE_VERSION argument is required" 1>&2
    fi
    echo "Example of use: ./run.sh 2.14.0" 1>&2
    exit 1
fi

RELEASE_VERSION=$1
BRANCH_NAME=master
CALL_BASE_HREF=/

printf '\n'
printf '\n     -------------------------------------------------------------'
printf '\n       Installing OpenVidu Call with the following arguments:'
printf '\n'
printf '\n          Call container tag:  csantosm/openvidu-call:%s'  "${RELEASE_VERSION}"
printf '\n     -------------------------------------------------------------'
printf '\n'

docker build -f prod.dockerfile -t csantosm/openvidu-call:${RELEASE_VERSION} --build-arg BRANCH_NAME=${BRANCH_NAME} --build-arg BASE_HREF=${CALL_BASE_HREF} .

printf '\n'
printf '\n     Pushing containers to CSantosM DockerHub'
printf '\n'

docker push csantosm/openvidu-call:${RELEASE_VERSION}
