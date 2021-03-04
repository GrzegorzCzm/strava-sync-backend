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
npm install
npm run build
node ./build/app.js
```
## Development
```
npm install 
npm run start
```
# Docker 

## Production
```
docker build -t czmielewski/strava-sync .
docker run --env-file ./.env -p 49000:8080 -d czmielewski/strava-sync 
```
## Development
```
docker build -f Dockerfile.dev -t czmielewski/strava-sync-dev .
docker run -p 49000:8080 -d czmielewski/strava-sync-dev
```

## Other commands
```
docker ps --all
docker logs <containerID>
docker exec -it <comntainerID> sh
```