# Theming

Global tokens live in `src/lib/styles/tokens.css`; global behavior and environmental composition live in `src/lib/styles/app.css`.

## Visual Language

Use charcoal, black, dark iron, steel, restrained cold teal, muted brass, and sparse ember accents. Cinzel is reserved for display/navigation labels and Libre Baskerville for readable content. Avoid modern rounded rectangles, one-note blue palettes, excessive gradients, and generic fantasy clipart.

Panels should read as forged iron or carved stone through sharp silhouettes, thin metallic highlights, rivets, knotwork, and controlled texture. Cards are for repeated records only; sections remain connected parts of the portal.

## Responsive Rules

Desktop prioritizes the dense portal composition. Mobile stacks semantic modules while retaining frames and atmosphere. Resize or crop decorative art independently of content. Never reduce body text to preserve artwork. Maintain stable control dimensions, no horizontal overflow, and visible focus states.

## Motion

Use slow rune glow, mist, ember, and transform-based depth sparingly. Honor `prefers-reduced-motion`. Do not introduce WebGL for decoration.

## SVG System

Reusable SVG assets under `static/images/ui/` remain content-free and scalable. Prefer wrappers or CSS masks when recoloring is needed. Keep ornament and interactive content as separate DOM layers.
