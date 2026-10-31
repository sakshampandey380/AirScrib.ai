# AirScribe AI

AirScribe AI is a premium full-stack air-drawing web application built with React, Vite, Tailwind CSS, Framer Motion, FastAPI, OpenCV, MediaPipe, and MySQL. Users can sketch in the air with their hand in front of a webcam, save drawings, persist raw stroke data, track gesture events, run AI recognition, and export finished work.

The UI is intentionally styled around the provided logo direction: dark navy glassmorphism surfaces with neon cyan, sky blue, and violet highlights.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, MediaPipe Tasks Vision, Sonner
- Backend: FastAPI, SQLAlchemy, PyMySQL, OpenCV, MediaPipe, NumPy, Pillow, WebSockets
- Database: MySQL with strict `INT AUTO_INCREMENT` primary keys and relational foreign keys

## Project Structure

```text
airscribe-ai/
  frontend/
    src/
      assets/
      components/
      context/
      hooks/
      pages/
      services/
      utils/
  backend/
    app/
      routes/
      services/
      uploads/
      utils/
      config.py
      database.py
      main.py
      models.py
      schemas.py
  database/
    schema.sql
  README.md
```

## Features

- User authentication with signup, login, hashed passwords, and optional profile pictures
- Real-time webcam hand tracking with index-finger pointer
- Gesture-driven drawing controls
- Brush, eraser, undo, redo, clear, save, and export actions
- MySQL persistence for users, sessions, drawings, strokes, points, predictions, gestures, exports, feedback, and settings
- AI recognition pipeline with contour/template-based object detection
- Dashboard for saved drawings and recognition history
- Settings for brush defaults, camera quality, theme, gesture sensitivity, and auto-recognition
- WebSocket telemetry endpoint for studio gesture updates

## Database Setup

1. Create the MySQL database in phpMyAdmin or MySQL CLI.
2. Run [database/schema.sql](/C:/xampp/htdocs/air_scribe.ai/database/schema.sql).
3. Confirm the tables match:
   `users`, `user_settings`, `drawing_sessions`, `drawings`, `drawing_strokes`, `stroke_points`, `recognized_objects`, `gesture_logs`, `saved_exports`, `ai_predictions`, `feedback`

## Backend Setup

1. Open a terminal in `backend/`.
2. Create and activate a virtual environment.
3. Install dependencies.
4. Copy `.env.example` to `.env` and fill in your MySQL credentials.
5. Run the API server.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8010
```

Backend environment values:

```env
APP_NAME=AirScribe AI API
APP_ENV=development
SECRET_KEY=change-me-to-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=airscribe_ai
FRONTEND_ORIGIN=http://127.0.0.1:5173
UPLOAD_DIR=app/uploads
```

## Frontend Setup

1. Open a second terminal in `frontend/`.
2. Install dependencies.
3. Copy `.env.example` to `.env`.
4. Start the Vite dev server.

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend environment values:

```env
VITE_API_URL=http://127.0.0.1:8010/api
```

## Start In One Go

If you want both frontend and backend to start together from the same VS Code terminal on Windows, use:

```powershell
cd C:\xampp\htdocs\air_scribe.ai
.\run-app-one-terminal.bat
```

This script:

- starts FastAPI on the first free port beginning at `8010`
- starts Vite on the first free port beginning at `5173`
- automatically points the frontend to the matching backend
- keeps the frontend in the current terminal and runs the backend in the background

## How the Studio Works

- Pinch gesture: starts drawing
- Open palm: stops drawing
- Two fingers: eraser mode
- Fist: clears the canvas
- Thumb up: saves the current sketch
- Manual toolbar actions are available alongside gesture control

The studio saves stroke arrays plus point coordinates, generates PNG and SVG data from the canvas, and optionally calls the backend recognizer when saving.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/sessions`
- `POST /api/drawings`
- `GET /api/drawings`
- `GET /api/drawings/{id}`
- `DELETE /api/drawings/{id}`
- `POST /api/drawings/{id}/strokes`
- `POST /api/drawings/{id}/recognize`
- `POST /api/drawings/{id}/predictions`
- `POST /api/gesture-logs`
- `POST /api/drawings/{id}/export`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/feedback`
- `WS /ws/studio/{session_id}`

## Notes

- The browser hand-tracking hook loads the MediaPipe Tasks Vision model from Google-hosted assets at runtime.
- If you want fully offline model loading, place the `.task` model file in the frontend public assets and point `MODEL_URL` in [useAirPen.js](/C:/xampp/htdocs/air_scribe.ai/frontend/src/hooks/useAirPen.js) to the local path.
- Uploaded images and exported files are stored in [backend/app/uploads](/C:/xampp/htdocs/air_scribe.ai/backend/app/uploads).
- The current AI recognizer is intentionally lightweight and extendable. It is built to be readable and portfolio-friendly rather than opaque.

## Run Summary

```bash
# backend
cd backend
uvicorn app.main:app --reload --port 8010

# frontend
cd frontend
npm run dev
```

Recommended single-terminal Windows run:

```powershell
cd C:\xampp\htdocs\air_scribe.ai
.\run-app-one-terminal.bat
```

Separate backend terminal:

```powershell
cd C:\xampp\htdocs\air_scribe.ai
.\run-backend.bat
```

Separate frontend terminal:

```powershell
cd C:\xampp\htdocs\air_scribe.ai
.\run-frontend.bat 8010
```

If `8000` is occupied on your machine, that is fine now. The recommended launcher starts the backend from `8010` upward and avoids the stale `8000` listener issue.

Manual backend fallback:

```bash
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
```

Then start the frontend with:

```bash
cd frontend
set VITE_API_URL=http://127.0.0.1:8010/api
npm run dev -- --host 127.0.0.1 --port 5173
```

If the backend starts and then immediately shuts down on Windows, it is usually the `watchfiles` reloader reacting badly to the local filesystem watcher. Use:

```bash
run-backend.bat
```

PowerShell:

```powershell
.\run-backend.ps1
```

or manually:

```bash
cd backend
$env:WATCHFILES_FORCE_POLLING="true"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
```

If you only want to run the API and do not need hot reload, this is even more stable:

```bash
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8010
```

For the frontend on Windows, use:

```bash
run-frontend.bat
```

PowerShell:

```powershell
.\run-frontend.ps1
```

If your backend is on another port, pass it in:

```bash
run-frontend.bat 8010
```

Important for PowerShell:

```powershell
set VITE_API_URL=http://127.0.0.1:8010/api
```

does not set an environment variable for Vite in PowerShell. Use either `run-frontend.bat 8010` or:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8010/api"
npm run dev -- --host 127.0.0.1 --port 5173
```
