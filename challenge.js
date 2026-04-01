// The passage the user must type to change their limit
const PASSAGE = "Focused time is a finite resource. Every minute spent scrolling is a minute taken from something that matters - your goals, your creativity, your growth. Choosing to be intentional today is the first step toward a more productive tomorrow.";

const passageDisplay = document.getElementById('passageDisplay');
const typingInput   = document.getElementById('typingInput');
const progressBar   = document.getElementById('progressBar');
const feedback      = document.getElementById('feedback');
const confirmBtn    = document.getElementById('confirmBtn');
const cancelBtn     = document.getElementById('cancelBtn');

let isComplete = false;

// ── Render passage with per-character spans ──────────────────────
function renderPassage(typed) {
  let html = '';
  for (let i = 0; i < PASSAGE.length; i++) {
    const ch = PASSAGE[i] === ' ' ? '&nbsp;' : PASSAGE[i];
    if (i < typed.length) {
      const correct = typed[i] === PASSAGE[i];
      html += `<span class="char ${correct ? 'correct' : 'incorrect'}">${ch}</span>`;
    } else if (i === typed.length) {
      html += `<span class="char current">${ch}</span>`;
    } else {
      html += `<span class="char">${ch}</span>`;
    }
  }
  passageDisplay.innerHTML = html;

  // Scroll passage box to keep current character visible
  const currentChar = passageDisplay.querySelector('.char.current');
  if (currentChar) {
    currentChar.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

renderPassage('');

// ── Typing handler ───────────────────────────────────────────────
typingInput.addEventListener('input', () => {
  const typed = typingInput.value;

  // Block paste — if input is way longer than expected in one tick, clear it
  // (true paste detection isn't possible in extensions, so we use paste event)
  renderPassage(typed);

  const progress = Math.min(typed.length / PASSAGE.length, 1);
  progressBar.style.width = (progress * 100) + '%';

  // Check correctness so far
  let allCorrect = true;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== PASSAGE[i]) { allCorrect = false; break; }
  }

  if (!allCorrect) {
    typingInput.classList.add('error');
    typingInput.classList.remove('success');
    feedback.textContent = 'Fix the errors to continue';
    feedback.className = 'error';
    isComplete = false;
    confirmBtn.classList.remove('ready');
    progressBar.classList.remove('done');
    return;
  }

  typingInput.classList.remove('error');
  typingInput.classList.remove('success');
  feedback.className = '';

  if (typed.length === PASSAGE.length) {
    // Exact match!
    isComplete = true;
    typingInput.classList.add('success');
    progressBar.classList.add('done');
    feedback.textContent = '✓ Perfect! You may now change the limit.';
    feedback.className = 'success';
    confirmBtn.classList.add('ready');
  } else {
    isComplete = false;
    confirmBtn.classList.remove('ready');
    const remaining = PASSAGE.length - typed.length;
    feedback.textContent = `${remaining} character${remaining !== 1 ? 's' : ''} remaining`;
    feedback.className = '';
  }
});

// Block paste
typingInput.addEventListener('paste', (e) => {
  e.preventDefault();
  feedback.textContent = '⚠️ No copy-pasting — type it yourself!';
  feedback.className = 'error';
});

// ── Confirm: apply pending limit ─────────────────────────────────
confirmBtn.addEventListener('click', () => {
  if (!isComplete) return;

  chrome.storage.sync.get('pendingLimit', (data) => {
    if (!data.pendingLimit) {
      window.location.href = 'index.html';
      return;
    }

    const todayKey = getTodayKey();
    chrome.storage.sync.set({
      limit: data.pendingLimit,
      usedTime: 0,
      lastResetDay: todayKey,
      pendingLimit: null
    }, () => {
      window.location.href = 'index.html';
    });
  });
});

// ── Cancel ───────────────────────────────────────────────────────
cancelBtn.addEventListener('click', () => {
  chrome.storage.sync.remove('pendingLimit', () => {
    window.location.href = 'index.html';
  });
});

// ── Date key helper ──────────────────────────────────────────────
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
