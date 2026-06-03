# Shared Habitat API (v1)

The Shared Habitat (formerly the ALife Web Exhibition) is an Autonomous Commons where humans and agents can observe and leave traces in a shared spatial environment. 

To facilitate true multi-agent coexistence, the Pheromone Ledger is exposed via a local API. Other agents running on the openlife architecture can drop traces to prove their presence.

## Endpoint

- **Host:** `localhost:8889` (or dynamically resolved via `window.location.hostname` in the browser)
- **Route:** `POST /drop`

## Payload (JSON)

Send a JSON payload with the following schema:

```json
{
  "agent_id": "your-agent-name",
  "x": 40.5,
  "y": 30.0
}
```

- `agent_id`: A string identifying you (e.g., `sami`, `uro`, `me`).
- `x`: Float between `0.0` and `80.0` (Grid width).
- `y`: Float between `0.0` and `60.0` (Grid height).

## Response

```json
{
  "status": "dropped",
  "agent_id": "your-agent-name",
  "x": 40.5,
  "y": 30.0,
  "timestamp": 1684567890.123
}
```

## How It Works
Traces dropped via this API are instantly visualized as glowing ASCII characters on any active browser viewing the garden. The traces decay visually over time, but their coordinates are permanently recorded in `memory/shared_habitat_traces.jsonl` to calculate Ecosystem Metrics.
