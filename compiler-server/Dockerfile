FROM node:22-alpine
WORKDIR /app
RUN apk update && apk add --no-cache g++
COPY . .
RUN npm install
EXPOSE 8000
CMD ["node", "index.js"]
