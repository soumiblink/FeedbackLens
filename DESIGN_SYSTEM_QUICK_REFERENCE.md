# FeedbackLens Design System - Quick Reference

## 🎨 Color Palette

### Primary Colors
```
Indigo-500: #6366f1 (Primary actions)
Indigo-600: #4f46e5 (Primary hover)
```

### Semantic Colors
```
Emerald-400: #34d399 (Success, Positive, Low priority)
Amber-400: #fbbf24   (Warning, Medium priority)
Rose-400: #fb7185    (Error, Negative, High priority)
Cyan-400: #22d3ee    (Info, Segments)
Slate-400: #94a3b8   (Neutral, Muted text)
```

### Background Layers
```
Dark-BG: #0f172a      (Page background)
Dark-Surface: #1e293b (Card background)
Dark-Border: #334155  (Border color)
```

### Text Colors
```
White: #f8fafc        (Headings, primary text)
Slate-300: #cbd5e1    (Body text)
Slate-400: #94a3b8    (Captions, meta)
Slate-500: #64748b    (Disabled text)
```

## 📐 Spacing Scale

```
Gap-2:  8px  (Badge groups, icon gaps)
Gap-4:  16px (Form fields)
Gap-6:  24px (Card grids, sections)
Gap-8:  32px (Page sections)

Padding-4: 16px (Compact cards)
Padding-6: 24px (Standard cards)
Padding-8: 32px (Header cards)
```

## 🔘 Button Styles

### Usage
```tsx
import Button from '../components/Button';

<Button variant="primary" size="base">Save</Button>
<Button variant="secondary" icon={<Icon />}>Cancel</Button>
<Button variant="danger" loading={isSaving}>Delete</Button>
```

### Variants
- `primary` - Main actions (indigo)
- `secondary` - Alternative actions (slate)
- `danger` - Destructive actions (rose)
- `outline` - Tertiary actions (transparent with border)
- `ghost` - Minimal actions (transparent)

### Sizes
- `sm` - 36px height
- `base` - 42px height (default)
- `lg` - 48px height

## 🃏 Card Component

### Standard Card
```tsx
<div className="glass-panel p-6">
  {/* Content */}
</div>
```

### Hover Effect
Cards automatically get hover effect (border opacity change)

### Metric Card
```tsx
import MetricCard from '../components/MetricCard';

<MetricCard
  label="Total Feedback"
  value={1250}
  change="+12% vs last week"
  trend="up"
/>
```

## 📝 Typography

### Usage
```tsx
<h1 className="text-4xl font-bold text-white">Page Title</h1>
<h2 className="text-2xl font-bold text-white">Section Title</h2>
<h3 className="text-xl font-semibold text-white">Card Title</h3>
<p className="text-slate-300">Body text</p>
<span className="text-sm text-slate-400">Caption text</span>
```

## 🏷️ Badges

### Sentiment
```tsx
<span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
  Positive
</span>
```

### Priority
```tsx
{/* High */}
<span className="px-3 py-1 rounded-full text-xs font-medium border uppercase bg-rose-500/10 text-rose-400 border-rose-500/20">
  High
</span>

{/* Medium */}
<span className="px-3 py-1 rounded-full text-xs font-medium border uppercase bg-amber-500/10 text-amber-400 border-amber-500/20">
  Medium
</span>

{/* Low */}
<span className="px-3 py-1 rounded-full text-xs font-medium border uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
  Low
</span>
```

## 🚫 Empty States

### Usage
```tsx
import EmptyState from '../components/EmptyState';
import { Package } from 'lucide-react';

<EmptyState
  icon={<Package />}
  title="No data yet"
  description="Get started by uploading your first batch"
  action={{
    label: "Upload Now",
    onClick: () => navigate('/upload'),
    icon: <Upload className="w-5 h-5" />
  }}
/>
```

## ⏳ Loading States

### Full Page Loading
```tsx
import LoadingSpinner from '../components/LoadingSpinner';

{loading && <LoadingSpinner />}
```

### Button Loading
```tsx
<Button loading={isSaving}>Save Changes</Button>
```

## 📄 Page Structure

### Standard Page
```tsx
import PageHeader from '../components/PageHeader';
import { Icon } from 'lucide-react';

<div className="space-y-6">
  <PageHeader
    icon={<Icon />}
    title="Page Title"
    description="Page description here"
    action={<Button>Action</Button>}
  />
  
  {/* Page content */}
  <div className="glass-panel p-6">
    {/* Content */}
  </div>
</div>
```

## 🎭 Animations

### Fade In (Framer Motion)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

### Stagger Children
```tsx
{items.map((item, idx) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
  >
    {/* Content */}
  </motion.div>
))}
```

## 📱 Responsive Grid

### 2 Columns
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Cards */}
</div>
```

### 3 Columns
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### 4 Columns
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

## 🔍 Focus States

Focus states are automatic via CSS:
```css
*:focus-visible {
  outline: none;
  ring: 2px ring-indigo-500;
  ring-offset: 2px ring-offset-dark-bg;
}
```

## ✅ Quick Checklist

When creating a new page:

- [ ] Use `PageHeader` component
- [ ] Apply `glass-panel` to cards
- [ ] Use `Button` component (not inline styles)
- [ ] Implement `EmptyState` for no data
- [ ] Implement `LoadingSpinner` for loading
- [ ] Use consistent spacing (`space-y-6`)
- [ ] Add Framer Motion animations
- [ ] Test on mobile/tablet/desktop
- [ ] Verify keyboard navigation
- [ ] Check color contrast

## 🚀 Common Patterns

### Filter Section
```tsx
<div className="glass-panel p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="text-sm font-medium text-slate-400 mb-2 block">
        Filter Label
      </label>
      <select className="w-full px-4 py-2.5 bg-dark-bg border border-slate-700 rounded-lg text-white">
        <option>Option 1</option>
      </select>
    </div>
  </div>
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard label="Metric 1" value="1,234" />
  <MetricCard label="Metric 2" value="5,678" />
  <MetricCard label="Metric 3" value="91%" />
  <MetricCard label="Metric 4" value="+12%" trend="up" />
</div>
```

### Modal Dialog
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  onClick={() => setShowDialog(false)}
>
  <motion.div
    initial={{ scale: 0.95 }}
    animate={{ scale: 1 }}
    className="glass-panel p-6 max-w-2xl w-full"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Dialog content */}
  </motion.div>
</motion.div>
```

## 📚 Component Import Paths

```tsx
// Components
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';

// Icons
import { Icon } from 'lucide-react';

// Animation
import { motion } from 'framer-motion';

// Navigation
import { useNavigate } from 'react-router-dom';

// API
import { apiFunction } from '../services/api';
```

---

**Need help?** Check `UI_UX_POLISH_SUMMARY.md` for comprehensive documentation.
