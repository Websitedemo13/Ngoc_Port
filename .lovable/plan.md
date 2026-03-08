

## Plan: Custom Color Picker for Admin

### Overview
Add a "Custom Theme" option alongside the 6 preset themes. Admin picks 4 key colors (primary, secondary, accent, background) using native `<input type="color">` pickers, and the system auto-generates all CSS variables (light + dark) from those base colors.

### Changes

#### 1. `src/lib/colorThemes.ts` — Add custom theme generator
- Add `generateCustomTheme(colors: {primary, secondary, accent, bg})` function that converts hex colors to HSL and generates the full `light` and `dark` CSS variable maps
- Add `applyCustomTheme(colors, isDark)` function
- Update `applyColorTheme` to handle `themeId === 'custom'` by reading custom colors from a parameter or settings

#### 2. `src/pages/admin/SettingsManager.tsx` — Custom color picker UI
- Add a "Custom / Tùy chỉnh" card in the theme grid (7th option) with a paint palette icon
- When selected, expand a panel with 4 color pickers: Primary, Secondary, Accent, Background
- Store state as `customColors: {primary, secondary, accent, bg}` 
- Live preview: apply colors immediately on change
- Save custom colors as JSON in settings key `custom_theme_colors`
- Save `color_theme` value as `'custom'` when custom is active

#### 3. `src/components/ColorThemeApplier.tsx` — Support custom theme
- When `color_theme === 'custom'`, also fetch `custom_theme_colors` from settings
- Parse JSON and call the custom theme generator to apply CSS variables

### Technical Details
- HSL conversion from hex enables auto-generating darker/lighter variants for card, muted, border etc.
- Dark mode variants auto-derived by inverting lightness values
- No database schema changes needed — uses existing `settings` table with keys `color_theme` and `custom_theme_colors`

