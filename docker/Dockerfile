# Build OpenVidu Call for production
FROM --platform=linux/amd64 node:20 as openvidu-call-build

WORKDIR /openvidu-call

ARG BASE_HREF=/

COPY . .

# Install openvidu-call-back dependencies
RUN cd openvidu-call-back && npm install \
    npm run build

# Build openvidu-call-back frontend
RUN cd openvidu-call-front && npm install && \
    npm run prod:build ${BASE_HREF} && \
    cd ../ && rm -rf openvidu-call-front

FROM node:20-alpine3.19

WORKDIR /opt/openvidu-call

COPY --from=openvidu-call-build /openvidu-call/openvidu-call-back .

# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN apk add --no-cache  curl && \
    chmod +x /usr/local/bin/entrypoint.sh && \
    chown -R node:node /opt/openvidu-call

USER node

EXPOSE $SERVER_PORT

CMD ["/usr/local/bin/entrypoint.sh"]
