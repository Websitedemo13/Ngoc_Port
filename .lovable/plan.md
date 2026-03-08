

## Plan: Premium Cover Image for Projects

The current project form already has a `MediaUpload` for `image_url`, and the Projects listing page and ProjectDetail page already display it. The request is to make the cover image display **premium and beautiful** across both the admin form and public-facing pages.

### Changes

#### 1. `src/pages/admin/ProjectsManager.tsx` — Premium cover image upload UI
- Replace the basic `MediaUpload` with a visually rich cover image section at the top of the form
- Show a large preview area with overlay gradient, drag-drop feel, and clear "Ảnh bìa dự án" labeling
- When an image is set, show it as a full-width banner preview with remove button overlay
- When empty, show a styled placeholder with upload icon and hint text

#### 2. `src/pages/admin/ProjectsManager.tsx` — Table thumbnail
- Add a small thumbnail column in the projects table showing the cover image (or a placeholder icon) for quick visual reference

#### 3. `src/pages/Projects.tsx` — Premium card cover image
- Enhance the project card image with a subtle hover parallax/zoom effect (already has `group-hover:scale-110`)
- Add gradient overlay on the image area for better text contrast
- Show a placeholder illustration when no cover image exists

#### 4. `src/pages/ProjectDetail.tsx` — Premium hero cover
- Already has a hero image section; enhance with:
  - Parallax-style background attachment
  - Slightly taller hero (50vh → 60vh on desktop)
  - Better gradient overlay for readability
  - Subtle animation on load (fade-in scale)

All changes are purely UI/CSS — no database or API changes needed.

