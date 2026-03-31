const buttons = document.querySelectorAll('.timeBtn');
const confirmBtn = document.getElementById('confirmBtn');
const status = document.getElementById('status');
const setupBtn = document.getElementById('setupBtn');
const timerDisplay = document.getElementById('timerDisplay');

let selected = null;

// ── Midnight reset ──────────────────────────────────────────────
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function checkAndResetDaily() {
  const todayKey = getTodayKey();
  chrome.storage.sync.get(['lastResetDay', 'usedTime'], (data) => {
    if (data.lastResetDay !== todayKey) {
      chrome.storage.sync.set({ usedTime: 0, lastResetDay: todayKey });
    }
  });
}

checkAndResetDaily();

// ── Timer display ───────────────────────────────────────────────
function updateTimerDisplay() {
  chrome.storage.sync.get(['limit', 'usedTime'], (data) => {
    if (!data.limit) {
      timerDisplay.textContent = 'No limit set';
      timerDisplay.className = 'timer-display no-limit';
      return;
    }

    const limitSeconds = parseInt(data.limit) * 60;
    const usedTime = data.usedTime || 0;
    const timeLeft = Math.max(0, limitSeconds - usedTime);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.className = 'timer-display' + (timeLeft === 0 ? ' no-limit' : '');
  });
}

updateTimerDisplay();
setInterval(updateTimerDisplay, 1000);

// ── Time buttons ────────────────────────────────────────────────
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selected = btn.id;
  });
});

// ── Confirm ─────────────────────────────────────────────────────
confirmBtn.addEventListener('click', () => {
  if (!selected) return;

  chrome.storage.sync.get('limit', (data) => {
    const existingLimit = data.limit;

    if (existingLimit && existingLimit !== selected) {
      // Limit already set for today — open challenge
      chrome.storage.sync.set({ pendingLimit: selected }, () => {
        window.location.href = 'challenge.html';
      });
    } else {
      // No limit yet, set freely
      chrome.storage.sync.set({ limit: selected, usedTime: 0, lastResetDay: getTodayKey() }, () => {
        status.textContent = `✓ Limit set: ${selected} min`;
        status.className = 'active';
        updateTimerDisplay();
      });
    }
  });
});

// ── Load saved state ────────────────────────────────────────────
chrome.storage.sync.get('limit', (data) => {
  if (data.limit) {
    status.textContent = `✓ Limit set: ${data.limit} min`;
    status.className = 'active';

    buttons.forEach(btn => {
      if (btn.id === data.limit) {
        btn.classList.add('selected');
        selected = btn.id;
      }
    });
  }
});

// ── Setup interests ─────────────────────────────────────────────
setupBtn.addEventListener('click', () => {
  window.location.href = 'setup.html';
});