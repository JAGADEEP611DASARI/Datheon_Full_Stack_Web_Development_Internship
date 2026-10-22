const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalFeatures = document.getElementById('modalFeatures');
const modalRepo = document.getElementById('modalRepo');
const modalClose = document.getElementById('modalClose');
const modalDone = document.getElementById('modalDone');

document.getElementById('year').textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') body.classList.add('light');
updateThemeButton();

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  localStorage.setItem('portfolio-theme', body.classList.contains('light') ? 'light' : 'dark');
  updateThemeButton();
});
function updateThemeButton() {
  const isLight = body.classList.contains('light');
  themeToggle.textContent = isLight ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const projectData = {
  attendance: {
    title: 'Smart Attendance System',
    description: 'A student attendance management concept that combines a clear dashboard with an API-backed data workflow. Adapt the details to match your actual implementation.',
    features: ['Student and class overview dashboard', 'Attendance session records and summaries', 'Responsive interface for desktop and mobile', 'Suggested stack: React, Node.js, Express, and MongoDB'],
    repo: 'https://github.com/'
  },
  expense: {
    title: 'Expense Tracker',
    description: 'A lightweight personal finance interface for organizing everyday spending and reviewing monthly totals.',
    features: ['Record and categorize transactions', 'Show monthly totals and spending breakdowns', 'Responsive dashboard layout', 'Can use browser LocalStorage for a no-backend demo'],
    repo: 'https://github.com/'
  },
  portfolio: {
    title: 'Personal Portfolio',
    description: 'A mobile-first portfolio template to present your introduction, skill set, projects, and contact links in one place.',
    features: ['Responsive layout and mobile navigation', 'Light/dark theme toggle saved in the browser', 'Project details modal', 'Smooth anchor navigation and reduced-motion support'],
    repo: 'https://github.com/'
  }
};

function openProject(key) {
  const project = projectData[key];
  if (!project) return;
  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  modalFeatures.replaceChildren(...project.features.map(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    return li;
  }));
  modalRepo.href = project.repo;
  modal.hidden = false;
  modalClose.focus();
  document.body.style.overflow = 'hidden';
}
function closeProject() {
  modal.hidden = true;
  document.body.style.overflow = '';
}
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => openProject(button.dataset.project));
});
modalClose.addEventListener('click', closeProject);
modalDone.addEventListener('click', closeProject);
modal.addEventListener('click', event => { if (event.target === modal) closeProject(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modal.hidden) closeProject();
});
