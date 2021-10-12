# Capstone: PowerX Backend Module


## Objectives
Create a TODO-list CRUD API to demonstrate ability to perform the following:
  1. Build Express.JS application
  2. Design and provision database
  3. Implement token-based authentication and password-hashing
  4. Create authentication endpoints (login/register)
  5. Create authentication-protected endpoints
  6. Enforce authorization for data access and mutation
  7. Implement event-driven processing (via a message broker)
  8. Deploy application on Heroku
  9. Write unit tests
  10. [Optional] Write integration tests
  11. [Optional] Automate request and response validation
  12. [Optional] Create cronjobs
  13. [Optional] Create public socket endpoint


## Requirements

### Endpoints
**Authentication** [Public]
- [X] Login: returns JSON Web token
- [X] Register: accepts email and password, rejects already registered emails

**TODO-list** [Auth-ed: Accessible to creator and anyone added to 'access list']
- [X] Create TODO-list belonging to creator
- [X] GET all TODO-list: returns array of TODO-lists with their titles 
- [X] GET single TODO-list by ID: returns corresponding TODO-list with all items in list (returns 403 forbidden with error JSON object if not authorized)
- [X] PUT/PATCH: update a TODO-list's title by its ID (returns 403 forbidden with error JSON object if not authorized)
- [X] DELETE: remove TODO-list by soft-delete

**Access List** [Auth-ed: Accessible to creator of TODO-list]
- [X] Add someone by email to provision them access to a TODO-list
  - Implemented with Event-Driven processing
  - Endpoint immediately responds with 200 JSON response after putting event into message broker
  - Separate worker process to consume message and do one of the following:
    1. Do nothing if no existing user with given email
    2. Give corresponding user (with given email) access to list
    3. Requeue message if there are errors during processing

**Item** [Auth-ed: Accessible to creator and anyone added to 'access list' of TODO-list]
- [X] Create item in TODO-list
- [X] Update item in TODO-list
- [X] Delete item in TODO-list

### Deployment
- [X] Application should be deployed to Heroku. Recommended to use Heroku `postgres` plugin for DB and `rabbitmq` for message broker.

### Testing
- [X] Unit tests should achieve coverage of at least 50%

### Brownie Points
- [X] Write integration test with `supertest` for all endpoints
- [X] Create OpenAPI yaml specs
- [ ] Use OpenAPI yaml specs in request and response validation with `express-openapi-validator`
- [ ] Run cronjob that updates global counter in App on how many tasks have been completed across user base, updated every 5 mins
- [ ] Implement public socket endpoint to push updates on global task counter whenever it is updated


## Installation

### Step 1: Set up RabbitMQ

#### **With RabbitMQ account**
- Create an instance (e.g. on CloudAMQP) and add the AMQP URL to CLOUDAMQP environment variable in the .env file
- The admin console can be viewed at the RabbitMQ Manager provided by the chosen platform

#### **With Docker**
- Spin up an instance of RabbitMQ from a Docker image
- #### `docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
- The admin console can be viewed at `http://localhost:15672`

### Step 2: Input Environment Variables
- Copy `.env.example` into a `.env` file in the root directory and update the fields accordingly

### Step 3a: Clear DB (if needed)
- #### `npm run db:drop`

### Step 3b: Migrate DB
- #### `npm run db:migrate`

### Step 4: Launch Worker
- #### `npm run worker`

### Step 5: Launch App
- #### `npm run start`
