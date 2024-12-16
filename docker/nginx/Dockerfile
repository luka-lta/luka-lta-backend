FROM node:18 as builder

WORKDIR /app

COPY package*.json /app/

RUN npm install --force

COPY . /app

RUN npm run build


FROM nginx:latest

WORKDIR /app

RUN adduser --disabled-password --no-create-home --gecos '' app
RUN mkdir -p /var/run && chown -R app:app /var/run
RUN mkdir -p /var/cache/nginx && chown -R app:app /var/cache/nginx

COPY --from=builder /app/dist /app/public

COPY /docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

USER root
