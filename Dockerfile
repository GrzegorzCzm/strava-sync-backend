FROM node:14 as builder
WORKDIR /usr/app/
COPY package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build
COPY ./package.json ./build
COPY ./package-lock.json ./build

FROM node:14           
WORKDIR /usr/app/
COPY --from=builder /usr/app/build ./
RUN npm install --only=production
EXPOSE 8080
CMD ["node", "./app.js"]