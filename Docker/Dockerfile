FROM nginx

RUN apt-get update \
    && apt-get install -y curl wget

# Install openvidu-call
RUN mkdir -p /var/www/openvidu-call
RUN wget -L -O /var/www/openvidu-call/openvidu-call.tar.gz \
"https://github.com/OpenVidu/openvidu-call/releases/download/v2.12.0/openvidu-call-2.12.0.tar.gz"
RUN tar zxf /var/www/openvidu-call/openvidu-call.tar.gz -C /var/www/openvidu-call
RUN chown -R www-data:www-data /var/www/openvidu-call

# Nginx conf
COPY ./openvidu-call.conf /etc/nginx/conf.d/default.conf

# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh

# Cleaning the house
RUN rm /var/www/openvidu-call/openvidu-call.tar.gz
RUN apt-get clean && \
    apt-get autoclean && \
    rm -Rf /tmp/* && \
    rm -Rf /var/lib/apt/lists/*

CMD /usr/local/bin/entrypoint.sh