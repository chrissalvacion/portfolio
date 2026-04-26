/* ============================================================
   portfolio — script.js
   ============================================================ */

'use strict';

// ── Sticky header ────────────────────────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Mobile nav toggle ────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navList   = document.getElementById('navList');

navToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked
navList.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ── Active nav link on scroll ────────────────────────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Scroll reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.about__grid, .skill-card, .project-card, .contact__form, .contact__links'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${i * 60}ms`;
  revealObserver.observe(el);
});

// ── Footer year ──────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Contact form ─────────────────────────────────────────────
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

const fields = {
  name:    { el: document.getElementById('name'),    err: document.getElementById('nameError'),    validate: v => v.trim().length >= 2 ? '' : 'Please enter your name.' },
  email:   { el: document.getElementById('email'),   err: document.getElementById('emailError'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email.' },
  subject: { el: document.getElementById('subject'), err: document.getElementById('subjectError'), validate: v => v.trim().length >= 3 ? '' : 'Please enter a subject.' },
  message: { el: document.getElementById('message'), err: document.getElementById('messageError'), validate: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' },
};

function validateField(key) {
  const { el, err, validate } = fields[key];
  const msg = validate(el.value);
  err.textContent = msg;
  el.classList.toggle('error', !!msg);
  return !msg;
}

Object.keys(fields).forEach(key => {
  fields[key].el.addEventListener('blur', () => validateField(key));
  fields[key].el.addEventListener('input', () => {
    if (fields[key].el.classList.contains('error')) validateField(key);
  });
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  const valid = Object.keys(fields).map(validateField).every(Boolean);
  if (!valid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  formStatus.textContent = '';
  formStatus.className = 'form__status';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: '757e27d1-923a-45df-9bf2-37fece3e8232',
        name: fields.name.el.value.trim(),
        email: fields.email.el.value.trim(),
        subject: fields.subject.el.value.trim(),
        message: fields.message.el.value.trim(),
        from_name: 'Portfolio Contact Form',
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      formStatus.textContent = '✓ Message sent! I\'ll get back to you soon.';
      formStatus.classList.add('success');
      form.reset();
    } else {
      formStatus.textContent = 'Something went wrong. Please try again.';
      formStatus.classList.add('error');
    }
  } catch {
    formStatus.textContent = 'Something went wrong. Please try again.';
    formStatus.classList.add('error');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message';
});
