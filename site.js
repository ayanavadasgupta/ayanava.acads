const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const themeSwitch = document.querySelector('.theme-switch');
const savedTheme = localStorage.getItem('ayanava-theme');

if (themeSwitch) {
  const setTheme = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    themeSwitch.setAttribute('aria-pressed', String(isDark));
    themeSwitch.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeSwitch.querySelector('.theme-switch-label').textContent = isDark ? 'Dark' : 'Light';
    localStorage.setItem('ayanava-theme', isDark ? 'dark' : 'light');
  };

  setTheme(savedTheme === 'dark');
  themeSwitch.addEventListener('click', () => {
    setTheme(!document.body.classList.contains('dark-mode'));
  });
}
