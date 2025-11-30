# Personal Medical Kit Web App - Design Guidelines

## Design Philosophy
**Sick-Day First**: Every design decision optimized for users who are ill and low-energy. Maximum clarity, minimum effort, immediate value within ≤3 clicks.

## Color Palette
- **Sage Green** (#A3C6A0): Primary actions, main CTAs
- **Muted Teal** (#6FAF9B): Secondary actions, supporting elements
- **Light Beige** (#F5F3E7): Background (easy on eyes when sick)
- **Soft Grey** (#D8D8D8): Borders, dividers
- **Deep Charcoal** (#333333): Text (high contrast for readability)
- **Soft Coral** (#F29F8F): Low stock warnings (≤3 items)
- **Emergency Red** (#E57373): Out of stock alerts

**Stock Status Indicators**:
- 🟢 Green: >3 items in stock
- 🟡 Yellow: ≤3 items (low stock)
- 🔴 Red: 0 items (out of stock)

## Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 28px, bold
- **Body Text**: 18px (larger than typical for sick-day readability)
- **Button Text**: 20px, bold
- **Line Height**: 1.8 (extra spacing for clarity)
- **Minimum Touch Target**: 44px for all interactive elements (mobile)

## Layout & Spacing
- **Desktop**: 3-column dashboard layout with generous whitespace
- **Tablet**: 2-column layout with larger touch targets
- **Mobile**: Single column, full-width buttons for easy thumb access
- Use Tailwind spacing: p-4, p-6, p-8 for consistent padding
- Section spacing: py-8 to py-12 for visual separation
- Card spacing: gap-4 for grids, gap-6 for larger sections

## Component Design Patterns

### Large Action Buttons (Dashboard Quick Actions)
- 120x120px on desktop
- Full-width on mobile with 60px height minimum
- Emoji + clear text label
- Sage Green background for primary, Muted Teal for secondary
- High contrast white text
- Generous padding (p-6)

### Medicine Cards
- Large medicine name (24px, bold)
- Clear purpose statement below name
- Stock indicator with color-coded badge (top-right)
- Primary action button (full-width, Sage Green)
- Secondary actions (smaller, Muted Teal or text links)
- Border: Soft Grey, rounded corners (rounded-lg)
- Padding: p-6

### Symptom Selection Buttons
- Grid layout: 3 columns desktop, 2 columns tablet, 1 column mobile
- Large emoji icon (32px)
- Clear symptom label
- Light Beige background, Deep Charcoal text
- Soft Grey border
- Hover/active state: Sage Green background with white text
- Padding: p-4, gap-4 between buttons

### Quick Access Panel
- Fixed section on dashboard (always visible above fold)
- Grid of 4-6 most relevant medicines
- Stock status badges on each card
- One-click consumption buttons
- Background: White with subtle Light Beige border

### Low Stock Alerts
- Prominent banner at top of relevant pages
- Soft Coral background for warnings
- Emergency Red background for out-of-stock
- Clear icon indicators
- Action buttons for restocking

### Navigation (Desktop)
- Sidebar navigation with clear icons + labels
- Current page highlighted with Sage Green
- Hover states: Light Beige background

### Navigation (Mobile)
- Bottom navigation bar (fixed)
- 4-5 primary navigation items
- Large touch targets (minimum 44px height)
- Active state: Sage Green with white icon

## Page Layouts

### Login Page
- Centered form on Light Beige background
- Simple username/password fields
- Large "Remember me" checkbox
- Full-width Sage Green login button

### Dashboard
**Above Fold**:
- Three large quick action buttons in a row
- "Not feeling well?" heading (28px)
- Recent activity feed (last 3 items)

**Middle Section**:
- Quick Access Medicines grid (2x3 on desktop)
- Recently Used list (chronological)

**Bottom Section**:
- All Medicines by category (expandable/collapsible)
- Add New Medicine button (Muted Teal)

### Symptom Selection (/symptoms)
- Large heading: "How are you feeling today?" (28px)
- 3x3 grid of common symptom buttons
- "Your Recent Symptoms" section (horizontal scroll on mobile)
- Results page: Priority-sorted medicine cards with immediate action buttons

### Medicine Detail Page
- Large medicine name (32px heading)
- Purpose and dosage prominently displayed
- Stock indicator (large badge, color-coded)
- Giant "TAKE 1 DOSE NOW" button (Sage Green, full-width on mobile)
- Recent usage timeline
- Edit/delete actions (smaller, bottom of page)

### Out-of-Stock Shopping List
- Organized by category (matching store aisles)
- Checkable list items
- "MARK ALL BOUGHT" button (Sage Green)
- "PRINT LIST" option (Muted Teal)

## Interaction Patterns
- **One-Click Consumption**: Immediate feedback with button state change ("✓ TAKEN")
- **No Confirmation Dialogs**: Undo option via toast notification instead
- **Instant Visual Feedback**: Stock numbers update immediately
- **Toast Notifications**: Light Beige background, Deep Charcoal text, 3-second display
- **Loading States**: Sage Green spinner, minimal delay

## Images
No hero images or decorative imagery. This is a utility-first application focused on clarity and speed. All visual communication through:
- Large emoji icons for symptoms and quick actions
- Color-coded status indicators
- Clear typography hierarchy

## Accessibility
- High contrast text (Deep Charcoal on Light Beige)
- Large touch targets (minimum 44px)
- Clear focus states (Sage Green outline)
- Screen reader friendly labels
- Keyboard navigation support

## Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+