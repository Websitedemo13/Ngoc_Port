

## Plan: Nâng cấp Home với Hero Animation, Parallax & Testimonials

### Overview
Upgrade the Home page with scroll-triggered animations, parallax background effects, a testimonials/quotes section, and animated counters — all using pure CSS/React (no framer-motion needed given existing animation utilities).

### Changes

#### 1. Home.tsx — Full rewrite with new features

**Hero Section Enhancements:**
- Add animated floating geometric shapes (circles, lines) with CSS keyframe animations
- Staggered text entrance animations (badge → name → title → quote → buttons appear sequentially)
- Parallax scrolling effect using `useEffect` + `scroll` event to translate background elements at different speeds
- Animated gradient orbs that slowly drift

**Scroll-triggered Animations:**
- Create a custom `useScrollReveal` hook using `IntersectionObserver` to trigger fade-in/slide-up animations when sections enter viewport
- Apply to all sections: stats, projects, blog, testimonials, CTA

**Animated Counter for Stats:**
- Create a `CountUp` component that animates numbers from 0 to target value when visible
- Uses `requestAnimationFrame` for smooth counting

**New Testimonials Section (between Blog and CTA):**
- Hardcoded testimonial quotes (bilingual EN/VN) with avatar placeholders
- Carousel-style layout on mobile, 3-column grid on desktop
- Quote icon decoration, gold accent borders
- Premium card design with subtle hover effects

**Enhanced Parallax Background:**
- Hero: floating gold particles/orbs that move on scroll
- Between-section decorative dividers with wave SVGs

#### 2. tailwind.config.ts — Add new keyframes
- `float` keyframe (gentle up-down drift)
- `float-delayed` (offset timing)
- `pulse-glow` (subtle glow pulse for orbs)

#### 3. src/index.css — Add parallax utility classes
- `.parallax-slow`, `.parallax-fast` for different scroll speeds
- `.animate-float` for floating elements

### Technical Approach
- **No new dependencies** — pure React hooks + CSS animations + IntersectionObserver
- Custom `useScrollReveal` hook returns a ref; when element enters viewport, adds animation class
- Parallax via `onScroll` with `transform: translateY()` at reduced rate
- Testimonials data as a static array in the component (can later be moved to Supabase)
- All animations respect `prefers-reduced-motion`

### Sections Order (final)
1. Hero (parallax + staggered animations)
2. Stats (animated counters + scroll reveal)
3. Featured Projects (scroll reveal)
4. Testimonials (new — scroll reveal + hover effects)
5. Latest Blog Posts (scroll reveal)
6. CTA (scroll reveal + parallax background)

