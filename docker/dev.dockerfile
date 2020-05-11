# Build OpenVidu Call for production
FROM node:lts-alpine3.11 as openvidu-browser-build

WORKDIR /openvidu-browser

RUN apk add wget unzip

# Download openvidu-browser from master, compile and pack it
RUN wget "https://github.com/OpenVidu/openvidu/archive/master.zip" -O openvidu-browser.zip && \
    unzip openvidu-browser.zip openvidu-master/openvidu-browser/* && \
    rm openvidu-browser.zip && \
    mv openvidu-master/openvidu-browser/ . && \
    rm -rf openvidu-master && \
    npm i --prefix openvidu-browser && \
    npm run build --prefix openvidu-browser/ && \
    npm pack openvidu-browser/ && \
    rm -rf openvidu-browser

FROM node:lts-alpine3.11 as openvidu-call-build

WORKDIR /openvidu-call

ARG BRANCH=master
ARG BASE_HREF=/

COPY --from=openvidu-browser-build /openvidu-browser/openvidu-browser-*.tgz .

RUN apk add wget unzip

# Download openvidu-call from specific branch (master by default), intall openvidu-browser and build for production
RUN wget "https://github.com/OpenVidu/openvidu-call/archive/${BRANCH_NAME}.zip" -O openvidu-call.zip && \
    unzip openvidu-call.zip && \
    rm openvidu-call.zip && \
    mv openvidu-call-${BRANCH_NAME}/openvidu-call-front/ . && \
    mv openvidu-call-${BRANCH_NAME}/openvidu-call-back/ . && \
    rm openvidu-call-front/package-lock.json && \
    rm openvidu-call-back/package-lock.json && \
    rm -rf openvidu-call-${BRANCH_NAME} && \
    # Install openvidu-browser in openvidu-call and build it for production
    npm i --prefix openvidu-call-front openvidu-browser-*.tgz && \
    npm i --prefix openvidu-call-front && \
    npm run build-prod ${BASE_HREF} --prefix openvidu-call-front && \
    rm -rf openvidu-call-front && \
    # Install openvidu-call-back dependencies and build it for production
    npm i --prefix openvidu-call-back && \
    npm run build --prefix openvidu-call-back && \
    mv openvidu-call-back/dist . && \
    rm -rf openvidu-call-back


FROM node:lts-alpine3.11

WORKDIR /opt/openvidu-call

COPY --from=openvidu-call-build /openvidu-call/dist .
# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN apk add curl && \
    chmod +x /usr/local/bin/entrypoint.sh && \
    npm install -g nodemon

# CMD /usr/local/bin/entrypoint.sh
CMD ["/usr/local/bin/entrypoint.sh"]
