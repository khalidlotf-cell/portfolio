// ============================================
// BURGER MENU (MOBILE)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const burger   = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  if (!burger || !navLinks) return;

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('open')) return;
    if (navLinks.contains(e.target) || burger.contains(e.target)) return;
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// ANIMATIONS AU SCROLL (IntersectionObserver)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // délai progressif pour l'effet stagger
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
});

// ============================================
// FORMULAIRE DE CONTACT
// ============================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('name')?.value.trim();
    const email   = document.getElementById('email')?.value.trim();
    const subject = document.getElementById('subject')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !subject || !message) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    // Construction d'un lien mailto comme fallback simple
    const mailto = `mailto:lotfkhalid@outlook.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`De : ${name} (${email})\n\n${message}`)}`;
    window.location.href = mailto;

    contactForm.reset();
  });
}
