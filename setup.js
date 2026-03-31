const interestButtons = document.querySelectorAll('#interests button');
const saveBtn = document.getElementById('saveBtn');

// Load previously saved interests
chrome.storage.sync.get('interests', (data) => {
  const saved = data.interests || [];
  interestButtons.forEach(btn => {
    if (saved.includes(btn.id)) {
      btn.classList.add('selected');
    }
  });
});

interestButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('selected');
  });
});

saveBtn.addEventListener('click', () => {
  const selected = [];

  interestButtons.forEach(button => {
    if (button.classList.contains('selected')) {
      selected.push(button.id);
    }
  });

  if (selected.length === 0) {
    selected.push('other');
  }

  chrome.storage.sync.set({ interests: selected }, () => {
    window.location.href = 'index.html';
  });
});