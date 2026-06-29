# API Webhook Orchestrator

A lightweight Node.js orchestration service that manages two other backend projects — [api-integration-gateway](https://github.com/your-username/api-integration-gateway) and [webhook-ingestion-service](https://github.com/your-username/webhook-ingestion-service) — by controlling their Docker containers and monitoring their application-level health.

This project was built to demonstrate infrastructure-focused backend engineering: managing services from the outside, with no direct imports or shared dependencies between projects, purely through the Docker Engine API and HTTP.

## Key Features

* **Docker Container Management:** Start, stop, list, and inspect containers programmatically via the Docker Engine API (using `dockerode`), without relying on the `docker` CLI.
* **Two-Layer Health Verification:** Distinguishes between **infrastructure-level** status (is the container running, according to Docker?) and **application-level** health (does the app inside the container actually respond?) by making real HTTP requests to each service's `/health` endpoint.
* **Graceful Conflict Handling:** Recognizes Docker's own status conventions (e.g. attempting to start an already-running container) and returns clear, successful responses instead of generic errors.
* **Consistent Error Propagation:** Preserves and forwards the original error details (status code and reason) from the Docker API all the way to the client, instead of masking everything behind a generic `500` response.
* **Centralized Service Configuration:** A single config file maps each managed service to its container name and health-check URL, keeping service-specific details out of the route logic.
* **Zero Coupling:** No imports, shared code, or direct dependencies on the two managed projects — all communication happens externally, through Docker and plain HTTP, exactly as it would with services running on separate machines.

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Docker SDK:** dockerode
* **HTTP Client:** Axios

## Project Structure

```text
api-webhook-orchestrator/
├── config/
│   └── services.js      # Maps each managed service to its container name and health URL
├── services/
│   ├── containerService.js   # Docker-level operations: list, inspect, start, stop
│   └── healthService.js      # Application-level health checks via HTTP
├── index.js              # Express server and route definitions
└── package.json
```

## Installation & Setup

> **Prerequisite:** Docker must be installed and running, and the `api-integration-gateway` and `webhook-ingestion-service` containers must already be built (see their respective READMEs).

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd api-webhook-orchestrator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the managed containers** (if not already running)
   ```bash
   docker run -d -p 3000:3000 --env-file src/.env --name api-gateway api-integration-gateway
   docker run -d -p 8000:3000 --env-file .env -v <absolute-path>/data:/app/data --name webhook-service webhook-ingestion-service
   ```

4. **Start the orchestrator**
   ```bash
   node index.js
   ```
   The server runs on port `5000`.

## Configuration

Managed services are defined in `config/services.js`:

```javascript
module.exports = {
  services: {
    apiGateway: {
      healthUrl: 'http://localhost:3000/api/health',
      containerName: 'api-gateway',
    },
    webhookService: {
      healthUrl: 'http://localhost:8000/webhook/health',
      containerName: 'webhook-service',
    },
  }
};
```

To manage an additional service, add a new entry here — no other code changes are required for health checks.

## API Reference

### Containers

#### List all containers
Returns Docker-level information for every container (running or stopped).
* **Endpoint:** `GET /containers`

#### Get container details
Returns a filtered set of details for a single container (id, name, image, state, created date). Sensitive data such as environment variables is intentionally excluded.
* **Endpoint:** `GET /containers/:id`
* **Example Response:**
  ```json
  {
    "id": "f66f4168cb86...",
    "name": "/api-gateway",
    "image": "api-integration-gateway",
    "state": "running",
    "created": "2026-06-17T18:51:31.993Z"
  }
  ```

#### Start a container
* **Endpoint:** `POST /containers/:id/start`
* **Example Response (success):**
  ```json
  { "message": "Container api-gateway started successfully" }
  ```
* **Example Response (already running):**
  ```json
  { "message": "Container api-gateway is already running" }
  ```

#### Stop a container
* **Endpoint:** `POST /containers/:id/stop`
* **Example Response (success):**
  ```json
  { "message": "Container api-gateway stopped successfully" }
  ```
* **Example Response (already stopped):**
  ```json
  { "message": "Container api-gateway is already stopped" }
  ```

### Health

#### Check application-level health
Makes a real HTTP request to the managed service's own `/health` endpoint, verifying that the application inside the container is actually responding — not just that the container process is running.
* **Endpoint:** `GET /health/:service`
* **Valid `:service` values:** `apiGateway`, `webhookService`
* **Example Response:**
  ```json
  { "status": "ok" }
  ```

## Error Handling

Errors from the Docker Engine API are preserved and forwarded to the client with their original status code and message wherever possible, instead of being collapsed into a generic `500` response.

| Scenario                          | Status Code | Example Response                                                              |
|------------------------------------|--------------|---------------------------------------------------------------------------------|
| Container not found                | 404          | `{ "error": "(HTTP code 404) no such container - No such container: xyz " }` |
| Container already running/stopped  | 200          | `{ "message": "Container xyz is already running" }`                          |
| Unexpected/internal error          | 500          | `{ "error": "Failed to retrieve container details" }`                        |

## Design Notes

* **Why a separate orchestrator instead of extending one of the existing services?** Keeping container lifecycle management in its own service mirrors how infrastructure tooling works in real systems — the orchestrator has no knowledge of what the managed services *do* internally, only whether they are running and healthy. This keeps the three projects independently deployable and testable.
* **Why two layers of health checking?** A container can be reported as `running` by Docker while the application inside it has crashed or is unresponsive (e.g. the Node process inside is alive but the Express server failed to bind to its port). Separating Docker-level state from application-level health makes it possible to pinpoint *where* a problem is occurring during debugging.

## Related Projects

* [api-integration-gateway](https://github.com/AlesBam/api-integration-gateway) — connects to multiple external APIs and unifies their responses
* [webhook-ingestion-service](https://github.com/AlesBam/webhook-ingestion-service) — receives and processes webhook events with signature verification and retry logic