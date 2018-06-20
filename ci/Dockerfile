FROM elastestbrowsers/chrome

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends git curl build-essential zip openjdk-8-jdk supervisor python python-dev

RUN pip install vncdotool

# Installing nodejs
RUN curl -sLk https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

# Install Kurento Media Server (KMS) 
RUN echo "deb http://ubuntu.openvidu.io/6.7.0 xenial kms6" | tee /etc/apt/sources.list.d/kurento.list \
	&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 5AFA7A83 \
	&& apt-get update \
	&& apt-get -y install kurento-media-server \
	&& apt-get -y install openh264-gst-plugins-bad-1.5 \
&& rm -rf /var/lib/apt/lists/*

# Cleaning the house
RUN apt-get clean && \
    apt-get autoclean && \
    rm -Rf /tmp/* && \
    rm -Rf /var/lib/apt/lists/*

COPY run.sh /run.sh
COPY kms.sh /kms.sh
COPY openvidu-server.jar /openvidu-server.jar
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY run-test.py /home/ubuntu/run-test.py
COPY startvnc.sh /usr/local/bin

ENTRYPOINT ["/run.sh"]
