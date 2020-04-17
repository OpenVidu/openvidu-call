# Build OpenVidu Call for production
FROM node:13.12.0-alpine as build

WORKDIR /openvidu-call
RUN apk update && \
    apk add wget unzip

    # Download openvidu-call from master
RUN wget "https://github.com/OpenVidu/openvidu-call/archive/master.zip" -O openvidu-call.zip && \
    unzip openvidu-call.zip && \
    rm openvidu-call.zip && \
    mv openvidu-call-master/front/openvidu-call/ . && \
    rm -rf openvidu-call/package-lock.json && \
    rm -rf openvidu-call-master && \
    # Download openvidu-browser from master
    wget "https://github.com/OpenVidu/openvidu/archive/master.zip" -O openvidu-browser.zip && \
    unzip  openvidu-browser.zip openvidu-master/openvidu-browser/* && \
    rm openvidu-browser.zip && \
    mv openvidu-master/openvidu-browser/ . && \
    rm -rf openvidu-master

    # Compile openvidu-browser, install it in openvidu-call and build it for production
RUN npm install --prefix openvidu-browser && \
    npm run build --prefix openvidu-browser/ && \
    npm pack openvidu-browser/ && \
    npm i --prefix openvidu-call openvidu-browser*.tgz && \
    npm install --prefix openvidu-call && \
    npm run build-prod --prefix openvidu-call && \
    mv openvidu-call/dist . && \
    rm -rf -v !"dist"

# Serving OpenVidu Call with Nginx
FROM nginx:1.17.9

# Install openvidu-call
RUN mkdir -p /var/www/openvidu-call
COPY --from=build /openvidu-call/dist/openvidu-call/ /var/www/openvidu-call
RUN chown -R www-data:www-data /var/www/openvidu-call && ls /var/www/openvidu-call

# Nginx conf
COPY ./openvidu-call.conf /etc/nginx/conf.d/default.conf

# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD /usr/local/bin/entrypoint.sh
