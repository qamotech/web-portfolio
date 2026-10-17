// Harbor Light — shared behaviour (menu, donation calculator, forms). No tracking, no external calls.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // mobile menu
  const menuBtn = $('.menu-btn'), nav = $('.nav');
  if (menuBtn && nav) menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open);
  });

  // progress bars animate in when visible
  const bars = $$('.progress i[data-pct]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.pct + '%'; io.unobserve(e.target); } }), { threshold: .4 });
    bars.forEach(b => io.observe(b));
  } else bars.forEach(b => { b.style.width = b.dataset.pct + '%'; });

  // donation calculator: $1 provides 3 meals through our food-bank partnership
  const calc = $('[data-calc]');
  if (calc) {
    let amount = 50, monthly = false;
    const out = $('[data-impact]', calc), custom = $('#custom-amt', calc), go = $('[data-give]', calc);
    const render = () => {
      const meals = Math.round(amount * 3), year = monthly ? meals * 12 : meals;
      out.textContent = amount > 0
        ? `$${amount.toLocaleString()} ${monthly ? 'a month' : ''} provides about ${meals.toLocaleString()} meals${monthly ? ` — ${year.toLocaleString()} meals a year` : ''}.`
        : 'Choose an amount to see your impact.';
      if (go) go.textContent = amount > 0 ? `Give $${amount.toLocaleString()}${monthly ? ' monthly' : ''}` : 'Give';
    };
    $$('.amounts button', calc).forEach(b => b.addEventListener('click', () => {
      amount = +b.dataset.amt; custom.value = '';
      $$('.amounts button', calc).forEach(x => x.setAttribute('aria-pressed', x === b)); render();
    }));
    custom && custom.addEventListener('input', () => {
      const v = Math.max(0, Math.min(100000, Math.round(+custom.value.replace(/[^\d.]/g, '') || 0)));
      amount = v; $$('.amounts button', calc).forEach(x => x.setAttribute('aria-pressed', false)); render();
    });
    $$('.freq button', calc).forEach(b => b.addEventListener('click', () => {
      monthly = b.dataset.freq === 'monthly'; $$('.freq button', calc).forEach(x => x.setAttribute('aria-pressed', x === b)); render();
    }));
    go && go.addEventListener('click', e => {
      e.preventDefault();
      if (amount < 1) { custom.focus(); return; }
      // In production this button links to a Stripe Payment Link / PayPal Donate URL.
      const dlg = $('#checkout-demo');
      if (dlg && dlg.showModal) { $('[data-demo-amt]', dlg).textContent = `$${amount.toLocaleString()}${monthly ? ' / month' : ''}`; dlg.showModal(); }
    });
    render();
  }

  // forms with friendly inline validation
  $$('form[data-validate]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(f => {
        const msg = $(`[data-err-for="${f.id}"]`, form);
        let err = '';
        if (!f.value.trim()) err = 'Please fill this in.';
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) err = 'That email doesn\'t look right.';
        if (msg) msg.textContent = err;
        f.setAttribute('aria-invalid', !!err);
        if (err && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      // Demo: a live site posts to Formspree / Netlify Forms. Nothing is sent here.
      form.hidden = true;
      const done = $(form.dataset.done); if (done) { done.hidden = false; done.focus(); }
    });
  });
})();
