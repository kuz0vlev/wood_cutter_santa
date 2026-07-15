# Wood Cutter Santa 🎅🪓

A fast-paced browser arcade game where Santa chops down a tree while avoiding dangerous branches.

The game supports desktop and mobile controls and can be embedded into an Aippy project with leaderboard integration.

## Gameplay

Move Santa between the left and right sides of the tree, chop as many logs as possible, and avoid the branches.

Each successful chop increases your score and restores a small amount of time. The game ends when Santa hits a branch or the timer runs out.

## Features

* Fast arcade gameplay
* Responsive HTML5 Canvas
* Desktop and mobile controls
* Animated snow and game effects
* Score and personal best tracking
* Pause and restart controls
* Aippy leaderboard integration through `window.postMessage`
* Readable and production JavaScript versions
* No build process required

## Controls

### Desktop

* `Left Arrow` or `A` — move left
* `Right Arrow` or `D` — move right

### Mobile

Tap the left or right side of the screen to move Santa.

## Running Locally

Clone the repository:

```bash
git clone https://github.com/kuz0vlev/wood_cutter_santa.git
cd wood_cutter_santa
```

Start a local web server:

```bash
python3 -m http.server 8000
```

Open the game in your browser:

```text
http://localhost:8000
```

The project is a static browser game and does not require npm, a bundler, or a backend.

## Project Structure

```text
wood_cutter_santa/
├── favicon/           # Favicon files
├── library_min/       # Local JavaScript libraries
├── src/               # Images, fonts and game assets
├── index.html         # Main game page
├── reset.css          # CSS reset
├── Santa.js           # Production/obfuscated game code
└── Santa.source.js    # Original readable source code
```

## Aippy Integration

The game can communicate with a parent Aippy page when it is embedded inside an iframe.

Communication is handled through `window.postMessage`.

The integration supports:

* connecting the game to the parent Aippy page;
* requesting the current user's personal best;
* submitting a score after the game ends;
* receiving the updated personal best and leaderboard rank;
* preventing duplicate score submissions for the same game session.

Example iframe:

```html
<iframe
  id="game-frame"
  src="https://your-game-domain.example"
  title="Wood Cutter Santa"
  allow="fullscreen"
></iframe>
```

The parent page must implement the corresponding Aippy leaderboard bridge.

## JavaScript Files

### `Santa.js`

Production version used by `index.html`. The file may be minified or obfuscated.

### `Santa.source.js`

Readable source version intended for development, review, and modification.

When changing the game, edit `Santa.source.js`, generate the production version, and replace `Santa.js`.

## Technologies

* JavaScript
* HTML5 Canvas
* CSS
* jQuery
* jCanvas
* jQuery Mobile Events
* Aippy leaderboard bridge

**P.S.** This is an older codebase originally written in 2018. The original developer asked to remain anonymous, so I uploaded it to GitHub to preserve the project.

