# Build OpenVidu Call for production
FROM node:13.12.0-alpine as build

WORKDIR /openvidu-call
RUN apk update && \
    apk add wget unzip

    # Download openvidu-call from master
RUN wget "https://github.com/OpenVidu/openvidu-call/archive/ov_backend.zip" -O openvidu-call.zip && \
    unzip openvidu-call.zip && \
    rm openvidu-call.zip && \
    mv openvidu-call-ov_backend/openvidu-call-front/ . && \
    mv openvidu-call-ov_backend/openvidu-call-back/ . && \
    rm -rf openvidu-call/package-lock.json && \
    rm -rf openvidu-call-ov_backend

    # Download openvidu-browser from master
RUN wget "https://github.com/OpenVidu/openvidu/archive/master.zip" -O openvidu-browser.zip && \
    unzip  openvidu-browser.zip openvidu-master/openvidu-browser/* && \
    rm openvidu-browser.zip && \
    mv openvidu-master/openvidu-browser/ . && \
    rm -rf openvidu-master

    # Compile openvidu-browser, install it in openvidu-call and build it for production
RUN npm install --prefix openvidu-browser && \
    npm run build --prefix openvidu-browser/ && \
    npm pack openvidu-browser/ && \
    npm install --prefix openvidu-call-front openvidu-browser*.tgz && \
    npm install --prefix openvidu-call-front && \
    npm run build-prod --prefix openvidu-call-front && \
    npm install --prefix openvidu-call-back && \
    npm run build --prefix openvidu-call-back && \
    mv openvidu-call-back/dist openvidu-call-back/node_modules openvidu-call-back/public . && \
    rm -rf openvidu-**

RUN mv /openvidu-call /opt/
RUN ls /opt/openvidu-call/

# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD /usr/local/bin/entrypoint.sh
