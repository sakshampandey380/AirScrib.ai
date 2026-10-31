Script.ai --- AI-Powered Air Drawing Studio
Script.ai is a browser-based, gesture-controlled drawing studio
that lets users create sketches with hand movements in front of a
webcam, save and manage artwork, recognize basic shapes, and export
drawings.

Repository note: The uploaded project currently uses the
internal/product name AirScribe AI in several files. This README
presents the GitHub project as Script.ai while preserving the
existing implementation terminology where needed.
Table of contents
- Overview
- Highlights
- Technology stack
- How it works
- Architecture
- Repository layout
- Requirements
- Quick start on Windows
- Database setup
- Backend setup
- Frontend setup
- Environment variables
- Application routes
- API reference
- Gesture reference
- Data model
- Drawing and recognition
  workflow
- Exports and uploaded files
- Security and privacy
- Troubleshooting
- Development workflow
- Git and GitHub commands
- Production readiness
- Limitations
- Contributing
- License
- Detailed implementation
  reference
Overview
Script.ai explores a more natural way to create digital artwork. Instead
of requiring a physical stylus or touchscreen, the browser can use a
webcam and MediaPipe hand-landmark tracking to estimate hand position
and classify a small set of gestures. The drawing studio translates
supported gestures into pointer movement and drawing actions. A mouse or
touch input remains a useful fallback.

The application is organized as a React single-page frontend, a FastAPI
backend, and a MySQL relational database. The frontend handles
navigation, camera permission, hand tracking, canvas interactions, and
user-facing controls. The API handles authentication, persistence,
drawing operations, settings, feedback, and exports. MySQL stores
account and drawing metadata, while uploaded image files are kept in the
backend upload directory.

The recognition service in this repository uses OpenCV-based image
processing and shape templates. It should be described as a basic
shape-recognition pipeline, not as a general-purpose or
foundation-model AI system.
Highlights
- Webcam-based hand landmark tracking in the browser.
- Gesture classification for drawing, save, erase, clear, pause,
  hover, and idle states.
- Canvas-based drawing with mouse/touch fallback.
- Account registration and login using bearer tokens.
- Optional profile picture and profile bio fields during registration.
- Authenticated drawing creation, listing, viewing, updating, and
  deletion.
- Storage of drawing metadata and stroke/point data.
- Basic shape recognition and persisted prediction records.
- Per-user preferences for theme, brush colour, brush size, gesture
  sensitivity, camera quality, and automatic recognition.
- PNG, JPG, PDF, and SVG export options exposed by the backend.
- Dashboard, studio, settings, login, and registration screens.
- WebSocket endpoint for studio gesture/pointer telemetry.
- FastAPI interactive API documentation during development.
Exact behavior depends on the implementation in the checked-out
source. Treat this document as a guide to the included code, not as a
promise that every optional feature has been production-hardened.

Technology stack
  Layer                   Technology              Responsibility
  Frontend                React 19                UI and component
composition

  Frontend tooling        Vite 6                  Local development
server and production
bundling

  Styling                 Tailwind CSS 3          Utility-based styling

  Motion                  Framer Motion           UI transitions and
animation

  Routing                 React Router 7          Client-side page
navigation

  HTTP                    Axios                   Calls to the FastAPI
API

  Hand tracking           MediaPipe Tasks Vision  Browser-side hand
landmarks

  Icons                   Lucide React            Interface icons

  Notifications           Sonner                  Toast notifications

  Backend                 FastAPI                 HTTP API and WebSocket
route

  ORM                     SQLAlchemy 2            Relational persistence

  Database driver         PyMySQL                 MySQL connectivity

  Authentication          Passlib and python-jose Password hashing and
JWT handling

  Vision                  OpenCV and NumPy        Image processing and
shape matching

  Image handling          Pillow                  Image storage and
export
Database                MySQL                   User, drawing, session,
settings, and event
data
How it works
1. A user opens the frontend and registers or signs in.
2. The frontend receives a bearer token from the API and uses it for
   protected requests.
3. The user opens the studio and grants camera permission if they want
   hands-free input.
4. MediaPipe runs in the browser and returns hand landmarks for the
   visible hand.
5. The application derives a gesture label and pointer position from
   those landmarks.
6. Drawing input is rendered on the canvas. Mouse/touch input can be
   used when camera access is unavailable.
7. When a drawing is saved, the frontend sends the drawing image and
   metadata to the backend.
8. The backend writes image files and related records, including stroke
   points where supplied.
9. If automatic recognition is enabled, the backend runs its basic
   shape-recognition service.
10. The dashboard retrieves the authenticated user's saved drawings.
11. Settings are read from and written to the user's settings record.
12. Export requests create a file in the upload directory and return a
    download URL.
Architecture
┌───────────────────────────────────────────────────────────┐
│ Browser                                                   │
│ React + Vite + Tailwind + React Router                    │
│                                                           │
│ Pages: Home / Login / Signup / Studio / Dashboard / Settings
│ Components: CameraCanvas / DrawingCanvas / Toolbar        │
│ Hand tracking: MediaPipe Tasks Vision                     │
└────────────────────────────┬──────────────────────────────┘
                             │ HTTP JSON / multipart
                             │ Bearer token for protected routes
                             ▼
┌───────────────────────────────────────────────────────────┐
│ FastAPI                                                   │
│ Authentication / Drawings / Settings / Exports / Feedback│
│ SQLAlchemy models and service layer                       │
│ OpenCV + NumPy recognition; Pillow exports                │
└──────────────────┬─────────────────────┬──────────────────┘
                   │                     │
                   ▼                     ▼
┌─────────────────────────────┐  ┌─────────────────────────┐
│ MySQL                       │  │ Local upload directory   │
│ Accounts and relational data│  │ Images, thumbnails,      │
│ Drawing metadata and events │  │ exported files           │
└─────────────────────────────┘  └─────────────────────────┘
The browser also downloads MediaPipe's WASM runtime and hand-landmarker
model from external CDNs. A working internet connection may therefore be
needed for camera-based gesture tracking unless those assets are hosted
locally.
Repository layout
air_scribe.ai/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── drawings.py
│   │   │   ├── exports.py
│   │   │   ├── feedback.py
│   │   │   └── settings.py
│   │   ├── services/
│   │   │   ├── auth.py
│   │   │   ├── drawing.py
│   │   │   ├── export.py
│   │   │   └── recognition.py
│   │   ├── utils/
│   │   │   ├── image_tools.py
│   │   │   └── security.py
│   │   ├── uploads/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── .env.example
│   └── requirements.txt
├── database/
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
├── run-app-one-terminal.bat
├── run-app-one-terminal.ps1
├── run-backend.bat
├── run-backend.ps1
├── run-frontend.bat
├── run-frontend.ps1
├── start-airscribe.bat
├── start-airscribe.ps1
├── stop-airscribe.bat
└── stop-airscribe.ps1
The archive also contained generated dependency folders, build output,
logs, local environment files, and uploaded profile images. These are
local/runtime artifacts and should not be committed to a public
repository. Review the actual Git index before publishing.
Requirements
- Windows 10/11, macOS, or Linux.
- Python 3.11 is a suitable baseline for the pinned backend packages.
- Node.js and npm compatible with the Vite version in
  frontend/package.json.
- MySQL Server 8.x or a compatible MySQL installation.
- Git for source control.
- A modern browser with webcam support for gesture input.
- A webcam for air drawing; mouse/touch input is the fallback.
- Internet access for package installation and the default MediaPipe
  CDN/model URLs.
- Optional: XAMPP for MySQL/phpMyAdmin on Windows. Ensure its MySQL
  service is running before starting the API.
Quick start on Windows
Open PowerShell in the repository root. The examples below assume the
project folder is named air_scribe.ai.
1. Check installed tools
git --version
python --version
node --version
npm --version
If a command is not recognized, install the relevant tool and reopen the
terminal.
2. Create the database
Start MySQL, then create the database using the SQL file in
database/schema.sql. The backend also calls SQLAlchemy create_all()
at startup, but the schema file documents the intended relational
structure and should be reviewed when models change.
3. Configure the backend
cd backend
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Edit backend/.env and set the database credentials and a long, random
secret key. Do not commit .env.
4. Start the backend
From the backend directory with the virtual environment active:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
Open http://127.0.0.1:8000/ for the service status,
http://127.0.0.1:8000/api/health for the health response, and
http://127.0.0.1:8000/docs for Swagger UI.
5. Configure the frontend
Open a second terminal at the repository root:
cd frontend
Copy-Item .env.example .env
npm install
The example frontend URL is http://localhost:8000/api. This must match
the actual backend address and port.
6. Start the frontend
npm run dev
Vite prints the local URL, usually http://localhost:5173. Open it in a
browser.
7. Verify the main workflow
1. Register a test account.
2. Sign in.
3. Open the studio.
4. Test mouse/touch drawing first.
5. Grant camera permission and test hand tracking.
6. Save a drawing.
7. Confirm it appears on the dashboard.
8. Try recognition and each available export format.
9. Update a setting and reload the page to verify persistence.
10. Sign out or clear the test browser session when finished.
Database setup
Option A: MySQL CLI
From a terminal where the MySQL client is available:
mysql -u root -p < database/schema.sql
Enter the password when prompted. If the database user has no password
in a local development setup, omit -p only if that is how the server
is configured.
Option B: phpMyAdmin
1. Start the MySQL service.
2. Open phpMyAdmin.
3. Select the SQL tab.
4. Open database/schema.sql in a text editor.
5. Copy its SQL statements into the SQL tab.
6. Execute the statements.
7. Confirm that the airscribe_ai database and expected tables exist.
Schema maintenance
- Keep SQLAlchemy models and database/schema.sql aligned.
- The application currently invokes
  Base.metadata.create_all(bind=engine) during startup.
- create_all() creates missing tables; it is not a migration system
  and does not reliably modify existing table definitions.
- Use a migration tool such as Alembic before evolving a production
  database.
- Back up the database before schema changes.
- Test schema changes against a disposable development database first.
Tables represented in the schema
- users
- user_settings
- drawing_sessions
- drawings
- drawing_strokes
- stroke_points
- recognized_objects
- gesture_logs
- saved_exports
- ai_predictions
- feedback
Foreign keys link dependent records to their owning user, drawing,
session, or stroke. The schema uses InnoDB and utf8mb4.
Backend setup
Install dependencies
cd backend
python -m venv .venv
Windows PowerShell:
.\.venv\Scripts\Activate.ps1
Windows Command Prompt:
.venv\Scripts\activate.bat
macOS/Linux:
source .venv/bin/activate
Then install packages:
python -m pip install --upgrade pip
pip install -r requirements.txt
Run the API
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
Use --reload only for local development. For deployment, run an
appropriate production ASGI process behind a reverse proxy and configure
the host, workers, TLS, logs, and allowed origins intentionally.
Backend responsibilities
- main.py: creates the FastAPI application, middleware, routers,
  upload mount, and health endpoints.
- config.py: reads environment-backed settings and constructs the
  database URL.
- database.py: creates the SQLAlchemy engine, session factory, and
  declarative base.
- dependencies.py: provides request dependencies such as
  current-user authentication.
- models.py: defines ORM entities and relationships.
- schemas.py: defines request and response validation models.
- routes/auth.py: registration, login, and current-user endpoints.
- routes/drawings.py: sessions, drawings, strokes, recognition,
  predictions, gesture logs, and WebSocket telemetry.
- routes/settings.py: read and update per-user settings.
- routes/exports.py: create downloadable drawing exports.
- routes/feedback.py: store authenticated feedback.
- services/auth.py: account creation and credential verification.
- services/drawing.py: drawing persistence and recognition
  orchestration.
- services/recognition.py: OpenCV-based shape-template matching.
- services/export.py: raster and vector-format export handling.
- utils/security.py: password/token-related helpers.
- utils/image_tools.py: image decoding, saving, thumbnails, and
  directory helpers.
Frontend setup
cd frontend
npm install
npm run dev
Build a production bundle:
npm run build
Preview the production bundle locally:
npm run preview
Frontend responsibilities
- main.jsx: initializes React and the router.
- App.jsx: declares routes and shared layout components.
- pages/Home.jsx: public landing page.
- pages/Login.jsx: login form.
- pages/Signup.jsx: registration form.
- pages/Studio.jsx: drawing workspace.
- pages/Dashboard.jsx: saved drawing overview.
- pages/Settings.jsx: user preference management.
- components/CameraCanvas.jsx: camera-related canvas presentation.
- components/DrawingCanvas.jsx: drawing canvas interactions.
- components/Toolbar.jsx: drawing controls.
- components/RecognitionPanel.jsx: recognition result presentation.
- components/SavedGallery.jsx: saved artwork gallery.
- components/ProtectedRoute.jsx: guards routes requiring
  authentication.
- context/AuthContext.jsx and hooks/useAuth.js: authentication
  state access.
- hooks/useAirPen.js: MediaPipe initialization, camera lifecycle,
  landmark processing, and gesture classification.
- services/api.js: Axios client and bearer-token header helper.
- services/authService.js: authentication API calls.
- services/drawingService.js: drawing API calls.
- services/settingsService.js: settings API calls.
- utils/canvas.js: canvas helpers.
- utils/formatters.js: formatting helpers.
- utils/recognitionIcons.jsx: recognition-label icon mapping.
Environment variables
Backend: backend/.env
Copy backend/.env.example to backend/.env.
  Variable                        Purpose                 Development example
  APP_NAME                      API service display     AirScribe AI API
name                    

  APP_ENV                       Environment label       development

  SECRET_KEY                    Signing secret for      Replace with a strong
access tokens           random value

  ACCESS_TOKEN_EXPIRE_MINUTES   Token lifetime in       1440
minutes                 

  MYSQL_HOST                    Database host           127.0.0.1

  MYSQL_PORT                    Database port           3306

  MYSQL_USER                    Database username       root

  MYSQL_PASSWORD                Database password       Local configuration

  MYSQL_DATABASE                Database name           airscribe_ai

  FRONTEND_ORIGIN               Intended frontend       http://localhost:5173
origin setting          
UPLOAD_DIR                    Local upload directory  app/uploads
Important: The current main.py configures CORS with
allow_origins=["*"]; the FRONTEND_ORIGIN setting is not currently
used by that middleware configuration. Before production, replace the
wildcard with an explicit allowlist and test credential behavior.

Use a strong random SECRET_KEY. Never publish real secrets, production
database passwords, tokens, or personal uploads.
Frontend: frontend/.env
Copy frontend/.env.example to frontend/.env.
  Variable                Purpose                 Development example
  VITE_API_URL          Base URL for the API,   http://localhost:8000/api
including /api        
Vite exposes variables prefixed with VITE_ to client-side code. Never
put private API keys or server secrets in frontend environment
variables.
Application routes
  Route          Access          Purpose
  /            Public          Landing page
/login       Public          Sign in
/signup      Public          Create an account
/studio      Authenticated   Drawing studio
/dashboard   Authenticated   Saved drawings
/settings    Authenticated   Preferences

The frontend uses React Router. ProtectedRoute wraps the studio,
dashboard, and settings screens. Authentication enforcement must also
happen on the backend; frontend route guards alone are not a security
boundary.
API reference
The API prefix is /api. The exact request schemas are defined in
backend/app/schemas.py. Use /docs on a running development server to
inspect the live OpenAPI specification and request/response shapes.
Health and root
  Method   Path            Purpose
  GET    /             Service status and documentation path
GET    /api/health   Health-check response
Authentication
  Method            Path                   Authentication    Purpose
  POST            /api/auth/register   No                Register with
form fields;
optional profile
picture

  POST            /api/auth/login      No                Validate
credentials and
issue a token
GET             /api/auth/me         Bearer token      Return the
current user
Registration uses form data (full_name, email, password, optional
bio, optional profile_picture). Login accepts the JSON schema
defined by LoginRequest. Store access tokens carefully and do not
expose them in logs.
Drawing sessions and drawings
  Method            Path                                       Authentication    Purpose
  POST            /api/sessions                            Bearer token      Create a drawing
session

  POST            /api/drawings                            Bearer token      Save a drawing

  GET             /api/drawings                            Bearer token      List the current
user's drawings

  GET             /api/drawings/{drawing_id}               Bearer token      Fetch one drawing
owned by the user

  PUT             /api/drawings/{drawing_id}               Bearer token      Update a drawing
owned by the user

  DELETE          /api/drawings/{drawing_id}               Bearer token      Delete a drawing
owned by the user

  POST            /api/drawings/{drawing_id}/strokes       Bearer token      Persist stroke
payloads

  POST            /api/drawings/{drawing_id}/recognize     Bearer token      Run shape
recognition

  POST            /api/drawings/{drawing_id}/predictions   Bearer token      Save a prediction
payload
POST            /api/gesture-logs                        Bearer token      Store a gesture
event
The drawing endpoints scope the main drawing lookup to the authenticated
user's ID. Continue applying ownership checks to every new endpoint that
reads or mutates user-owned data.
Settings and feedback
  Method            Path              Authentication    Purpose
  GET             /api/settings   Bearer token      Read or create
the user's
settings

  PUT             /api/settings   Bearer token      Update settings
POST            /api/feedback   Bearer token      Submit feedback
Export
  Method            Path                                  Authentication    Purpose
  POST            /api/drawings/{drawing_id}/export   Bearer token      Generate and
record an export
Supported format values in the export service are png, jpg, pdf,
and svg. Confirm accepted values in ExportCreate before changing the
client or API contract.
WebSocket telemetry
  Protocol                Path                            Purpose
  WebSocket               /api/ws/studio/{session_id}   Accept studio telemetry
and echo a normalized
telemetry message
The current WebSocket implementation accepts the connection and echoes
basic telemetry. It does not perform a robust session ownership check in
the shown route. Add authentication, authorization, input validation,
rate limits, and connection lifecycle handling before exposing this
endpoint publicly.
Authentication header
For protected HTTP endpoints, send:
Authorization: Bearer <access_token>
Do not commit real tokens or include them in issue reports. Use a test
account for local API experiments.
Gesture reference
Gesture classification is implemented in
frontend/src/hooks/useAirPen.js. It uses hand landmarks and heuristic
rules, so lighting, camera angle, hand orientation, and individual
movement can affect results.

  Gesture label   Intended action in the studio
  drawing       Draw while the supported pinch condition is detected
save          Trigger the save gesture
erase         Select or trigger erasing behavior
clear         Clear the canvas, subject to the UI's current behavior
pause         Pause gesture-driven activity
hover         Move the pointer without a recognized action
idle          No usable hand landmarks detected

The hook estimates pinch distance from the index fingertip and thumb
tip. It also checks whether fingers appear extended using landmark
vertical positions. These are heuristics rather than a trained custom
gesture classifier.
Gesture troubleshooting tips
- Use even lighting and keep the hand inside the camera frame.
- Keep the camera stable and avoid strong backlighting.
- Start with the default sensitivity setting before tuning it.
- Move slowly while testing each gesture.
- Avoid placing the hand too close to the lens.
- Try mouse/touch input if the browser cannot access the camera.
- Reload the studio after changing browser camera permissions.
- Check the browser console for model/WASM loading errors.
Data model
The following describes the intended responsibility of each main table.
The authoritative column definitions are in backend/app/models.py and
database/schema.sql.
  Table                               Responsibility
  users                             Account identity, password hash,
profile fields, activation state,
timestamps

  user_settings                     One settings row per user

  drawing_sessions                  A named drawing session and session
metadata

  drawings                          Drawing title, image paths, canvas
dimensions, SVG markup, and
recognition summary

  drawing_strokes                   Ordered stroke attributes such as
colour, size, tool, and gesture
trigger

  stroke_points                     Ordered coordinates and optional
point metadata for a stroke

  recognized_objects                Recognized label, confidence,
bounding box, and optional clean
asset key

  gesture_logs                      User/session/drawing relationship,
gesture label, confidence, trigger
state, timestamp

  saved_exports                     Export format, output path, and
file size

  ai_predictions                    Persisted prediction metadata
feedback                          User feedback, optional drawing
reference, rating, and comment
Relationships and deletion behavior
- A user can have settings, sessions, drawings, gesture logs, and
  feedback.
- User-owned records use foreign keys to maintain referential
  integrity.
- Deleting a user is configured to cascade to several dependent
  records.
- A drawing can reference a session; deleting the session sets the
  drawing's session reference to NULL.
- A drawing owns stroke records, and a stroke owns its point records.
- Recognized objects and exports are linked to drawings.
- Verify ORM cascade behavior and SQL foreign-key behavior together
  when changing the data model.
Image files and database records
The database stores paths and metadata; it does not necessarily store
the full drawing image as a binary blob. The backend saves image files
beneath the configured upload directory. That means database backups
alone are not sufficient to restore the application: back up the upload
directory as well.
Drawing and recognition workflow
Saving a drawing
The frontend sends drawing data through the drawing service. The backend
validates the payload with Pydantic schemas, writes image and thumbnail
files through the image utility, creates a drawings row, and stores
the stroke records and their points. If auto_recognize is enabled in
the request, the backend invokes the recognition service after
persistence.
Updating a drawing
The update service replaces the stored image/thumbnail paths, updates
drawing metadata, deletes the previous stroke records for that drawing,
and stores the new stroke data. Review this behavior before adding
version history because old stroke rows are not automatically retained
by this workflow.
Recognition approach
The recognition service creates normalized grayscale masks and compares
them with built-in shape templates using OpenCV and NumPy. It returns a
label, confidence value, bounding box where available, a clean asset
key, inference timing, and raw diagnostic payload.

This design is useful for demonstrating a simple local shape-recognition
pipeline. It should not be presented as a universal object detector,
handwriting recognizer, or generative AI model. Accuracy depends on
drawing quality and the supported template set.
Improving recognition
- Add unit tests for each supported shape and ambiguous input.
- Keep preprocessing deterministic and documented.
- Add negative examples and measure false positives.
- Record evaluation metrics on a held-out drawing set.
- Version templates and preprocessing rules.
- Avoid describing confidence as a calibrated probability unless
  calibration is measured.
- Consider a dedicated model only if the product requirements justify
  the extra deployment and maintenance cost.
Exports and uploaded files
The export service currently supports the formats below:
  Format                              Behavior
  PNG                                 Raster export with a dark
background composite

  JPG                                 Raster export with JPEG quality
configured in the service

  PDF                                 Image-based PDF export
SVG                                 Uses stored SVG markup when
available; otherwise writes a
fallback SVG representation
An SVG fallback is not equivalent to reconstructing vector paths from a
raster image. Verify the output visually for drawings without stored SVG
markup.

Generated exports are stored below the upload directory's exports
subdirectory and recorded in the database. The API returns a download
URL constructed from the request's base URL.
File handling guidance
- Do not serve private user uploads from a public bucket without
  access controls.
- Validate upload size and content type server-side.
- Use random server-generated filenames rather than trusting
  user-provided paths.
- Avoid exposing absolute filesystem paths in API responses.
- Add retention rules for abandoned exports and old thumbnails.
- Back up uploaded files alongside the database.
- Test behavior when a file is missing but its database record
  remains.
- Restrict file access according to the product's privacy model.
Security and privacy
This repository is a development project and requires a security review
before public production deployment.
Authentication
- Passwords should be stored as password hashes, never plaintext.
- Use a strong, randomly generated signing secret.
- Keep access-token lifetime appropriate to the threat model.
- Add refresh/revocation strategy if the product requires long-lived
  sessions.
- Do not log passwords, access tokens, or authorization headers.
- Add rate limiting to registration and login.
- Consider account verification and password-reset workflows before
  public launch.
API and CORS
- The current CORS middleware allows every origin (*) and does not
  use the FRONTEND_ORIGIN setting.
- Configure a strict production origin allowlist.
- Review CORS and credential settings together; do not assume CORS is
  authentication.
- Validate all payloads and file uploads.
- Add request size limits and sensible timeouts.
- Add rate limits for resource-intensive recognition and export
  endpoints.
- Ensure every user-owned resource endpoint checks ownership.
- Authenticate and authorize WebSocket connections.
Camera privacy
- Camera access is requested by the browser and requires user
  permission.
- The current hand-tracking hook requests video with audio disabled.
- Explain camera behavior clearly in the UI.
- Do not claim that all processing is local unless every relevant data
  path has been verified.
- The included hand landmark detection is performed in the browser,
  while saved drawings and API requests can send artwork to the
  backend.
- Provide a clear way to stop the camera stream and handle component
  unmounts.
- Test camera permission denial and camera-in-use scenarios.
Repository hygiene
Never commit:
- .env files containing local or production configuration.
- Database passwords or token signing secrets.
- node_modules/, Python virtual environments, or generated build
  folders.
- Logs that might contain personal data or secrets.
- Personal profile images or user-generated artwork without
  permission.
- Access tokens, cookies, or production data dumps.
The uploaded archive included local .env files, a Git directory,
dependency folders, generated build output, logs, and profile-image
uploads. Inspect the Git index and remove sensitive or generated
material before pushing. A .gitignore rule does not remove a file that
is already tracked.
Troubleshooting
Backend cannot connect to MySQL
1. Confirm the MySQL service is running.
2. Confirm host, port, username, password, and database name in
   backend/.env.
3. Confirm the database exists.
4. Test credentials using the MySQL client or phpMyAdmin.
5. Check whether the server uses a non-default port.
6. Restart the backend after editing environment variables.
7. Read the terminal traceback without publishing secrets.
ModuleNotFoundError in Python
1. Activate the backend virtual environment.
2. Confirm the terminal is in the backend directory.
3. Run python -m pip install -r requirements.txt.
4. Check python --version.
5. Ensure VS Code is using the same interpreter as the terminal.
Frontend API requests fail
1. Confirm the backend is running.
2. Check frontend/.env and VITE_API_URL.
3. Restart Vite after changing environment variables.
4. Inspect the browser Network panel.
5. Check CORS configuration.
6. Verify the request includes a bearer token when required.
7. Confirm the endpoint path and payload match the API schema.
Camera does not start
1. Use a modern browser.
2. Use localhost or HTTPS; camera APIs may be blocked on insecure
   remote origins.
3. Grant camera permission in browser settings.
4. Close other applications using the camera.
5. Confirm navigator.mediaDevices.getUserMedia is available.
6. Check whether the MediaPipe WASM and model URLs can be reached.
7. Use mouse/touch input while debugging camera-specific problems.
Hand tracking loads but gestures are unstable
- Improve lighting.
- Keep the hand fully visible.
- Avoid rapid movement while testing.
- Review the sensitivity value.
- Check whether the camera frame is mirrored relative to pointer
  coordinates.
- Inspect the hook's landmark processing and smoothing logic.
- Test on more than one webcam and screen size.
Drawing is not saved
1. Confirm the user is signed in.
2. Check the API response in the Network panel.
3. Confirm MySQL is reachable.
4. Confirm the upload directory is writable.
5. Check that the drawing payload matches DrawingCreate.
6. Review backend logs for validation or file-system errors.
7. Verify the record belongs to the current user.
Export download fails
- Confirm the drawing exists and belongs to the signed-in user.
- Check that the requested format is accepted by the schema.
- Ensure the upload directory is writable.
- Confirm the generated file exists.
- Inspect the API response's download URL and backend host.
- Verify reverse-proxy configuration if deployed behind a proxy.
Port already in use
Change the port in the run command, then update VITE_API_URL to match.
Do not change only one side of the frontend/backend connection.
PowerShell blocks virtual-environment activation
If your system's execution policy blocks activation, use Command Prompt
activation (.venv\Scripts\activate.bat) or follow your organization's
approved PowerShell policy. Do not weaken system security globally just
to activate a development environment.
Development workflow
1. Create a feature branch.
2. Make a focused change.
3. Keep frontend and backend API contracts aligned.
4. Run the frontend build.
5. Exercise the changed API route manually or with automated tests.
6. Check the browser console and backend terminal.
7. Review git diff.
8. Confirm no secrets or generated files are staged.
9. Commit with a clear message.
10. Push the branch and open a pull request.
Useful development commands
Frontend:
cd frontend
npm install
npm run dev
npm run build
npm run preview
Backend:
cd backend
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
Database:
mysql -u root -p < database/schema.sql
Git inspection:
git status
git diff
git diff --staged
git ls-files
Git and GitHub commands
See the separate Git command reference below
for a safe workflow for a new repository, an existing clone, later
changes, branches, and common errors.
Production readiness
Before deploying for real users, review at least these areas:
- [ ] Replace wildcard CORS with a configured allowlist.
- [ ] Replace the default secret key with a secure secret manager
  value.
- [ ] Use a least-privilege database account.
- [ ] Configure HTTPS and secure reverse-proxy headers.
- [ ] Add database migrations and a backup/restore procedure.
- [ ] Back up uploads and database records together.
- [ ] Add request and upload size limits.
- [ ] Add rate limits for authentication, recognition, and exports.
- [ ] Validate file types and inspect uploaded content.
- [ ] Secure the WebSocket endpoint with authentication and
  authorization.
- [ ] Check user ownership for all data access paths.
- [ ] Add automated backend and frontend tests.
- [ ] Add structured logging and error monitoring without sensitive
  data.
- [ ] Review token storage and logout behavior.
- [ ] Document retention and deletion behavior for user artwork.
- [ ] Test camera-denial and accessibility states.
- [ ] Review dependencies for known vulnerabilities.
- [ ] Confirm production environment variables are not exposed to the
  frontend.
- [ ] Set a license and third-party asset attribution policy.
- [ ] Perform a security review before public launch.
Limitations
- Gesture classification is heuristic and may be affected by camera
  conditions.
- Shape recognition is template-based and limited to its supported
  templates.
- Camera tracking depends on browser support and external MediaPipe
  assets by default.
- Local upload storage is not automatically shared across multiple
  application instances.
- SQLAlchemy create_all() is not a replacement for schema
  migrations.
- WebSocket telemetry should not be considered production-secure
  without authorization.
- The current CORS policy is permissive and must be changed before
  deployment.
- SVG fallback export may not preserve true vector geometry.
- No production deployment topology is assumed by this repository.
Contributing
Contributions are welcome. For a useful contribution:
1. Describe the problem and expected behavior.
2. Keep the change focused.
3. Add or update tests where practical.
4. Update the README when behavior, configuration, or API contracts
   change.
5. Avoid committing generated assets, personal data, or secrets.
6. Include reproducible steps for bugs.
7. Explain any database schema changes and migration needs.
License
No license was identified from the inspected project files. Until a
license is added, do not assume that others have permission to reuse,
modify, or redistribute the code. Choose and add an appropriate license
file before publishing if you intend to grant reuse rights.
Detailed implementation reference
This section is a practical source-oriented checklist for reviewing the
project. It is intentionally explicit so maintainers can use it during
development, onboarding, and release reviews.
Frontend components
- AnimatedBackground.jsx provides the animated background layer used
  by the shared app shell.
- AppFooter.jsx renders the shared footer.
- CameraCanvas.jsx coordinates camera-related visual elements.
- DrawingCanvas.jsx contains canvas drawing interactions.
- EmptyState.jsx provides an empty-content presentation.
- GestureShowcase.jsx presents gesture guidance.
- GestureStatus.jsx presents the current gesture state.
- GlassPanel.jsx provides a reusable glass-style panel.
- Loader.jsx presents loading feedback.
- Navbar.jsx renders the main navigation.
- ProtectedRoute.jsx prevents unauthenticated access through the
  client router.
- RecognitionPanel.jsx displays recognition information.
- SavedGallery.jsx presents saved drawings.
- Sidebar.jsx provides studio navigation or controls.
- Toolbar.jsx provides drawing tools and options.
Frontend pages
- Home.jsx is the public entry page.
- Login.jsx contains the sign-in interface.
- Signup.jsx contains the registration interface.
- Studio.jsx hosts the drawing experience.
- Dashboard.jsx presents saved user content.
- Settings.jsx manages user preferences.
Frontend services and utilities
- api.js creates the Axios client and defines the API root.
- authService.js wraps authentication-related requests.
- drawingService.js wraps drawing-related requests.
- settingsService.js wraps settings requests.
- canvas.js contains canvas utility functions.
- formatters.js contains formatting helpers.
- recognitionIcons.jsx maps recognition labels to visual icons.
- AuthContext.jsx exposes shared authentication state.
- useAuth.js provides a hook for consuming authentication context.
- useAirPen.js initializes MediaPipe and handles camera/gesture
  lifecycle.
Backend route modules
- auth.py handles registration, login, and current-user lookup.
- drawings.py handles drawing sessions and drawing lifecycle
  operations.
- exports.py creates export files for drawings.
- feedback.py stores feedback submitted by an authenticated user.
- settings.py reads and updates user settings.
Backend service modules
- auth.py handles account creation and password verification.
- drawing.py stores drawing images, metadata, strokes, points, and
  recognition results.
- recognition.py preprocesses drawn shapes and compares them with
  templates.
- export.py converts stored artwork to supported export formats.
Backend support modules
- config.py reads environment settings.
- database.py configures SQLAlchemy.
- dependencies.py exposes request-scoped dependencies.
- models.py declares ORM tables and relationships.
- schemas.py validates API input and output.
- security.py contains token/password security helpers.
- image_tools.py handles image and directory operations.
Git command reference
Replace YOUR-USERNAME and script.ai with the GitHub owner and
repository name you actually created. Do not type the angle-bracket
placeholders literally.
New local project pushed to a brand-new GitHub repository
cd path/to/your/project
git init
git add .
git commit -m "Initial commit: Script.ai"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/script.ai.git
git push -u origin main
Create an empty repository on GitHub first. If the GitHub repository
already contains a README, license, or .gitignore, the first push may
require fetching and reconciling that remote history.
Existing local Git repository: first push to GitHub
git status
git remote -v
git branch --show-current
git add .
git commit -m "Describe the change"
git push -u origin main
If no remote exists, add one with
git remote add origin https://github.com/YOUR-USERNAME/script.ai.git.
If the current branch is not main, either push the current branch by
name or rename it intentionally.
Existing repository: push later changes
```bash git status
