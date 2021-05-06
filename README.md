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


## Configure docker on your machine (if required):

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

## Docker compose

### Production
```
$ docker-compose up  // run docker-compose
$ docker-compose up -d  // run docker-compose in background
$ docker-compose up --build  // rebuild and run docker-compose
$ docker-compose down  //stop docker-compose
$ docker-compose ps  //container created from docker-compose
```

### Development 
```
$ docker-compose -f docker-compose.dev.yml up  // run docker-compose
$ docker-compose -f docker-compose.dev.yml up -d  // run docker-compose in background
$ docker-compose -f docker-compose.dev.yml up --build  // rebuild and run docker-compose
$ docker-compose -f docker-compose.dev.yml down  //stop docker-compose
$ docker-compose -f docker-compose.dev.yml ps  //container created from docker-compose
```

## Other commands

```
$ docker ps --all
$ docker logs <containerID>
$ docker exec -it <comntainerID> sh
```
