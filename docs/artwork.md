# Artwork

## Canonical Assets

- `static/images/backgrounds/background-main.png`: primary 2560x1440 world
- `static/images/branding/logo-wolf-{light,dark}.png`: official logo variants
- `static/images/characters/`: shieldmaiden and Viking warrior
- `static/images/creatures/`: foreground wolf and world serpent
- `static/images/ui/server-shield.webp`: server-status emblem
- `static/images/ui/*.svg`: original reusable ornament system

## Imported Reference Media

- `static/media/warheim/valhalla-gates.webp`: local copy of the owned Warheim Valhalla gate artwork, sourced from `https://warheim.fr/media/warheim-valhalla-gates.webp`.
- `static/media/warheim/forged-hero.webp`: local copy of the owned Warheim forged hero artwork, sourced from `https://warheim.fr/media/warheim-forged-hero.webp`.
- `static/media/warheim/warheim-hero.webp`: local copy of the owned Warheim main hero artwork, sourced from `https://warheim.fr/media/warheim-hero-v2.webp`.
- `static/media/warheim/gallery/`: local copies of selected owned Warheim gallery artwork used by the homepage arsenal section.
- `static/media/warheim/valhalla-gate.mp3`: local copy of the owned Warheim gate music, sourced from `https://warheim.fr/audio/valhalla-gate.mp3`.
- `static/media/warheim/playlist/`: local copies of the ten owned Warheim radio tracks sourced from `https://warheim.fr/audio/` and `https://warheim.fr/audio/playlist/`.
- `static/media/valheim/valheim-1-0-deep-north.jpg`: official Valheim 1.0/Deep North artwork sourced from Iron Gate Studio's release media at `https://www.valheimgame.com/news/valheim-1-0-has-arrived-`.
- `static/media/deathborn/`: local copies of Deathborn's `The Reaper's Call`, `The Light of the Living (Instrumental)`, and `The Shadow of the Forgotten (Instrumental)` tracks, used with the user's permission for the Wolves radio.
- `static/media/warheim/universfield-wolf-howl-140235.mp3`: gate-opening wolf howl used as the entry sound.

These files were copied locally with the owner's permission for the Wolves of Ragnarok entry experience. They are not hotlinked at runtime.

Do not alter the official logos beyond derived favicon/social sizes. Preserve source aspect ratios and transparent edges. Document origin/license for every future non-original asset.

## Composition

The homepage uses a narrow portal within the large environment. Characters may cross frame boundaries but must not cover interactive content. The server shield overlaps a separate HTML status slab. Data and controls are never baked into raster artwork.

Decorative images use empty alt text when nearby HTML carries meaning. Content/editorial images require useful alt text. Below-fold art should lazy-load with explicit dimensions.

## Inspiration

The supplied screenshots guide hierarchy, density, framing, and overlap only. Do not reproduce their branding, artwork, or exact layouts.
