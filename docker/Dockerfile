FROM nginx:1.17.9

RUN apt-get update && \
    apt-get install -y curl wget && \
    apt-get clean && \
    apt-get autoclean && \
    rm -Rf /tmp/* && \
    rm -Rf /var/lib/apt/lists/*

# Install openvidu-call
RUN mkdir -p /var/www/openvidu-call && \
    wget -L -O /var/www/openvidu-call/openvidu-call.tar.gz \
        "https://github.com/OpenVidu/openvidu-call/releases/download/v2.12.0/openvidu-call-2.12.0.tar.gz" && \
    tar zxf /var/www/openvidu-call/openvidu-call.tar.gz -C /var/www/openvidu-call && \
    chown -R www-data:www-data /var/www/openvidu-call && \
    rm /var/www/openvidu-call/openvidu-call.tar.gz

# Nginx conf
COPY ./openvidu-call.conf /etc/nginx/conf.d/default.conf

# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD /usr/local/bin/entrypoint.sh