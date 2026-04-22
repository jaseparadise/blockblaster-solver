# Blast Solver MVP

This is a static installable web app (PWA) for Android/Samsung.

## What it does now
- Uploads a screenshot for visual reference
- Lets you mark the current 8×8 board manually
- Lets you choose the 3 currently available pieces
- Computes the best move sequence by searching all legal placements for the 3 pieces
- If a piece does not fit immediately, it tries the other pieces first to create space
- Can be installed on Android as a home-screen web app

## What it does not do yet
- Automatic screenshot recognition of board and pieces
- Live overlay on top of the game screen
- Native Android MediaProjection screen capture

## Run locally
Because this is a PWA, serve it from a local web server rather than opening `index.html` directly.

### Option 1: Python
```bash
cd blockblast_solver_app
python3 -m http.server 8000
```
Then open:
`http://localhost:8000`

### Option 2: VS Code Live Server
Open the folder and start Live Server.

## Install on Android
1. Deploy the folder to any static host (Netlify, Vercel, GitHub Pages, Firebase Hosting).
2. Open the hosted URL in Chrome on your Samsung phone.
3. Tap the browser menu and choose **Add to Home screen** if prompted.

## Suggested next version
- Replace manual board entry with automatic board/piece detection from screenshot
- Add native Android wrapper and MediaProjection capture flow


## New in v5

- Automatically reads the board and the 3 current pieces from an uploaded screenshot.
- You can still correct any detection manually before solving.
