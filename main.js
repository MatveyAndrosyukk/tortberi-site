(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: hide on scroll down, burger ---------- */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-hidden', y > lastY && y > 300 && !links.classList.contains('open'));
    lastY = y;
    fab.classList.toggle('show', y > innerHeight * 0.8 && !inView(orderSec));
  }, { passive: true });
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
  }));

  const fab = document.querySelector('.fab');
  const orderSec = document.getElementById('order');
  function inView(el) { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }

  /* ---------- Hero slider ---------- */
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.dot')];
  const nameEl = document.getElementById('slideName');
  const names = ['Красный бархат', 'Бархат с ягодами', 'Торт-венок'];
  let cur = 0, timer;
  function go(i) {
    slides[cur].classList.remove('is-active'); dots[cur].classList.remove('is-active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('is-active'); dots[cur].classList.add('is-active');
    nameEl.classList.add('swap');
    setTimeout(() => { nameEl.textContent = names[cur]; nameEl.classList.remove('swap'); }, 300);
  }
  function auto() { clearInterval(timer); if (!reduce) timer = setInterval(() => go(cur + 1), 4500); }
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); auto(); }));
  auto();

  /* ---------- Cherries parallax on pointer ---------- */
  const cherries = [...document.querySelectorAll('.float-cherry')];
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    let raf;
    addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        cherries.forEach(c => {
          const d = +c.dataset.depth;
          c.style.transform = `translate(${x * d}px, ${y * d}px)`;
        });
      });
    });
  }

  /* ---------- Scroll reveal with stagger ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.grid .card').forEach((c, i) => c.style.setProperty('--rd', (i % 4) * 0.09 + 's'));
  document.querySelectorAll('.spots .spot').forEach((c, i) => c.style.setProperty('--rd', i * 0.08 + 's'));
  document.querySelectorAll('.facts li').forEach((c, i) => c.style.setProperty('--rd', i * 0.12 + 's'));
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const stack = document.querySelector('.candy-stack');
  new IntersectionObserver(([en], o) => { if (en.isIntersecting) { stack.classList.add('in'); o.disconnect(); } }, { threshold: .4 }).observe(stack);

  /* ---------- About photo parallax ---------- */
  const aboutImg = document.querySelector('.about-photo img');
  if (!reduce) {
    addEventListener('scroll', () => {
      const r = aboutImg.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      aboutImg.style.transform = `translateY(${-7 + p * 14}%)`;
    }, { passive: true });
  }

  /* ---------- Menu filter ---------- */
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.card');
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.toggle('is-active', c === ch));
    const f = ch.dataset.filter;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('is-filtered', !show);
      if (show) { card.classList.remove('in'); requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in'))); }
    });
  }));

  /* ---------- Order quiz ---------- */
  const form = document.getElementById('quiz');
  const steps = [...form.querySelectorAll('.step')];
  const bar = document.getElementById('quizBar');
  const label = document.getElementById('quizStepLabel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const sendBtn = document.getElementById('sendBtn');
  const err = document.getElementById('quizError');
  const dateIn = document.getElementById('date');
  const dateHint = document.getElementById('dateHint');
  const preview = document.getElementById('preview');
  const toast = document.getElementById('toast');
  let step = 0;

  const fmt = d => d.toISOString().slice(0, 10);
  const plusDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const type = () => (form.querySelector('input[name="type"]:checked') || {}).value || '';

  function adapt() {
    const t = type();
    document.getElementById('inscriptionField').hidden = t !== 'Торт с надписью';
    document.getElementById('guestsField').hidden = !(t === 'Candy Bar' || t === 'Сотрудничество для бизнеса');
    const cakeWrap = document.getElementById('cake').closest('.field');
    const weightWrap = form.querySelector('.pills').closest('.field');
    const sweetOnly = t === 'Candy Bar' || t === 'Сотрудничество для бизнеса';
    cakeWrap.hidden = sweetOnly; weightWrap.hidden = sweetOnly;
    steps[1].querySelector('legend').textContent = sweetOnly ? 'Расскажите о мероприятии' : 'Какой торт и сколько?';
    const minDays = t === 'Candy Bar' ? 2 : 0;
    dateIn.min = fmt(plusDays(minDays));
    if (!dateIn.value || dateIn.value < dateIn.min) dateIn.value = fmt(plusDays(minDays || 1));
    dateHint.textContent = t === 'Candy Bar' ? 'Candy Bar принимаем минимум за 2 дня до события.' : 'Торт с витрины можем отложить и на сегодня — уточним наличие в Direct.';
  }

  function message() {
    const fd = new FormData(form);
    const t = fd.get('type');
    const d = fd.get('date') ? new Date(fd.get('date')).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }) : '';
    const lines = [`Здравствуйте! Хочу оформить: ${t}.`];
    if (t === 'Candy Bar' || t === 'Сотрудничество для бизнеса') {
      if (fd.get('guests')) lines.push(`Мероприятие: ${fd.get('guests')}`);
    } else {
      lines.push(`Торт: ${fd.get('cake')}, ${fd.get('weight')}`);
      if (t === 'Торт с надписью' && fd.get('inscription')) lines.push(`Надпись: «${fd.get('inscription')}»`);
    }
    lines.push(`Дата: ${d}`);
    lines.push(`Забрать: ${fd.get('place')}`);
    lines.push(`Имя: ${fd.get('name') || ''}`);
    if (fd.get('phone')) lines.push(`Телефон: ${fd.get('phone')}`);
    return lines.join('\n');
  }

  function validate() {
    err.textContent = '';
    if (step === 0 && !type()) { err.textContent = 'Выберите, что вам нужно.'; return false; }
    if (step === 2 && (!dateIn.value || dateIn.value < dateIn.min)) {
      err.textContent = type() === 'Candy Bar' ? 'Для Candy Bar выберите дату не раньше чем через 2 дня.' : 'Выберите дату не раньше сегодняшней.';
      return false;
    }
    if (step === 3 && !form.elements.namedItem('name').value.trim()) { err.textContent = 'Укажите имя — на него отложим торт.'; form.elements.namedItem('name').focus(); return false; }
    return true;
  }

  function show(i, back) {
    steps[step].classList.remove('is-active', 'is-back');
    step = i;
    steps[step].classList.toggle('is-back', !!back);
    steps[step].classList.add('is-active');
    bar.style.width = ((step + 1) / steps.length * 100) + '%';
    label.textContent = `Шаг ${step + 1} из ${steps.length}`;
    prevBtn.hidden = step === 0;
    nextBtn.hidden = step === steps.length - 1;
    sendBtn.hidden = step !== steps.length - 1;
    if (step === steps.length - 1) preview.textContent = message();
    err.textContent = '';
  }

  form.addEventListener('change', e => {
    if (e.target.name === 'type') { adapt(); setTimeout(() => { if (step === 0) show(1); }, 280); }
    if (step === steps.length - 1) preview.textContent = message();
  });
  form.addEventListener('input', () => { if (step === steps.length - 1) preview.textContent = message(); });
  nextBtn.addEventListener('click', () => { if (validate()) show(step + 1); });
  prevBtn.addEventListener('click', () => show(step - 1, true));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    const text = message();
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch (_) {}
    toast.textContent = copied ? 'Сообщение скопировано — вставьте его в Direct и отправьте' : 'Откроем Direct — перепишите туда данные заказа';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
    setTimeout(() => window.open('https://ig.me/m/tortberi.brest', '_blank', 'noopener'), 700);
  });

  document.querySelectorAll('[data-preset]').forEach(a => a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="type"][value="${a.dataset.preset}"]`);
    if (r) { r.checked = true; adapt(); show(1); }
  }));

  adapt();
})();
