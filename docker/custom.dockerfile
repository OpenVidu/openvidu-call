# Build OpenVidu Call for production
FROM node:lts-alpine3.13 as openvidu-call-build

WORKDIR /openvidu-call

ARG BASE_HREF=/
ARG OPENVIDU_BROWSER=DEFAULT

RUN apk add wget git

COPY . .

# Build OpenVidu call
RUN if [ ${OPENVIDU_BROWSER} != "DEFAULT" ]; then \
        # Install specific version of openvidu-browser
        git clone https://github.com/OpenVidu/openvidu -b ${OPENVIDU_BROWSER} && \
        cd openvidu/openvidu-browser && \
        npm install && \
        npm run build && \
        npm link && \
        cd ../../; \
    fi && \
    rm openvidu-call-front/package-lock.json && \
    rm openvidu-call-back/package-lock.json && \
    # Install openvidu-call-front dependencies and build it for production
    cd openvidu-call-front && npm install && \
    if [ ${OPENVIDU_BROWSER} != "DEFAULT" ]; then \
        npm link openvidu-browser; \
    fi && \
    cd ../ && npm run build-prod ${BASE_HREF} --prefix openvidu-call-front && \
    rm -rf openvidu-call-front && \
    # Install openvidu-call-back dependencies and build it for production
    npm i --prefix openvidu-call-back && \
    npm run build --prefix openvidu-call-back && \
    mv openvidu-call-back/dist . && \
    rm -rf openvidu-call-back openvidu


FROM node:lts-alpine3.13

WORKDIR /opt/openvidu-call

COPY --from=openvidu-call-build /openvidu-call/dist .
# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin
RUN apk add curl && \
    chmod +x /usr/local/bin/entrypoint.sh && \
    npm install -g nodemon

# CMD /usr/local/bin/entrypoint.sh
CMD ["/usr/local/bin/entrypoint.sh"]
