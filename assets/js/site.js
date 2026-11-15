/* Site behaviour shared by every page: slat motif, reveals, in-page links, the About carousel, heading line reveals. */
(function () {
  var rm = false; try { rm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* Slat motif: the hero's slat line, drawn as static grey strokes at the same angle and curve */
  var a = 48 * Math.PI / 180;
  function svg(w, h, gap, amp) {
    var t = Math.tan(Math.PI / 2 - a), d = '', n = Math.ceil((w + h * Math.abs(t)) / gap) + 2;
    for (var i = -2; i < n; i++) {
      var x0 = i * gap - h * Math.abs(t), pts = [];
      for (var s = 0; s <= 12; s++) { var y = h * s / 12, x = x0 + y * Math.abs(t) + amp * Math.sin(y / h * Math.PI * 2 + i * 0.5); pts.push((s ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)); }
      d += pts.join('');
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>';
  }
  function paint() {
    document.querySelectorAll('.slat-rule').forEach(function (el) { el.innerHTML = svg(Math.round(el.clientWidth) || 1000, 56, 58, 6); });
    document.querySelectorAll('.tile').forEach(function (el) { var old = el.querySelector('svg'); if (old) old.remove(); el.insertAdjacentHTML('afterbegin', svg(Math.round(el.clientWidth) || 300, Math.round(el.clientHeight) || 375, 34, 10)); });
  }
  var pt = 0; addEventListener('resize', function () { clearTimeout(pt); pt = setTimeout(paint, 200); }); paint();

  /* Reveal on scroll */
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) els.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e, i) { if (e.isIntersecting) { var el = e.target; setTimeout(function () { el.classList.add('in'); }, 60 * (i % 4)); io.unobserve(el); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* In-page links scroll smoothly (instantly with reduced motion) */
  document.addEventListener('click', function (e) {
    var l = e.target.closest && e.target.closest('a[href^="#"]'); if (!l) return;
    var id = l.getAttribute('href').slice(1); if (!id) return;
    var el = document.getElementById(id); if (!el) return;
    e.preventDefault();
    scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: rm ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id);
  });

  /* Carousel: native horizontal scroll with snap; the buttons move one tile and disable at the ends */
  document.querySelectorAll('.carousel').forEach(function (c) {
    var track = c.querySelector('.track'), prev = c.querySelector('[data-dir="-1"]'), next = c.querySelector('[data-dir="1"]');
    if (!track) return;
    function step() { var li = track.querySelector('li'); return li ? li.getBoundingClientRect().width + 16 : 300; }
    function sync() { var max = track.scrollWidth - track.clientWidth - 2; if (prev) prev.disabled = track.scrollLeft <= 2; if (next) next.disabled = track.scrollLeft >= max; }
    [prev, next].forEach(function (b) { if (b) b.addEventListener('click', function () { track.scrollBy({ left: step() * +b.dataset.dir, behavior: rm ? 'auto' : 'smooth' }); }); });
    track.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
  });

  /* Local time in the footer */
  var clock = document.querySelector('[data-clock]');
  if (clock) { var tick = function () { try { clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date()) + ' IST'; } catch (e) {} }; tick(); setInterval(tick, 30000); }

  /* Heading line reveal (GSAP SplitText, loaded deferred); headings show after 2.5s whatever happens */
  document.addEventListener('DOMContentLoaded', function () {
    var heads = [].slice.call(document.querySelectorAll('.hero h1, .block h2, .page-head h1'));
    function show() { heads.forEach(function (h) { h.style.visibility = 'visible'; }); }
    if (rm || !window.gsap || !window.ScrollTrigger || !window.SplitText) { show(); return; }
    gsap.registerPlugin(ScrollTrigger, SplitText);
    var done = false;
    function run() {
      if (done) return; done = true;
      heads.forEach(function (h) {
        var first = !!h.closest('.hero, .page-head');
        SplitText.create(h, { type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'line',
          onSplit: function (self) { gsap.set(h, { visibility: 'visible' });
            return gsap.from(self.lines, { yPercent: 115, duration: first ? 1.1 : 0.9, ease: 'power3.out', stagger: 0.09, delay: first ? 0.2 : 0, scrollTrigger: first ? null : { trigger: h, start: 'top 88%', once: true } }); } });
      });
    }
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);
    setTimeout(function () { run(); show(); }, 2500);
  });
})();
