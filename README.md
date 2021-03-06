# strava-sync-backend

# Project Structure

- src/
  - config - app configuration
  -  controllers - business logic
  -  interfaces - defined TS types and interfaces
  -  jobs - periodic task
  -  loaders - prepare services
  -  routes - API endpoints
  -  services - execute task 
  -  types - application models and types
  -  utils - common supportive functions
  -  app.ts - appplication starting point
- .env - env variables
- test/ - tests

# Run

## Production 
```
$ npm install
$ npm run build
$ node ./build/app.js
```
## Development
```
$ npm install 
$ npm run start
```
# Docker 

## Production


### Configure docker on your machine:

- edit /lib/systemd/system/docker.service

```
[Service]
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://127.0.0.1:2375
```

- reload daemon and docker service
```
$ sudo systemctl daemon-reload
$ sudo systemctl restart docker.service

```


### Build and run docker container

```
$ docker build -t <YOUR_NAME>/strava-sync .
$ docker run --env-file ./.env --name strava-sync -p 0.0.0.0.8080:8080 -d <YOUR_NAME>/strava-sync 
```
## Development
```
$ docker build -f Dockerfile.dev -t <YOUR_NAME>/strava-sync-dev .
$ docker run --name strava-sync -p 8080:8080 -d <YOUR_NAME>/strava-sync-dev
$ docker run --name strava-sync-dev -p 8080:8080 -d -v ~/<PATH_TO_YOUR_PROJECT_FOLDER>/src:/usr/app/src <YOUR_NAME>/strava-sync-dev
```

## Other commands
```
$ docker ps --all
$ docker logs <containerID>
$ docker exec -it <comntainerID> sh
```


## Docker compose 
```
$ docker-compose up  // run docker-compose
$ docker-compose up -d  // run docker-compose in background
$ docker-compose up --build  // rebuild and run docker-compose
$ docker-compose down  //stop docker-compose
$ docker-compose ps  //container created from docker-compose
```