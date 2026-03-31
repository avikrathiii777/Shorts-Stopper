// ── Helpers ──────────────────────────────────────────────────────
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function safeStorageGet(keys, callback) {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.sync.get(keys, callback);
  } catch (e) { /* context invalidated */ }
}

function safeStorageSet(data, callback) {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.sync.set(data, callback || (() => {}));
  } catch (e) { /* context invalidated */ }
}

function checkAndResetDaily(callback) {
  const todayKey = getTodayKey();
  safeStorageGet(['lastResetDay', 'usedTime'], (data) => {
    if (!data) return;
    if (data.lastResetDay !== todayKey) {
      safeStorageSet({ usedTime: 0, lastResetDay: todayKey }, callback);
    } else {
      callback();
    }
  });
}

function isExtensionAlive() {
  try {
    return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// ── Main interval ────────────────────────────────────────────────
const intervalId = setInterval(() => {
  if (!isExtensionAlive()) {
    clearInterval(intervalId);
    return;
  }

  const isShorts = window.location.href.includes('/shorts/');
  if (!isShorts) return;

  checkAndResetDaily(() => {
    safeStorageGet(['limit', 'usedTime'], (data) => {
      if (!data) return;

      let usedTime = data.usedTime || 0;
      const limit = data.limit;

      if (!limit) return;

      usedTime += 1;
      safeStorageSet({ usedTime });

      const limitInSeconds = parseInt(limit) * 60;
      const timeLeft = limitInSeconds - usedTime;

      // ── Timer overlay ────────────────────────────────────────
      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        let timerDiv = document.getElementById('shorts-timer');
        if (!timerDiv) {
          timerDiv = document.createElement('div');
          timerDiv.id = 'shorts-timer';
          Object.assign(timerDiv.style, {
            position: 'fixed',
            top: '12px',
            right: '12px',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            color: '#fff',
            padding: '8px 14px',
            zIndex: '9999',
            borderRadius: '30px',
            fontFamily: "'Nunito', 'Segoe UI', sans-serif",
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'opacity 0.3s ease',
          });
          document.body.appendChild(timerDiv);
        }

        timerDiv.style.background = timeLeft <= 60
          ? 'rgba(220, 60, 80, 0.75)'
          : 'rgba(255,255,255,0.18)';

        timerDiv.innerHTML = `⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`;
        return;
      }

      // ── Time's up screen ─────────────────────────────────────
      safeStorageGet('interests', (res) => {
        if (!res) return;

        const interests = res.interests || ['other'];
        const randomInterest = interests[Math.floor(Math.random() * interests.length)];

        let message = 'You have other stuff to do';
        let emoji   = '✨';

        if (randomInterest === 'sports')             { message = 'Go move your body — a run, a game, anything!'; emoji = '🏃'; }
        else if (randomInterest === 'coding')        { message = 'Open your editor and build something cool.';   emoji = '💻'; }
        else if (randomInterest === 'gaming')        { message = "Play a real game — you'll enjoy it more.";    emoji = '🎮'; }
        else if (randomInterest === 'entertainment') { message = 'Watch a movie or put on some good music.';     emoji = '🎬'; }
        else if (randomInterest === 'food')          { message = 'Go cook or eat something delicious.';          emoji = '🍳'; }
        else if (randomInterest === 'research')      { message = 'Open a book or article and learn something.';  emoji = '🔬'; }
        else if (randomInterest === 'reading')       { message = 'Pick up a book — real stories await.';         emoji = '📚'; }

        document.body.innerHTML = `
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap');
            body {
              margin: 0;
              background: linear-gradient(135deg, #f7f3ff 0%, #fce9f0 50%, #e8f9f5 100%);
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              font-family: 'Nunito', sans-serif;
            }
            .card {
              background: rgba(255,255,255,0.7);
              backdrop-filter: blur(20px);
              border: 1.5px solid rgba(255,255,255,0.6);
              border-radius: 28px;
              padding: 48px 40px;
              text-align: center;
              max-width: 440px;
              box-shadow: 0 8px 40px rgba(180,160,240,0.2);
              animation: pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
            }
            @keyframes pop {
              from { opacity: 0; transform: scale(0.85); }
              to   { opacity: 1; transform: scale(1); }
            }
            .big-emoji { font-size: 64px; margin-bottom: 12px; display: block; }
            h1 { font-size: 32px; font-weight: 800; color: #4a3f6b; margin-bottom: 10px; }
            p  { font-size: 17px; font-weight: 600; color: #8e84aa; line-height: 1.5; }
          </style>
          <div class="card">
            <span class="big-emoji">${emoji}</span>
            <h1>Time's up!</h1>
            <p>${message}</p>
          </div>
        `;
      });
    });
  });
}, 1000);