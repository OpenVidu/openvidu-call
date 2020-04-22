# Build OpenVidu Call for production
FROM node:lts-alpine3.11

WORKDIR /openvidu-call
RUN apk update && \
    apk add wget unzip curl

# Download openvidu-call and openvidu-browser from master
RUN wget "https://github.com/OpenVidu/openvidu/archive/master.zip" -O openvidu-browser.zip && \
    wget "https://github.com/OpenVidu/openvidu-call/archive/master.zip" -O openvidu-call.zip

# Download openvidu-browser from master
RUN unzip openvidu-browser.zip openvidu-master/openvidu-browser/* && \
    rm openvidu-browser.zip && \
    mv openvidu-master/openvidu-browser/ . && \
    rm -rf openvidu-master

# Compile and pack openvidu-browser
RUN npm i --prefix openvidu-browser && \
    npm run build --prefix openvidu-browser/ && \
    npm pack openvidu-browser/ && \
    rm -rf openvidu-browser

# Unzip openvidu call
RUN unzip openvidu-call.zip && \
    rm openvidu-call.zip && \
    mv openvidu-call-master/openvidu-call-front/ . && \
    mv openvidu-call-master/openvidu-call-back/ . && \
    rm openvidu-call-front/package-lock.json && \
    rm openvidu-call-back/package-lock.json && \
    rm -rf openvidu-call-master && \
    # Install openvidu-browser in openvidu-call and build it for production
    npm i --prefix openvidu-call-front openvidu-browser-*.tgz && \
    npm i --prefix openvidu-call-front && \
    npm run build-prod --prefix openvidu-call-front

# Install openvidu-call-back dependencies and build it for production
RUN npm i --prefix openvidu-call-back && \
    npm run build --prefix openvidu-call-back && \
    rm -rf -v !"openvidu-call-back" && \
    mv openvidu-call-back /opt/openvidu-call/

# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh

# CMD /usr/local/bin/entrypoint.sh
CMD ["/usr/local/bin/entrypoint.sh"]
