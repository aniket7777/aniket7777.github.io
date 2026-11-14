# Colour system: Ember

Version 1.0. Source of truth: [`assets/css/tokens.css`](../../assets/css/tokens.css). Machine-readable copy: [`tokens.json`](tokens.json).

## The idea in one line

The site is black and white, and **ember means action**. The only place colour is free is the hero, where the Ember Blinds effect lives. Everywhere else, orange appears only on things you can act on or things responding to you.

## Why it is built this way (HFI CUA)

1. **Executive intent to design target (XR STRAT).** The landing page has one job: get a hiring manager from first impression to a case study fast. The colour system serves that by making every actionable thing findable at a glance, and nothing else competing with it.
2. **One meaning per colour reduces memory load (SOXD, VIMM).** If orange means action everywhere, a visitor learns it once on the hero CTA and recognises it on every link, button and card after that. Recognition over recall. A colour that sometimes means action and sometimes means decoration forces re-learning on every screen.
3. **Warm colours for action (ID DS).** CUA guidance puts warm hues on attention and action. Ember is the warmest thing on the page, so it naturally pulls the eye to what can be clicked.
4. **Colour ceiling (ID DS).** Research puts the comfortable limit at five to six colours per screen. This system uses four visible roles at any time: black (bg), off-white (text), grey (secondary text and lines) and ember (action). The hero glow is one hue family, so it counts as one.
5. **Never colour alone (SOXD visual load, ID DS accessibility).** Every ember state has a second, non-colour cue: links keep an underline, buttons have a filled shape, focus is a ring with an offset, card hover adds an edge light and moves the arrow. Someone who cannot tell orange from grey still gets every state.
6. **Contrast is measured, not eyeballed (SOXD).** Every text pairing passes WCAG AA (4.5:1), most pass AAA (7:1), and every non-text indicator passes 3:1. Full table below.

## Layers

1. **Primitives** (`--ink-*`, `--ember-*`): the raw scales. Components never use these directly.
2. **Semantic roles** (`--color-*`): what a colour is for. Components only read these, so a future light theme or a palette change is one file.
3. **Effect** (`--effect-*`): the hero shader's stops. Hero only.

## Primitives

**Ink.** Warm neutrals, interpolated in OKLab between the hero's black (#050302) and its off-white (#fbefe7), so greys sit on the same warm axis as the glow rather than reading as cold steel.

| Token | Hex |
|---|---|
| `--ink-950` | #050302 |
| `--ink-900` | #0f0b08 |
| `--ink-850` | #17120f |
| `--ink-800` | #211c19 |
| `--ink-700` | #3b3531 |
| `--ink-600` | #59524e |
| `--ink-500` | #776f6a |
| `--ink-400` | #948b85 |
| `--ink-300` | #b1a7a1 |
| `--ink-200` | #cdc2bb |
| `--ink-100` | #e4d8d1 |
| `--ink-50` | #fbefe7 |

**Ember.** Anchored on the hero's three stops: 200 is the peak, 500 the glow, 800 the deep. The steps between are OKLab interpolations, so the scale moves evenly in perceived lightness.

| Token | Hex |
|---|---|
| `--ember-50` | #fff4ec |
| `--ember-100` | #ffe5d2 |
| `--ember-200` | #ffc79c |
| `--ember-300` | #fca97a |
| `--ember-400` | #f78a56 |
| `--ember-500` | #f0682b |
| `--ember-600` | #c84f1f |
| `--ember-700` | #a13714 |
| `--ember-800` | #7c1f09 |
| `--ember-900` | #441205 |
| `--ember-950` | #2a0b03 |

## Semantic roles

| Role | Token | Maps to | Use |
|---|---|---|---|
| Page | `--color-bg` | ink-950 | The page background |
| Surface | `--color-surface` | ink-900 | Cards, panels |
| Raised | `--color-surface-raised` | ink-850 | Tags and chips on a card |
| Hairline | `--color-border` | ink-800 | Dividers, section rules |
| Outline | `--color-border-strong` | ink-700 | Card outlines |
| Text | `--color-text` | ink-50 | Headings, body |
| Text secondary | `--color-text-secondary` | ink-300 | Supporting copy, nav at rest |
| Text tertiary | `--color-text-tertiary` | ink-400 | Kickers, numbers, footer |
| Text disabled | `--color-text-disabled` | ink-500 | Disabled only, never the sole cue |
| Accent | `--color-accent` | ember-500 | Primary button, active item |
| Accent hover | `--color-accent-hover` | ember-400 | Hover text and fills |
| Accent pressed | `--color-accent-pressed` | ember-600 | Pressed fill |
| On accent | `--color-on-accent` | ink-950 | Label on an ember fill |
| Focus | `--color-focus` | ember-300 | Keyboard focus ring |
| Link underline | `--color-link-underline` | ember-700 | Underline at rest |
| Glow | `--color-glow` | ember-500 | Card edge light, kicker rule |
| Selection | `--color-selection-bg` | ember-800 | Selected text background |

## State rules

Wherever the old site used white for a state, the state is now ember. Rest states stay neutral.

| Element | Rest | Hover | Pressed | Focus |
|---|---|---|---|---|
| Primary button | accent fill, on-accent label | accent-hover fill, lifts 1px | accent-pressed fill | 2px focus ring, 3px offset |
| Text link | text, ember-700 underline | accent-hover text and underline | same as hover | focus ring |
| Nav link | text-secondary, no underline | accent-hover text, underline appears | same as hover | focus ring |
| Case card | outline, no glow | ember edge light follows the cursor, arrow moves, "Read" turns accent-hover | none | focus ring round the card |
| Kicker rule | glow, 26px line | none | none | none |

Two rules keep it honest:

1. **Never ember on something you cannot act on**, except the kicker rule (a 26px wayfinding mark) and the hero effect. If a designer wants orange for emphasis on plain text, the answer is weight or size, not colour.
2. **Never colour as the only change.** Every hover and focus also changes shape, position or underline.

## Contrast audit

Measured with the WCAG 2.x relative luminance formula. Text needs 4.5:1 (AA) and 7:1 for AAA. Non-text indicators need 3:1.

| Foreground | Background | Ratio | Needs | Result | Used for |
|---|---|---|---|---|---|
| `text` #fbefe7 | `bg` #050302 | 18.23:1 | 4.5 (text) | Pass (AAA) | Headings and body copy on the page |
| `text` #fbefe7 | `surface` #0f0b08 | 17.36:1 | 4.5 (text) | Pass (AAA) | Copy inside cards |
| `text-secondary` #b1a7a1 | `bg` #050302 | 8.73:1 | 4.5 (text) | Pass (AAA) | Supporting paragraphs, nav links at rest |
| `text-secondary` #b1a7a1 | `surface` #0f0b08 | 8.32:1 | 4.5 (text) | Pass (AAA) | Card summaries |
| `text-tertiary` #948b85 | `bg` #050302 | 6.17:1 | 4.5 (text) | Pass | Meta: kickers, numbers, footer |
| `text-tertiary` #948b85 | `surface-raised` #17120f | 5.57:1 | 4.5 (text) | Pass | Tags inside raised surfaces |
| `text-disabled` #776f6a | `bg` #050302 | 4.18:1 | none | Exempt | Disabled controls (exempt, never the only cue) |
| `accent` #f0682b | `bg` #050302 | 6.59:1 | 4.5 (text) | Pass | Link and nav hover text, active nav item |
| `accent-hover` #f78a56 | `bg` #050302 | 8.55:1 | 4.5 (text) | Pass (AAA) | Link hover text |
| `accent-hover` #f78a56 | `surface` #0f0b08 | 8.14:1 | 4.5 (text) | Pass (AAA) | Hover text inside cards |
| `on-accent` #050302 | `accent` #f0682b | 6.59:1 | 4.5 (text) | Pass | Primary button label |
| `on-accent` #050302 | `accent-hover` #f78a56 | 8.55:1 | 4.5 (text) | Pass (AAA) | Primary button label on hover |
| `on-accent` #050302 | `accent-pressed` #c84f1f | 4.50:1 | 4.5 (text) | Pass | Primary button label while pressed |
| `focus` #fca97a | `bg` #050302 | 10.87:1 | 3 (non-text) | Pass | Focus ring on the page |
| `focus` #fca97a | `surface` #0f0b08 | 10.35:1 | 3 (non-text) | Pass | Focus ring on cards |
| `accent` #f0682b | `bg` #050302 | 6.59:1 | 3 (non-text) | Pass | Card edge glow, kicker rule (decorative plus focus of attention) |
| `border-strong` #3b3531 | `bg` #050302 | 1.70:1 | none | Exempt | Card and input outlines (paired with surface fill) |
| `text` #fbefe7 | `selection-bg` #7c1f09 | 9.04:1 | 4.5 (text) | Pass (AAA) | Selected text |

**Watch item.** The pressed button label sits at 4.50:1, exactly on the AA line. It is visible for under 200ms and the label is unchanged from the 6.59:1 rest state, so it is acceptable, but do not darken `--ember-600` further.

**Hero.** Text over the live effect is measured separately, because the background moves. Method: drive the heat trail directly behind the copy, then sample the background under each glyph (text made transparent, everything else kept).

| Element | Median | 95th percentile | Worst moment | Needs |
|---|---|---|---|---|
| Headline (large text) | 14.6:1 | 5.9:1 | 2.8:1 | 3:1 |
| Supporting line | 18.5:1 | 18.3:1 | 18.0:1 | 4.5:1 |

The headline stays above large-text AA across 95% of its glyphs while heat passes behind it; the worst moment is a brief sheen line under one stroke. The supporting line uses `--color-text` with a soft dark text halo (the same shadow tone as the page), which keeps the background under its glyphs dark even when heat drifts through. There is no mask or brightness cap on the effect itself.

## Presentation check (ID DS five questions)

1. **Imagery relatable to the domain?** The slats come from the harvester-ant nest entrance, the bio-inspired source of the work, and read as material, not decoration.
2. **Layout complex or simple?** One accent, one alignment column, generous section spacing.
3. **Colours used effectively?** One meaning per colour; within the ceiling; contrast measured.
4. **Graphics consistent?** The slat motif repeats as static grey lines in section dividers and card art, at the hero's angle.
5. **Does text strengthen the design?** Short headline over the effect; supporting copy in secondary text so the hierarchy is carried by size and tone, not colour.

## Changing the palette

Edit primitives in `tokens.css` only, then re-run the contrast audit. If a semantic role fails, re-map the role to a different step rather than adding a one-off colour.
