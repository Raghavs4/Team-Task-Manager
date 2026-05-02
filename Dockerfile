FROM node:20-alpine

WORKDIR /app

COPY team-task-manager-backend/package*.json ./
RUN npm install

COPY team-task-manager-backend/ .

EXPOSE 5000

CMD ["node", "server.js"]
