FROM nginx:alpine
COPY telegram-mini-app/index.html /usr/share/nginx/html/index.html
EXPOSE 80
