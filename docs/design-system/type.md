# Type system

Version 1.1. Source of truth: [`assets/css/tokens.css`](../../assets/css/tokens.css), section 4.

## The choice

**Instrument Sans** for everything, **JetBrains Mono** for labels only. Both are free under the SIL Open Font License and served from this site, so there is no third-party request before first paint.

Instrument Sans is one variable file (57 KB, Latin) with two axes: weight 400 to 700 and width 75% to 100%. The width axis does the work a second display typeface would normally do: condensed headlines and normal-width body come from the same family, so the page stays one voice.

## Why it fits Ember

1. **Calm next to a loud hero.** The hero carries the motion and colour; the type stays quiet and premium so the two do not compete.
2. **Condensed headlines echo the slats.** Tall, tight letterforms repeat the vertical rhythm of the blinds.
3. **Credibility first.** Editorial, not trendy. It reads as a senior product designer, not a studio experiment (HFI ID DS: does the text strengthen the design?).

## Roles

| Role | Token | Width | Weight | Used for |
|---|---|---|---|---|
| Display | `--fs-display`, `--fs-display-2` | `--wdth-display` 75% | 500 | Hero and contact headlines |
| Heading | `--fs-h2`, `--fs-stat` | `--wdth-heading` 85% | 500 | Section headings, stat numbers |
| Title | `--fs-h3`, `--fs-h4` | 100% | 600 | Case and step titles |
| Lead | `--fs-lead` | 100% | 400 | Supporting paragraphs |
| Body | `--fs-body`, `--fs-small` | 100% | 400 | Copy, card summaries |
| Button | `--fs-button` | 100% | 600 | Buttons and links |
| Label | `--fs-label`, `--fs-micro` | mono | 400 to 500 | Kickers, numbers, tags (uppercase, tracked) |

## Rules

1. **Condensed only at 36 px and above.** Below that, condensed letters lose legibility; body text never uses a width below 100%.
2. **Line length 65 to 75 characters** for reading text (HFI ID DS); `max-width` in `ch` on every paragraph.
3. **Uppercase only for short mono labels.** All-caps reads 14 to 20% slower, so it never carries a sentence.
4. **Hierarchy by size, width and weight, not colour.** Colour is reserved for action (see `colour.md`).
