FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install lightningcss-linux-x64-gnu
RUN npm install @tailwindcss/oxide@latest --force

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]