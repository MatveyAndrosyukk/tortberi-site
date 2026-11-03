(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Header ---------- */
  const header = $('.header');
  const burger = $('.burger');
  const nav = $('.menu-nav');
  const fab = $('.fab');
  const orderSec = $('#order');
  const inView = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

  // current section highlight
  const navMap = $$('a', nav).map(a => [a, a.getAttribute('href') === '#top' ? $('.hero') : $(a.getAttribute('href'))]);
  function setCurrent() {
    let cur = navMap[0][0];
    navMap.forEach(([a, sec]) => { if (sec && sec.getBoundingClientRect().top < innerHeight * .4) cur = a; });
    navMap.forEach(([a]) => a.classList.toggle('is-current', a === cur));
  }

  /* ---------- Decor parallax ---------- */
  const decor = $$('.dc');
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 30);
    fab.classList.toggle('show', y > innerHeight * .8 && !inView(orderSec));
    setCurrent();
    if (!reduce) decor.forEach(d => { d.style.transform = `translateY(${-y * (+d.dataset.speed)}px)`; });
    if (!reduce && aboutImg) {
      const r = aboutImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        aboutImg.style.transform = `scale(1.12) translateY(${p * 6}%)`;
      }
    }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // pointer parallax on hero decor
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    const near = $$('.s1,.f1,.s3,.s5,.f3');
    addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      near.forEach((d, i) => { const k = (i % 2 ? -1 : 1) * (14 + i * 5); d.style.translate = `${x * k}px ${y * k}px`; });
    });
  }

  /* ---------- Hero slider ---------- */
  const slides = $$('.slide');
  const names = ['Красный бархат', 'Молочная девочка', 'Бархат с ягодами'];
  const nameEl = $('#slideName'), ghost = $('#ghost'), cntNow = $('#cntNow'), cntBar = $('#cntBar');
  let cur = 0, timer;
  function go(i) {
    slides[cur].classList.remove('is-active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('is-active');
    [nameEl, ghost].forEach(el => el.classList.add('swap'));
    setTimeout(() => { nameEl.textContent = ghost.textContent = names[cur]; [nameEl, ghost].forEach(el => el.classList.remove('swap')); }, 320);
    cntNow.textContent = String(cur + 1).padStart(2, '0');
    cntBar.style.top = (cur * 33.3) + '%';
  }
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(cur + 1), 5000); };
  $('.arrow.next').addEventListener('click', () => { go(cur + 1); auto(); });
  $('.arrow.prev').addEventListener('click', () => { go(cur - 1); auto(); });
  auto();

  /* ---------- Marquee: duplicate content for seamless loop ---------- */
  const mq = $('#marquee'); mq.innerHTML += mq.innerHTML;

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.grid .card').forEach((c, i) => c.style.setProperty('--rd', (i % 4) * .08 + 's'));
  $$('.spots .spot').forEach((c, i) => c.style.setProperty('--rd', i * .08 + 's'));
  $$('.facts li').forEach((c, i) => c.style.setProperty('--rd', i * .12 + 's'));
  $$('.reveal').forEach(el => io.observe(el));
  const stack = $('.candy-stack');
  new IntersectionObserver(([en], o) => { if (en.isIntersecting) { stack.classList.add('in'); o.disconnect(); } }, { threshold: .4 }).observe(stack);
  const aboutImg = $('.about-photo > img');

  /* ---------- Menu filter ---------- */
  const chips = $$('.chip'), cards = $$('.card');
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
  const form = $('#quiz');
  const steps = $$('.step', form);
  const bar = $('#quizBar'), label = $('#quizStepLabel');
  const prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn'), sendBtn = $('#sendBtn');
  const err = $('#quizError'), dateIn = $('#date'), dateHint = $('#dateHint');
  const preview = $('#preview'), summaryImg = $('#summaryImg'), toast = $('#toast'), badge = $('#cartBadge');
  const nameIn = form.elements.namedItem('name');
  let step = 0;

  const val = n => (form.querySelector(`input[name="${n}"]:checked`) || {}).value || '';
  const fmt = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
  const plusDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const isEvent = t => t === 'Candy Bar' || t === 'Сотрудничество для бизнеса';

  function adapt() {
    const t = val('type');
    const ev = isEvent(t);
    $('#cakePicker').hidden = ev;
    $('#weightField').hidden = ev;
    $('#inscriptionField').hidden = t !== 'Торт с надписью';
    $('#guestsField').hidden = !ev;
    $('#step2Title').textContent = ev ? 'Расскажите о мероприятии' : 'Выберите торт';
    const minDays = t === 'Candy Bar' ? 2 : 0;
    dateIn.min = fmt(plusDays(minDays));
    if (!dateIn.value || dateIn.value < dateIn.min) dateIn.value = fmt(plusDays(minDays || 1));
    dateHint.textContent = t === 'Candy Bar' ? 'Candy Bar принимаем минимум за 2 дня до события.' : 'Торт с витрины можем отложить и на сегодня — наличие уточним в Direct.';
    updateSummary();
  }

  function message() {
    const t = val('type');
    const d = dateIn.value ? new Date(dateIn.value + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }) : '';
    const lines = [`Здравствуйте! Хочу оформить: ${t}.`];
    if (isEvent(t)) { if ($('#guests').value) lines.push(`Мероприятие: ${$('#guests').value}`); }
    else {
      lines.push(`Торт: ${val('cake')}, ${val('weight')}`);
      if (t === 'Торт с надписью' && $('#inscription').value) lines.push(`Надпись: «${$('#inscription').value}»`);
    }
    lines.push(`Дата: ${d}`, `Забрать: ${val('place')}`, `Имя: ${nameIn.value.trim()}`);
    if ($('#phone').value) lines.push(`Телефон: ${$('#phone').value}`);
    return lines.join('\n');
  }
  function updateSummary() {
    const t = val('type');
    const pic = isEvent(t) ? 'img/profiteroles.webp' : (form.querySelector('input[name="cake"]:checked + span img') || {}).getAttribute?.('src');
    summaryImg.src = pic && !pic.includes('.svg') ? pic : 'img/hero-berries.webp';
    preview.textContent = message();
  }

  function validate() {
    err.textContent = '';
    if (step === 0 && !val('type')) { err.textContent = 'Выберите, что вам нужно.'; return false; }
    if (step === 2 && (!dateIn.value || dateIn.value < dateIn.min)) {
      err.textContent = val('type') === 'Candy Bar' ? 'Для Candy Bar выберите дату не раньше чем через 2 дня.' : 'Выберите дату не раньше сегодняшней.';
      return false;
    }
    if (step === 3 && !nameIn.value.trim()) { err.textContent = 'Укажите имя — на него отложим торт.'; nameIn.focus(); return false; }
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
    err.textContent = '';
    updateSummary();
  }

  form.addEventListener('change', e => {
    if (e.target.name === 'type') { adapt(); setTimeout(() => { if (step === 0) show(1); }, 300); }
    if (e.target.name === 'cake') { badge.hidden = false; }
    updateSummary();
  });
  form.addEventListener('input', updateSummary);
  nextBtn.addEventListener('click', () => { if (validate()) show(step + 1); });
  prevBtn.addEventListener('click', () => show(step - 1, true));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    let copied = false;
    try { await navigator.clipboard.writeText(message()); copied = true; } catch (_) {}
    toast.textContent = copied ? 'Сообщение скопировано — вставьте его в Direct и отправьте' : 'Откроем Direct — перепишите туда данные заказа';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
    setTimeout(() => window.open('https://ig.me/m/tortberi.brest', '_blank', 'noopener'), 700);
  });

  // "Забронировать" on menu cards → preselect that cake
  $$('[data-cake]').forEach(a => a.addEventListener('click', () => {
    const t = form.querySelector('input[name="type"][value="Бронь торта с витрины"]');
    const c = form.querySelector(`input[name="cake"][value="${a.dataset.cake}"]`);
    if (t) t.checked = true;
    if (c) c.checked = true;
    badge.hidden = false;
    adapt(); show(1);
  }));
  $$('[data-preset]').forEach(a => a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="type"][value="${a.dataset.preset}"]`);
    if (r) { r.checked = true; adapt(); show(1); }
  }));

  adapt();
  onScroll();
})();
