# Build OpenVidu Call for production
FROM node:latest as build
WORKDIR /openvidu-call
RUN apt-get update && \
    apt-get install -y wget unzip && \
    apt-get clean && \
    apt-get autoclean && \
    rm -Rf /tmp/* && \
    rm -Rf /var/lib/apt/lists/*

RUN wget "https://github.com/OpenVidu/openvidu-call/archive/master.zip" -O openvidu-call.zip && \
    unzip openvidu-call.zip && \
    rm openvidu-call.zip && \
    folder=openvidu-call-master/front/openvidu-call/* && \
    mv $folder .

RUN npm install && \
    npm run build-prod

# Serving OpenVidu Call with Nginx
FROM nginx:1.17.9

RUN apt-get update && \
    apt-get install -y curl wget && \
    apt-get clean && \
    apt-get autoclean && \
    rm -Rf /tmp/* && \
    rm -Rf /var/lib/apt/lists/*

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