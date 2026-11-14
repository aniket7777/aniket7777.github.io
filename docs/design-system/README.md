# Design system

The working design system for this site. Start here.

| Part | File | Status |
|---|---|---|
| Colour | [colour.md](colour.md) | v1.0 |
| Tokens (CSS) | [../../assets/css/tokens.css](../../assets/css/tokens.css) | v1.0 |
| Tokens (JSON) | [tokens.json](tokens.json) | v1.0 |
| Type | [type.md](type.md) | v1.1 |
| Grid and space | `assets/css/tokens.css`, section 5 | v1.1 |
| Hero effect | Ember Blinds, settings in `tokens.json` under `effect` | v1.0 |

## Principles

1. **Black and white, ember means action.** Colour carries one meaning so visitors learn it once.
2. **Components read semantic tokens only.** Never a hex value or a primitive in a component rule.
3. **Measured, not eyeballed.** Every colour pairing is in the contrast audit before it ships.
4. **The hero is the only place for motion and colour at full strength.** Sections borrow its form (the slat line), not its glow.
