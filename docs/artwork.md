# Artwork

## Canonical Assets

- `static/images/backgrounds/background-main.png`: primary 2560x1440 world
- `static/images/branding/logo-wolf-{light,dark}.png`: official logo variants
- `static/images/characters/`: shieldmaiden and Viking warrior
- `static/images/creatures/`: foreground wolf and world serpent
- `static/images/ui/server-shield.webp`: server-status emblem
- `static/images/ui/*.svg`: original reusable ornament system

Do not alter the official logos beyond derived favicon/social sizes. Preserve source aspect ratios and transparent edges. Document origin/license for every future non-original asset.

## Composition

The homepage uses a narrow portal within the large environment. Characters may cross frame boundaries but must not cover interactive content. The server shield overlaps a separate HTML status slab. Data and controls are never baked into raster artwork.

Decorative images use empty alt text when nearby HTML carries meaning. Content/editorial images require useful alt text. Below-fold art should lazy-load with explicit dimensions.

## Inspiration

The supplied screenshots guide hierarchy, density, framing, and overlap only. Do not reproduce their branding, artwork, or exact layouts.
