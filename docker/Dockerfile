### Stage 1: Build the frontend
FROM node:20 as build-frontend

USER node

WORKDIR /app/frontend

ARG BASE_HREF=/

COPY --chown=node:node frontend/ ./

# Build the frontend application with the specified base href
RUN npm install && \
    npm run build ${BASE_HREF}

# Move the built files to the correct location
RUN mkdir -p /app/frontend/dist/openvidu-call && \
	mv ../backend/dist/public/* /app/frontend/dist/openvidu-call/ && \
	chown -R node:node /app/frontend/dist/openvidu-call

### Stage 2: Build the backend
FROM node:20 as build-backend

USER node

WORKDIR /app/backend

COPY --chown=node:node backend/package*.json ./

RUN npm install

COPY --chown=node:node backend/ ./

RUN mkdir -p /app/backend/dist/src && chown -R node:node /app/backend/dist

# Copy static files from the frontend build
COPY --from=build-frontend /app/frontend/dist/openvidu-call /app/backend/dist/public

RUN npm run build


### Stage 3: Final production image
FROM node:20-alpine as production

WORKDIR /opt/openvidu-call

COPY --from=build-backend /app/backend/dist ./dist
COPY --from=build-backend /app/backend/package*.json ./

RUN npm install --production && npm cache clean --force

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh && \
	chown -R node:node /opt/openvidu-call

EXPOSE $SERVER_PORT

CMD ["/usr/local/bin/entrypoint.sh"]
