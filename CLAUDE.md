# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Drona Composer is a Flask + React application deployed as an Open OnDemand (OOD) Passenger app. It provides a web UI for HPC researchers to compose, preview, and submit batch jobs (SLURM) on TAMU HPRC clusters.

## Commands

### Frontend (React/Webpack)

```bash
npm run build             # Dev build (outputs to static/dist/)
npm run build:prod        # Production build
npm run build-watch       # Watch mode during development
npm run test              # Run Jest tests
npm run test:coverage     # Jest with coverage report
```

### Backend (Flask/Python)

```bash
./setup.sh                # Full setup: creates venv, installs deps, builds frontend
source .venv/bin/activate
pip install -r requirements.txt
python app.py             # Run Flask dev server on localhost:5000
```

### Running a single Jest test

```bash
npx jest src/path/to/TestFile.test.js
npx jest --testNamePattern="test name substring"
```

## Architecture

### Request Flow

The React frontend communicates with the Flask backend exclusively through `/jobs/composer/*` routes. `document.dashboard_url` (injected by the Jinja2 template at runtime) is used as the base URL for all API calls — **except** `src/schemaRendering/utils/utils.js` which reads from `config.yml` instead. This is a known inconsistency.

### Backend Route Registration

`views/job_composer.py` is the Flask blueprint entry point. It calls `register_*_routes()` from each sub-module:

| Module              | Routes                                                           |
| ------------------- | ---------------------------------------------------------------- |
| `environments.py`   | `/environments`, `/add_environment`                              |
| `schema_routes.py`  | `/schema/<env>`, `/map/<env>`, `/evaluate_*`, `/evaluate_script` |
| `job_routes.py`     | `/preview`, `/submit`, `/history`                                |
| `file_utils.py`     | `/upload`, `/download_file`                                      |
| `socket_handler.py` | WebSocket for streaming job output                               |
| `config_routes.py`  | `/config`                                                        |
| `utils.py`          | `/mainpaths`                                                     |

### Job Submission Flow

1. **Preview** (`POST /preview`): Generates a `drona_job_id`, determines `location` (output directory), calls `Engine.preview_script()`. Returns the generated bash script for review. The `drona_job_id` and `location` are the source of truth — the submit step must not change them.

2. **Submit** (`POST /submit`): Uses the `drona_job_id` and `location` from preview. Calls `Engine.generate_script()` and `Engine.generate_driver_script()`, saves job record to SQLite history (`JobHistoryManager`), returns `bash_cmd` to the frontend.

3. **Execute** (WebSocket): Frontend sends the `bash_cmd`; `socket_handler.py` runs it in a PTY and streams output back in real-time.

### Engine & Environments

An **environment** is a directory containing:

- `schema.json` — Form field definitions. Supports `$ref`, container types, visibility conditions, and "retriever" scripts for dynamic dropdowns.
- `map.json` — Maps field names to template variable names.
- `template.txt` — Bash script template. Placeholders: `<var>field_name</var>`, dynamic calls: `!function_name(params)`.
- `utils.py` (optional) — Environment-specific Python helper functions called by `!function_name()` syntax.

`machine_driver_scripts/engine.py` is the core script generator. It loads the environment, resolves template placeholders against submitted form values, and executes `!function_name()` calls.

### Script Resolution in `evaluate_script`

`views/schema_routes.py::execute_script()` resolves `retriever_path` in two steps:

1. Look in `DRONA_ENV_DIR/<retriever_path>` (the environment's own directory)
2. Fall back to `runtime_support/retriever_scripts/<retriever_path>`

If neither exists, it raises an `APIError` with `status_code=404`.

### User Data Locations

User job environments and history live under a configurable `drona_dir`, stored in `~/.drona/config.json`. Default path: `/scratch/user/$USER/drona_wfe` (symlinked from `drona_composer` during first-run migration in `views/utils.py::probe_and_autofix_config()`).

- Environments: `<drona_dir>/environments/`
- Job history DB: `<drona_dir>/jobs/job_history.db`
- Job run output: `<drona_dir>/runs/<job_name>/`

### Config

`config.yml` is the webpack-bundled frontend config (aliased as `@config`). It sets `dashboard_url` per environment:

```yaml
development:
  dashboard_url: "/pun/dev/Drona_Composer"
production:
  dashboard_url: "/pun/sys/drona"
```

Flask detects dev vs prod by checking if the app's working directory path contains `dev` or `sys`. The `cluster_name` field in `config.yml` drives cluster-specific behavior in `machine_driver_scripts/`.

## Workflow Requirements

- **Always use MCP servers and superpowers skills** for every task. This includes:
  - **Superpowers skills**: Use brainstorming before features, TDD before implementation, systematic-debugging before fixes, code-review when completing work, episodic-memory to recall past conversations.
  - **MCP servers**: Leverage episodic-memory, Google Calendar, Gmail, and claude-vscode integrations whenever relevant.
- Never skip these workflows, even for seemingly simple tasks.

### Key Known Issues / Gotchas

- **Double-submit**: The same `drona_job_id` on two rapid submits previously caused a SQLite `UNIQUE constraint` crash. Fixed by using `INSERT OR REPLACE` in `history_manager.py::save_job()`. The submit button is also disabled via `isJobRunning` in `SplitScreenModal.js` as a UI guard.
- **`evaluate_script` URL**: `utils.js` uses `config.yml`'s `dashboard_url` instead of `document.dashboard_url`. If the app is deployed at a non-standard path, `config.yml` must be updated and the frontend rebuilt.
