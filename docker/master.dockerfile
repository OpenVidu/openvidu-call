# Build OpenVidu Call for production
FROM node:13.12.0-alpine as build

WORKDIR /openvidu-call
RUN apk update && \
    apk add wget unzip

RUN wget "https://github.com/OpenVidu/openvidu-call/archive/master.zip" -O openvidu-call.zip && \
    unzip openvidu-call.zip && \
    rm openvidu-call.zip && \
    mv openvidu-call-master/front/openvidu-call/* .

RUN npm install && \
    npm run build-prod && \
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