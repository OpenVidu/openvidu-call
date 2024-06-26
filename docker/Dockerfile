# Build OpenVidu Call for production
FROM --platform=linux/amd64 node:20 as openvidu-call-build

WORKDIR /openvidu-call

ARG BASE_HREF=/

COPY . .

# Build OpenVidu Call frontend
RUN cd openvidu-call-front && npm install && \
    npm run prod:build ${BASE_HREF} && \
    cd ../ && rm -rf openvidu-call-front

FROM node:20-alpine3.19

WORKDIR /opt/openvidu-call

COPY --from=openvidu-call-build /openvidu-call/openvidu-call-back .

RUN npm install -g npm

# Install backend dependencies and build it for production
RUN npm install && \
    npm run build

# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN apk add --no-cache  curl && \
    chmod +x /usr/local/bin/entrypoint.sh && \
    chown -R node:node /opt/openvidu-call

USER node

EXPOSE $SERVER_PORT

CMD ["/usr/local/bin/entrypoint.sh"]
