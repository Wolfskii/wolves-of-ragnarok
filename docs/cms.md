# CMS

The lightweight CMS manages homepage settings/features, news, static pages, users, servers, media, and community links. Administration routes live under `/admin` and require `ADMIN` on the server.

## Content

News and pages are separate models with stable unique slugs, draft/published/archived state, optional publication time, SEO fields, and author attribution. Only published content whose publication time has arrived is public.

Homepage content uses explicit `SiteSettings` fields and repeatable `HomepageFeature` records rather than an untyped page-builder document. Discord visibility and URL use `CommunityLink`.

## Editing

The intended editor stores Markdown and sanitizes generated HTML before rendering. Rich content must never be rendered with unrestricted Svelte `{@html}`. Mutations use named form actions and confirmation for destructive operations.

## Media

Bundled brand/environment art remains in `static/images/`. Admin uploads use a local persistent volume through a storage interface. Uploads must verify declared MIME, extension, and magic bytes; enforce size limits; generate UUID storage names; process bounded derivatives; and require useful alt text for editorial images.
