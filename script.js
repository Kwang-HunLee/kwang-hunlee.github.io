// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Nav scroll state
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 20) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.getElementById('navToggle');
const links  = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  links.classList.toggle('open');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.classList.remove('open');
  links.classList.remove('open');
}));

// Publication tabs
const tabs = document.querySelectorAll('.pub-tab');
const lists = {
  journal: document.getElementById('pub-journal'),
  review:  document.getElementById('pub-review'),
  patent:  document.getElementById('pub-patent'),
};
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  const target = tab.dataset.tab;
  Object.entries(lists).forEach(([k, el]) => {
    if (k === target) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}));
