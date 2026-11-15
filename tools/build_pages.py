#!/usr/bin/env python3
"""Generates the landing page, the company pages (L1) and the case study pages (L2) from one set of templates,
so nav, footer and head stay identical everywhere. Run from the repo root."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETTINGS = open(os.path.join(ROOT, 'index.html')).read()
SETTINGS = SETTINGS[SETTINGS.index('<!-- ===== HERO EFFECT SETTINGS'):SETTINGS.index('</script>', SETTINGS.index('id="effect-settings"')) + len('</script>')]

def T(s):  # placeholder copy, visibly marked until real content replaces it
    return f'<span class="tbd">{s}</span>'

COS = {
  'bakerstreet': dict(name='Bakerstreet Digital', role='Senior Associate, Experience Design', when='Oct 2024 to now', where='Pune', kind='Fintech-focused design agency',
                      line='A fintech-focused agency. I design across two client accounts, ' + '[banking] and [wealth management].'),
  'jio': dict(name='Jio', role=T('Your title at Jio'), when='Jan 2019 to Nov 2023', where=T('City'), kind='Consumer platforms at national scale',
              line='Part of the team behind Jio.com, 2.4M daily users.'),
}
CASES = [
  dict(slug='identity-consent', title='Identity and consent, rebuilt for trust', co='bakerstreet', account='[banking]', tag='Identity', tbd_title=True,
       blurb='The problem, the reframe and the measurable change, in two lines.'),
  dict(slug='add-asset', title='Add Asset, one guided flow for every asset type', co='bakerstreet', account='[wealth management]', tag='Wealth Office',
       blurb='Started with Real Estate, then every asset type through a single, guided way in.'),
  dict(slug='insight-management', title='Insight Management System', co='bakerstreet', account='[wealth management]', tag='AI systems',
       blurb='Turning scattered client insight into something advisers act on.'),
  dict(slug='jio-com', title='Jio.com at 2.4M daily users', co='jio', account='Jio', tag='Scale',
       blurb='Designing for reach, speed and a very wide audience.'),
]
NAV = lambda p: f'''<nav class="top" aria-label="Main">
    <a class="mark" href="{p}index.html">Aniket Shrivastava</a>
    <div class="links"><a href="{p}index.html#work">Work</a><a href="{p}index.html#experience">Experience</a><a href="{p}index.html#about">About</a><a href="{p}index.html#contact">Contact</a></div>
  </nav>'''

def head(p, title, desc):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="preload" href="{p}assets/fonts/instrument-sans-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{p}assets/css/tokens.css">
<link rel="stylesheet" href="{p}assets/css/site.css">
<link rel="icon" href="{p}assets/img/favicon.svg" type="image/svg+xml">
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow"><!-- PREVIEW: remove this line at public launch -->
<meta name="theme-color" content="#050302">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{p}assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<script>
/* Headings wait for their line reveal, but never longer than 3s if the animation library is slow or blocked */
(function () {{ try {{ if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; }} catch (e) {{}}
  var d = document.documentElement; d.classList.add('split-ready');
  setTimeout(function () {{ if (!window.SplitText) d.classList.remove('split-ready'); }}, 3000); }})();
</script>
</head>
<body>'''

def closing(p):
    return f'''<div class="closing">
  <canvas id="cv2" aria-hidden="true"></canvas>
  <section class="block" id="contact">
    <div class="wrap contact">
      <p class="kicker">Contact</p>
      <h2>Let&rsquo;s find the friction.</h2>
      <div class="row">
        <a href="#" class="btn btn-primary">Email me <span class="arr" aria-hidden="true">&rarr;</span></a>
        <a href="#" class="btn btn-ghost">LinkedIn</a>
      </div>
    </div>
  </section>
  <footer class="site">
    <div class="wrap fcols">
      <div><h3>Elsewhere</h3><ul><li><a href="#">Email</a></li><li><a href="#">LinkedIn</a></li><li><a href="#">{T('Resume (PDF)')}</a></li></ul></div>
      <div><h3>Pages</h3><ul><li><a href="{p}index.html#work">Selected work</a></li><li><a href="{p}index.html#experience">Experience</a></li><li><a href="{p}index.html#about">About</a></li></ul></div>
      <div><h3>Based in</h3><ul><li><span>Pune, India</span></li><li><span data-clock>IST</span></li></ul></div>
    </div>
    <div class="wrap legal"><span>&copy; 2026 Aniket Shrivastava</span><span>Preview build, placeholder content</span></div>
    <p class="bigname" aria-hidden="true"><span class="base">Aniket</span><span class="lit">Aniket</span></p>
  </footer>
</div>'''

def scripts(p):
    return f'''<script src="{p}assets/js/ember.js"></script>
<script src="{p}assets/js/site.js"></script>
<script defer src="{p}assets/js/gsap.min.js"></script>
<script defer src="{p}assets/js/ScrollTrigger.min.js"></script>
<script defer src="{p}assets/js/SplitText.min.js"></script>
</body>
</html>
'''

# ---------------- L0: landing ----------------
def index():
    p = ''
    rows = '\n'.join(f'''        <li class="reveal"><a href="case/{c['slug']}.html"><span class="n">{i+1:02d}</span><span class="t">{T(c['title']) if c.get('tbd_title') else c['title']}</span><span class="m">{c['account']} &middot; {c['tag']}</span><span class="arr" aria-hidden="true">&rarr;</span></a></li>''' for i, c in enumerate(CASES))
    b, j = COS['bakerstreet'], COS['jio']
    tiles = '\n'.join(f'          <li><div class="tile"><span>Photo {i:02d}</span></div><p class="cap">{T("Caption")}</p></li>' for i in range(1, 7))
    return head(p, 'Aniket Shrivastava, product designer', 'Aniket Shrivastava designs the moments people hand over money and identity. Experience designer across banking and wealth, Pune.') + f'''
{SETTINGS}
<a class="skip" href="#work">Skip to work</a>

<header class="hero" aria-labelledby="hero-h">
  <canvas id="cv" aria-hidden="true"></canvas>
  {NAV(p)}
  <div class="center">
    <div class="copy">
      <h1 id="hero-h">Designing the moments people hand over money and identity.</h1>
      <p class="sub">Senior experience designer across banking and wealth. Six years in product design, including the team behind Jio.com and its 2.4M daily users.</p>
      <div class="ctas">
        <a href="#work" class="btn btn-primary">Selected work <span class="arr down" aria-hidden="true">&darr;</span></a>
        <a href="#contact" class="btn btn-ghost">Get in touch</a>
      </div>
    </div>
  </div>
  <div class="foot" aria-hidden="true"><span>Pune, India</span><span class="hint-mouse">Move to warm the blinds</span><span class="hint-touch">Drag to warm the blinds</span></div>
</header>

<main>
  <section class="block" id="work">
    <div class="wrap">
      <p class="kicker reveal">Selected work</p>
      <h2>Proof, in four case studies.</h2>
      <ol class="index">
{rows}
      </ol>
      <p class="note-tbd">Layout placeholder: the selected work design is still being explored</p>
    </div>
  </section>

  <div class="wrap"><span class="slat-rule" aria-hidden="true"></span></div>

  <section class="block" id="experience">
    <div class="wrap">
      <p class="kicker reveal">Experience</p>
      <h2>Where the work happened.</h2>
      <ol class="exp">
        <li class="reveal"><a href="work/bakerstreet.html"><span class="when">{b['when']}</span><span><span class="co">{b['name']}</span><span class="role">{b['role']}</span><span class="what">{b['line']}</span></span><span class="go">See the work <span aria-hidden="true">&rarr;</span></span></a></li>
        <li class="reveal gap"><div><span class="when">Nov 2023 to Oct 2024</span><span><span class="co">Full-time study</span><span class="what">{T('A year preparing for the MDes entrance exams at IIT and NID. Wording is your call.')}</span></span><span></span></div></li>
        <li class="reveal"><a href="work/jio.html"><span class="when">{j['when']}</span><span><span class="co">{j['name']}</span><span class="role">{j['role']}</span><span class="what">{j['line']}</span></span><span class="go">See the work <span aria-hidden="true">&rarr;</span></span></a></li>
      </ol>
    </div>
  </section>

  <div class="wrap"><span class="slat-rule" aria-hidden="true"></span></div>

  <section class="block" id="about">
    <div class="wrap about">
      <div>
        <p class="kicker reveal">About</p>
        <h2>Designing for decisions that carry weight.</h2>
      </div>
      <div class="reveal">
        <p><b>What I do.</b> Senior experience designer in Pune, working across banking and wealth management. Six years in product design, with a CS engineering degree and a postgraduate certification in visual design and UX from IIT Hyderabad.</p>
        <p><b>How I think.</b> {T('A line on framing before pixels: questioning the brief, HFI CUA methods, deciding with evidence.')}</p>
        <p><b>Outside work.</b> {T('What you are into and what you do outside work.')}</p>
      </div>
    </div>
    <div class="carousel" aria-roledescription="carousel" aria-label="Life outside work">
      <div class="wrap car-head"><span class="kicker" style="margin:0">Outside work</span><div class="car-btns"><button type="button" data-dir="-1" aria-label="Previous photos">&larr;</button><button type="button" data-dir="1" aria-label="Next photos">&rarr;</button></div></div>
      <ul class="track" tabindex="0" aria-label="Photos, scroll sideways">
{tiles}
      </ul>
    </div>
  </section>
</main>

{closing(p)}
''' + scripts(p)

# ---------------- L1: company page ----------------
def company(key):
    p, c = '../', COS[key]
    mine = [x for x in CASES if x['co'] == key]
    def card(x):
        t = T(x['title']) if x.get('tbd_title') else x['title']
        return f'''        <li><article class="proj"><h3>{t}</h3><p>{x['blurb']}</p><div class="act"><a class="btn btn-ghost" href="../case/{x['slug']}.html">Read the case study <span class="arr" aria-hidden="true">&rarr;</span></a></div></article></li>'''
    def extra(name, line):
        return f'''        <li><article class="proj"><h3>{name}</h3><p>{line}</p><div class="act"><span class="soon">Overview only</span></div></article></li>'''
    if key == 'bakerstreet':
        groups = f'''
    <div class="group">
      <h2>[banking]</h2>
      <p>{T('One line on the account: who the users are and what you own on it.')}</p>
      <ul class="projects">
{card(mine[0])}
{extra(T('Second [banking] project'), T('One or two lines.'))}
      </ul>
    </div>
    <div class="group">
      <h2>[wealth management]</h2>
      <p>{T('One line on the account: the Wealth Office product, advisers and their clients.')}</p>
      <ul class="projects">
{card(mine[1])}
{card(mine[2])}
{extra('SIA capability', T('Capture-first scope after the stakeholder reset. One or two lines.'))}
{extra(T('Fourth project'), T('One or two lines.'))}
      </ul>
    </div>'''
        lede = T('Two to three lines: what Bakerstreet is, what you are trusted with there, and the shape of the work across both accounts.')
        team = T('Team size and who you work with')
    else:
        groups = f'''
    <div class="group">
      <h2>Selected projects</h2>
      <ul class="projects">
{card(mine[0])}
{extra(T('Project two'), T('One or two lines.'))}
{extra(T('Project three'), T('One or two lines.'))}
{extra(T('Project four'), T('One or two lines.'))}
      </ul>
    </div>'''
        lede = T('Two to three lines: what you did at Jio, the scale, and what changed in how you work.')
        team = T('Team size and who you worked with')
    return head(p, f"{c['name']}, Aniket Shrivastava", f"Aniket's work at {c['name']}.") + f'''
<header>{NAV(p)}</header>
<main>
  <div class="wrap">
    <div class="page-head">
      <p class="crumb"><a href="../index.html#experience">Experience</a><span aria-hidden="true">/</span><span>{c['name']}</span></p>
      <h1>{c['name']}</h1>
      <p class="lede">{lede}</p>
      <dl class="facts">
        <div><dt>Role</dt><dd>{c['role']}</dd></div>
        <div><dt>When</dt><dd>{c['when']}</dd></div>
        <div><dt>Team</dt><dd>{team}</dd></div>
        <div><dt>Where</dt><dd>{c['where']}</dd></div>
      </dl>
    </div>
{groups}
    <div class="next" style="margin:var(--section-space) 0 0"><a class="btn btn-ghost" href="../index.html#experience"><span class="arr" aria-hidden="true">&larr;</span> All experience</a></div>
  </div>
</main>
{closing(p)}
''' + scripts(p)

# ---------------- L2: case study page (the nine-part template) ----------------
PARTS = [
  ('The stakes', 'Who the users are, what they are handing over (money, identity, a decision), and what goes wrong if it fails.'),
  ('My role', 'Led, owned or contributed. Team size, duration, who you worked with.'),
  ('The brief as given', 'The problem in the client or team framing, as it arrived.'),
  ('What I questioned', 'Assumptions made before any design existed, the inherited framing, unvalidated beliefs about users, constraints accepted without being challenged.'),
  ('The reframe', 'The problem restated from first principles, and the measurable target it led to.'),
  ('Decisions', 'Three to five calls: options, the choice, why, and what it cost.'),
  ('Edge cases and system effects', 'The states that make it safe at scale, and which other flows or teams the work touched.'),
  ('Outcome', 'A metric where it exists; otherwise the strongest honest proxy, named as a proxy.'),
  ('What I would change', 'One or two things, said plainly.'),
]
def case(i):
    p, c = '../', CASES[i]
    co = COS[c['co']]
    nxt = CASES[(i + 1) % len(CASES)]
    secs = '\n'.join(f'''    <section><h2><span class="num">{k+1:02d}</span>{h}</h2><div><p>{T(d)}</p></div></section>''' for k, (h, d) in enumerate(PARTS))
    title = T(c['title']) if c.get('tbd_title') else c['title']
    return head(p, f"{re.sub('<[^>]+>', '', c['title'])}, Aniket Shrivastava", c['blurb']) + f'''
<header>{NAV(p)}</header>
<main>
  <div class="wrap">
    <div class="page-head">
      <p class="crumb"><span>Part of my work at</span><a href="../work/{c['co']}.html">{co['name']}</a></p>
      <h1>{title}</h1>
      <p class="lede">{c['blurb']}</p>
      <dl class="facts">
        <div><dt>Account</dt><dd>{c['account']}</dd></div>
        <div><dt>Role</dt><dd>{T('Led / owned / contributed')}</dd></div>
        <div><dt>Team</dt><dd>{T('Size and disciplines')}</dd></div>
        <div><dt>Timeline</dt><dd>{T('Month to month, year')}</dd></div>
      </dl>
    </div>
    <div class="case-body">
{secs}
      <div class="next"><a class="btn btn-ghost" href="../work/{c['co']}.html"><span class="arr" aria-hidden="true">&larr;</span> More from {co['name']}</a><a class="btn btn-ghost" href="{nxt['slug']}.html">Next: {re.sub('<[^>]+>', '', nxt['title'])} <span class="arr" aria-hidden="true">&rarr;</span></a></div>
    </div>
  </div>
</main>
{closing(p)}
''' + scripts(p)

os.makedirs(os.path.join(ROOT, 'work'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'case'), exist_ok=True)
open(os.path.join(ROOT, 'index.html'), 'w').write(index())
for k in COS: open(os.path.join(ROOT, 'work', k + '.html'), 'w').write(company(k))
for i, c in enumerate(CASES): open(os.path.join(ROOT, 'case', c['slug'] + '.html'), 'w').write(case(i))
print('ok')
