# ⏱️ Shorts Stopper

A Chrome extension that limits your daily time on YouTube Shorts — and makes you *earn* any changes you try to make.

---

## Features

- **Daily time limit** — choose 1, 5, 10, 20, or 30 minutes of Shorts per day
- **Live countdown timer** — a floating overlay shows remaining time while you watch; turns red under 1 minute
- **Automatic midnight reset** — your used time clears itself every day at midnight, no manual action needed
- **Typing challenge** — if you try to change an already-set limit, you must type a full productivity passage correctly (no copy-pasting) to unlock it
- **Personalised "time's up" screen** — when your limit runs out, you get a nudge based on your own interests (sports, coding, reading, etc.)
- **Interest setup** — pick what you'd rather be doing so the nudges feel relevant

---

## File Structure

```
shorts-stopper/
├── manifest.json      # Extension config (Manifest V3)
├── index.html         # Popup UI — set your time limit
├── index.js           # Popup logic — limit selection, live timer display
├── setup.html         # Interest selection screen
├── setup.js           # Saves selected interests to storage
├── challenge.html     # Typing challenge — required to change an existing limit
├── challenge.js       # Challenge logic — character validation, paste blocking
└── content.js         # Content script — runs on YouTube, tracks time, shows overlay
```

---

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `shorts-stopper` folder
6. The extension icon will appear in your toolbar

---

## How It Works

### Setting a limit
Click the extension icon, pick a time (in minutes), and hit **Set Limit**. That's your budget for the day.

### The countdown
Once you open YouTube Shorts, a small frosted-glass timer appears in the top-right corner of the page counting down your remaining time.

### When time runs out
The page is replaced with a full-screen card showing a personalised message based on your chosen interests, prompting you to go do something else.

### Changing your limit
If you've already set a limit today and try to change it, you'll be taken to the **typing challenge**. You must type a ~50-word productivity passage character-for-character (paste is blocked). Only once you've typed it perfectly will the new limit be applied.

### Daily reset
Every time the content script runs, it checks today's date against the last reset date stored in sync storage. If the day has changed, `usedTime` is automatically set back to 0.

### Interests
Go to **Manage Interests** in the popup to pick activities you enjoy. When your time runs out, one is chosen at random and shown as your nudge.

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Save your limit, used time, interests, and reset date |
| `host_permissions: youtube.com` | Inject the content script to track time and show the overlay |

---

## Development Notes

- Built with **Manifest V3**
- Uses `chrome.storage.sync` so settings persist across devices on the same Google account
- The content script wraps all storage calls in `try/catch` to gracefully handle extension context invalidation (e.g. after reloading the extension while a YouTube tab is open)
- No external dependencies — pure HTML, CSS, and JavaScript
