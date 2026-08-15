# MelodyAI - AI-Powered Smart Music Player

MelodyAI is a premium, full-stack, Spotify-inspired music streaming web application. It features a responsive glassmorphic UI, security controls, a fully functional HTML5 audio playback system, dynamic visualizers, user history statistics charts, and an AI-powered recommendation engine (personalized taste scoring + mood-based matching).

---

## System Architecture

The following block diagram illustrates the flow of requests, storage routing, and visual component bindings in MelodyAI:

```mermaid
graph TD
    subgraph Client ["Client Browser (React + Vite)"]
        UI["User Interface (Glassmorphism UI)"]
        Axios["Axios Client (Auth Interceptors)"]
        AudioEngine["HTML5 Audio Engine"]
        Visualizer["Bouncing CSS Equalizer"]
    end

    subgraph Gateway ["Nginx Proxy Router"]
        Nginx["Nginx Server (Port 5173 / Prod proxy)"]
    end

    subgraph AppServer ["Express.js API Backend"]
        ServerRoutes["Express Routers (Port 5000)"]
        AuthMid["JWT Authorization Check"]
        Multer["Multer File Validator"]
        RecEngine["AI Personal Taste Matcher"]
        StatsEngine["Listening Analytics Pipeline"]
    end

    subgraph DataStorage ["Storage Layer"]
        Atlas["MongoDB Atlas (Cloud Collections)"]
        LocalFS["Local Disk Storage (/uploads/)"]
    end

    UI --> Axios
    UI --> AudioEngine
    AudioEngine --> Visualizer
    Axios -->|REST Queries| Nginx
    Nginx -->|Proxy Requests| ServerRoutes
    ServerRoutes --> AuthMid
    ServerRoutes --> Multer
    AuthMid --> RecEngine
    AuthMid --> StatsEngine
    RecEngine -->|Mongoose Queries| Atlas
    StatsEngine -->|Mongoose Aggregates| Atlas
    Multer -->|Writes MP3s & Covers| LocalFS
    ServerRoutes -->|Serves Static Files| LocalFS
```

---

## Folder Structure Detail

This section documents the exact purpose of every file in the codebase.

```text
music-player/
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Manages user sessions, JWT token storage, and Axios auth headers
│   │   │   ├── AudioContext.jsx     # Controls the HTML5 Audio lifecycle, track queue, shuffle, and loops
│   │   │   └── ThemeContext.jsx     # Switches interface themes between dark and light modes
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Collapsible navigation drawer mapping views (Home, Search, Favorites)
│   │   │   ├── BottomPlayer.jsx     # Bottom playback bar with volume sliders, seekers, and buttons
│   │   │   ├── QueuePanel.jsx       # Sliding drawer to view, add, remove, and skip queue tracks
│   │   │   ├── LyricsPanel.jsx      # Synchronizes and scrolls text lyrics dynamically with track progress
│   │   │   └── Equalizer.jsx        # Bouncing CSS animation bars matching the playback state
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Main dashboard rendering mood pickers and recommended grids
│   │   │   ├── Search.jsx           # Input search queries with inline playlist insertion dropdowns
│   │   │   ├── Favorites.jsx        # Displays user liked songs and handles unlikes
│   │   │   ├── History.jsx          # Lists recently played track logs and clear-history shortcuts
│   │   │   ├── Stats.jsx            # Renders total listening hours and Recharts weekly activity charts
│   │   │   ├── PlaylistDetail.jsx   # Playlist viewer with inline reorder (Move Up/Down) and deletion tools
│   │   │   ├── AdminDashboard.jsx   # Form console to upload tracks (MP3 + Cover art) and manage users
│   │   │   ├── Login.jsx            # Glassmorphic user login card form
│   │   │   ├── Register.jsx         # Glassmorphic user registration card form
│   │   │   ├── Profile.jsx          # Avatar selector, settings panel, and keyboard shortcut guide
│   │   │   └── FullscreenPlayer.jsx # Overlay with blurred artwork and synced scrolling lyrics
│   │   │
│   │   ├── utils/
│   │   │   └── format.js            # Converts seconds into mm:ss formatting
│   │   │
│   │   ├── index.css                # Base style system, animations, custom scrollbars
│   │   ├── App.jsx                  # React router setup and ProtectedRoute/AdminRoute route guards
│   │   └── main.jsx                 # Entry mounting file
│   │
│   ├── Dockerfile                   # Multi-stage production build (builds React, runs in Nginx)
│   └── nginx.conf                   # Reverse proxy routing `/api` and `/uploads` requests
│
├── backend/
│   ├── config/
│   │   └── db.js                    # Mongoose database connection setup
│   │
│   ├── middleware/
│   │   ├── auth.js                  # Decodes JWT tokens and verifies Admin roles
│   │   └── upload.js                # Multer configuration for file size filters
│   │
│   ├── models/
│   │   ├── User.js                  # Hashed user schema and avatar paths
│   │   ├── Song.js                  # Song paths, plays, genres, and text search indexes
│   │   ├── Artist.js                # Artist biographies and profile artworks
│   │   ├── Album.js                 # Album collections referencing artists
│   │   ├── Playlist.js              # User playlist arrays supporting custom sorting
│   │   ├── Favorite.js              # Liked song relationships mapping users to songs
│   │   └── ListeningHistory.js      # Individual play logs tracking played times and durations
│   │
│   ├── controllers/
│   │   ├── authController.js        # User signup and login logic
│   │   ├── songController.js        # Song listings and play counters
│   │   ├── playlistController.js    # Playlist CRUD, track insertions, and order updates
│   │   ├── favoriteController.js    # Favorite toggles and count increments
│   │   ├── recommendationController.js # Taste scoring vector matches and mood filters
│   │   ├── historyController.js     # History log fetches and purges
│   │   ├── statsController.js       # aggregates weekly listening line charts
│   │   └── adminController.js       # Administrative catalog uploads and deletions
│   │
│   ├── routes/
│   │   # Routing endpoints matching controllers: auth, songs, playlists, favorites, etc.
│   │
│   ├── utils/
│   │   └── seed.js                  # Clears collections and downloads sample audio files
│   │
│   ├── uploads/                     # Local storage directory for media assets
│   ├── Dockerfile                   # Node production container configuration
│   └── server.js                    # Core bootstrap entry point
│
├── docker-compose.yml               # Orchestrates Frontend Nginx, Backend Express, and MongoDB
├── .env.example                     # Environment template file
└── package.json                     # Root configuration for concurrent execution
```

---

## How the Project Works (System Workflows)

### 1. Authentication & Security Flow
* **Sign Up**: New users register in [`Register.jsx`](file:///f:/music%20player/frontend/src/pages/Register.jsx). The backend [`authController.js`](file:///f:/music%20player/backend/controllers/authController.js) checks if the email or username exists, hashes the password via a pre-save hook in the [`User`](file:///f:/music%20player/backend/models/User.js) schema using `bcryptjs`, and saves the record. The first registered user is automatically promoted to the `admin` role.
* **Log In**: [`Login.jsx`](file:///f:/music%20player/frontend/src/pages/Login.jsx) posts credentials. The backend verifies the password using `bcryptjs.compare()` and returns a JSON Web Token (JWT) signed with `JWT_SECRET`.
* **State Persistence**: The token is saved in the browser's `localStorage` via [`AuthContext.jsx`](file:///f:/music%20player/frontend/src/context/AuthContext.jsx). An Axios interceptor automatically appends `Authorization: Bearer <token>` to all API requests.
* **Route Guards**: In [`App.jsx`](file:///f:/music%20player/frontend/src/App.jsx), components check `AuthContext` to secure pages. Unauthenticated requests are redirected to `/login`, and administrative pages block non-admin users.

### 2. Audio Playback Engine
* **Context Core**: [`AudioContext.jsx`](file:///f:/music%20player/frontend/src/context/AudioContext.jsx) instantiates a single persistent HTML5 `Audio` element. It synchronizes current playback states (volume, progress percentage, track details, loop settings, and queue index) globally across all components.
* **Visual Equalizer**: [`Equalizer.jsx`](file:///f:/music%20player/frontend/src/components/Equalizer.jsx) renders bouncing vertical bars using staggered CSS keyframes. When audio is paused, the animations pause immediately.
* **Queue & Lyrics**: The queue array stores tracks. When a song finishes, `AudioContext` listens for the `ended` event and automatically increments the queue index to play the next track. The lyrics drawer reads synced text files mapped in the catalog database and scrolls to highlight the current line based on the playback position.
* **Keyboard Hotkeys**: A global `keydown` event listener enables spacebar triggers (Play/Pause) and 'M' keys (Mute Volume) anywhere in the app, ignoring triggers when the user is typing in forms.

### 3. AI Recommendation System
* **Personalized Recommendation Algorithm**: When an authenticated user requests recommendations:
  1. The backend [`recommendationController.js`](file:///f:/music%20player/backend/controllers/recommendationController.js) queries the user's `Favorite` tracks and recent `ListeningHistory` entries.
  2. It computes a **Personal Taste Vector**: Favorited tracks contribute $+5$ points, and played tracks contribute $+1$ point to their respective genre and artist preference scores.
  3. It sorts the scores to find the user's top genres and artists.
  4. It queries the `Song` database for tracks matching those top categories, filtering out the 5 most recently played songs to ensure fresh recommendations.
* **Mood Station Selector**: Users click mood buttons (Happy, Sad, Workout, etc.) on the dashboard. The frontend requests the `/api/recommendations/mood` endpoint. The backend maps the mood to target genres (e.g. *Relaxed* $\rightarrow$ *Lo-Fi, Ambient, Jazz*) and returns matching tracks.

### 4. Listening Analytics Pipeline
* **Log Record**: When a song plays for more than 5 seconds, the frontend posts to `/api/songs/:id/play`. The backend logs a new entry in [`ListeningHistory`](file:///f:/music%20player/backend/models/ListeningHistory.js) and increments the song's `playCount`.
* **Statistics Aggregation**: The [`statsController.js`](file:///f:/music%20player/backend/controllers/statsController.js) performs database aggregates:
  * Sums the user's total listening duration and play counts.
  * Groups play logs over the last 7 days by date, returning a time-series dataset.
* **Charts Display**: [`Stats.jsx`](file:///f:/music%20player/frontend/src/pages/Stats.jsx) reads this dataset and renders an interactive, smooth area chart using `recharts`.

### 5. Admin Uploads & Disk Management
* **Upload validation**: Administrators upload new songs via [`AdminDashboard.jsx`](file:///f:/music%20player/frontend/src/pages/AdminDashboard.jsx). Multer validates the files in [`upload.js`](file:///f:/music%20player/backend/middleware/upload.js), allowing only audio files (mp3, wav) and image files under 15MB.
* **Entity Mapping**: The [`adminController.js`](file:///f:/music%20player/backend/controllers/adminController.js) checks if the referenced `Artist` and `Album` exist in the database. If not, it creates them. It then creates the new `Song` document pointing to the uploaded files.
* **Disk Cleanup**: When an administrator deletes a song, the backend queries the database for the file paths, deletes the song document, and unlinks (deletes) the physical audio and cover image files from `backend/uploads/` using `fs.unlinkSync()`.

### 6. Docker Multi-Stage Deployment
* **Frontend Container**: [`frontend/Dockerfile`](file:///f:/music%20player/frontend/Dockerfile) runs a multi-stage build. It uses a Node image to compile the React app into static assets in `/dist`. It then copies these files into a lightweight Nginx container.
* **Nginx Router**: Inside the container, [`nginx.conf`](file:///f:/music%20player/frontend/nginx.conf) routes standard requests to React's `index.html`. Requests to `/api/*` are proxied to `http://backend:5000/api/*`, and media requests to `/uploads/*` are proxied to `http://backend:5000/uploads/*`.
* **Backend & DB Containers**: The backend runs inside a Node container exposing port 5000. MongoDB runs as a background service on port 27017, and both services share a bridged Docker network.

---

## Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB Atlas account** (or a local MongoDB service)

### Setup Steps
1. **Install Dependencies**:
   Run this in the root directory:
   ```bash
   npm run install-all
   ```
2. **Configure Environment Variables**:
   Open [`backend/.env`](file:///f:/music%20player/backend/.env) and insert your database details (using your Atlas connection string):
   ```ini
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://melody:melody123@ac-1hzemoe-shard-00-00.yllotgj.mongodb.net/melodyai?ssl=true&authSource=admin&retryWrites=true&w=majority
   JWT_SECRET=melodyai_super_secret_session_key_987654321
   UPLOAD_PATH=uploads
   ```
3. **Seed Database**:
   ```bash
   npm run seed
   ```
4. **Start Development Server**:
   Run this in the root directory to launch the frontend and backend concurrently:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to **`http://localhost:5173/`**.

---

## Demo Credentials
* **Admin**: `admin` / `admin123`
* **User**: `user` / `user123`
