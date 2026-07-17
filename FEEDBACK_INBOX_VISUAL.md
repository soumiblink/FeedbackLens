# Feedback Inbox - Visual Layout

## Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Inbox Icon] Feedback Inbox                                    │
│  View and filter individual feedback records across all batches.│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FILTERS & SORTING (Glass Panel)                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │ [Filter] Sentiment │ [Filter] Type     │ [Sort] Sort By    │  │
│  │ ▼ All Sentiments│ │ ▼ All Types     │ │ ▼ Newest First  │  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Showing 12 items

┌─────────────────────────────────────────────────────────────────┐
│  FEEDBACK ITEM CARD                                             │
│  ┌────────────────────────────────────────────┬──────────────┐ │
│  │ [Positive 95%] [🔴 Complaint] [Batch #2]   │   Priority   │ │
│  │                                            │     8.5      │ │
│  │ "The checkout process is broken and I      │     /10      │ │
│  │  can't complete my purchase. This is       │              │ │
│  │  really frustrating."                      │              │ │
│  │                                            │              │ │
│  │ Topics: [checkout] [bugs] [payment]        │              │ │
│  └────────────────────────────────────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FEEDBACK ITEM CARD                                             │
│  ┌────────────────────────────────────────────┬──────────────┐ │
│  │ [Negative 88%] [✨ Feature Request] [Batch #2] Priority   │ │
│  │                                            │     5.2      │ │
│  │ "Please add dark mode feature to the app.  │     /10      │ │
│  │  It would really help with late night      │              │ │
│  │  usage."                                   │              │ │
│  │                                            │              │ │
│  │ Topics: [dark mode] [UI] [accessibility]   │              │ │
│  └────────────────────────────────────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FEEDBACK ITEM CARD                                             │
│  ┌────────────────────────────────────────────┬──────────────┐ │
│  │ [Positive 92%] [Batch #1]                  │   Priority   │ │
│  │                                            │     2.1      │ │
│  │ "Love the new features! Everything works   │     /10      │ │
│  │  perfectly and the interface is beautiful."│              │ │
│  │                                            │              │ │
│  │ Topics: [UI] [features] [performance]      │              │ │
│  └────────────────────────────────────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Color Legend

### Sentiment Badges
```
┌──────────────────────┐
│ [Positive 95%]       │  ← Green (Emerald)
│ [Neutral 72%]        │  ← Gray (Slate)
│ [Negative 88%]       │  ← Red (Rose)
└──────────────────────┘
```

### Special Badges
```
┌──────────────────────┐
│ [🔴 Complaint]       │  ← Red background, AlertCircle icon
│ [✨ Feature Request] │  ← Indigo background, Sparkles icon
│ [Batch #2]           │  ← Gray background
└──────────────────────┘
```

### Topic Tags
```
┌──────────────────────┐
│ [checkout] [bugs]    │  ← Light indigo background
└──────────────────────┘
```

### Priority Scores
```
┌──────────────────────┐
│     8.5              │  ← RED (High: 7-10)
│     5.2              │  ← YELLOW (Medium: 4-6.9)
│     2.1              │  ← GREEN (Low: 0-3.9)
└──────────────────────┘
```

## Empty State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [Large Inbox Icon]                       │
│                                                                 │
│                     No Feedback Found                           │
│                                                                 │
│              Upload feedback batches to see them here.          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Loading State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                        [Spinning Loader]                        │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Error State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     [Alert Circle Icon]                         │
│                                                                 │
│                 Error Loading Feedback                          │
│                                                                 │
│            Failed to load feedback from the server.             │
│                                                                 │
│                    [Try Again Button]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Layout (<768px)

```
┌────────────────────────┐
│ [☰] FeedbackLens       │  ← Mobile header
└────────────────────────┘

┌────────────────────────┐
│ Feedback Inbox         │
└────────────────────────┘

┌────────────────────────┐
│ FILTERS (Stacked)      │
│ ┌────────────────────┐ │
│ │ Sentiment          │ │
│ │ ▼ All Sentiments   │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ Type               │ │
│ │ ▼ All Types        │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ Sort By            │ │
│ │ ▼ Newest First     │ │
│ └────────────────────┘ │
└────────────────────────┘

┌────────────────────────┐
│ FEEDBACK CARD          │
│ [Positive 95%]         │
│ [Complaint] [Batch #2] │
│                        │
│ "Feedback text..."     │
│                        │
│ Topics: [checkout]     │
│                        │
│ Priority: 8.5/10       │
└────────────────────────┘
```

## Filter Dropdown Examples

### Sentiment Filter (Open)
```
┌─────────────────────┐
│ Sentiment      [▼]  │
├─────────────────────┤
│ ✓ All Sentiments    │
│   Positive          │
│   Neutral           │
│   Negative          │
└─────────────────────┘
```

### Type Filter (Open)
```
┌─────────────────────┐
│ Type           [▼]  │
├─────────────────────┤
│ ✓ All Types         │
│   Complaints        │
│   Feature Requests  │
└─────────────────────┘
```

### Sort Filter (Open)
```
┌─────────────────────┐
│ Sort By        [▼]  │
├─────────────────────┤
│ ✓ Newest First      │
│   Highest Priority  │
└─────────────────────┘
```

## Sidebar Navigation (Updated)

```
┌──────────────────────────┐
│  FeedbackLens            │
│  AI-Powered Product      │
│  Feedback Intelligence   │
├──────────────────────────┤
│                          │
│  [📊] Dashboard          │
│  [📤] Upload Feedback    │
│  [📥] Feedback Inbox ← NEW
│  [🧠] Hindsight Memory   │
│  [⚡] cascadeflow Runtime│
│  [📄] Executive Reports  │
│                          │
├──────────────────────────┤
│  System Status           │
│  All AI modules online.  │
└──────────────────────────┘
```

## Interaction Flow

```
User Journey:
1. Upload feedback → Upload page
2. Click "Feedback Inbox" in sidebar
3. See all feedback items
4. Select "Negative" sentiment filter
   → API call: GET /api/feedback?sentiment=negative
   → Results update
5. Select "Complaints" type filter
   → API call: GET /api/feedback?sentiment=negative&type=complaint
   → Results update further
6. Change sort to "Highest Priority"
   → Frontend re-sorts items by priority_score
   → No API call needed
7. Click individual item
   → View full details in card format
```

## Responsive Breakpoints

```
Mobile (<768px):
- Sidebar hidden (hamburger menu)
- Filters stack vertically
- Cards full width
- Priority below content

Tablet (768px - 1024px):
- Sidebar visible
- Filters in 3 columns
- Cards full width
- Priority on right

Desktop (>1024px):
- Sidebar visible
- Filters in 3 columns
- Cards max-width with margin
- Priority on right
- Hover effects active
```

## Animation Sequence

```
Page Load:
1. Loading spinner (0s)
2. Data fetches (0-2s)
3. Items fade in staggered:
   - Item 1: 0ms delay
   - Item 2: 50ms delay
   - Item 3: 100ms delay
   - Item 4: 150ms delay
   ...

Filter Change:
1. Loading spinner (0s)
2. New data fetches (0-1s)
3. Items fade in staggered (same pattern)

Sort Change:
1. Items re-order with smooth transition
2. No loading state (instant)
```

## Key Design Elements

1. **Glass Panel Effect**: Translucent dark surface with backdrop blur
2. **Gradient Text**: Indigo to cyan gradient on headers
3. **Rounded Corners**: 8-12px border radius throughout
4. **Shadows**: Subtle shadows on cards and panels
5. **Hover States**: Slight brightness increase on interactive elements
6. **Focus States**: Indigo ring on form inputs
7. **Animations**: Smooth 200-300ms transitions
8. **Icons**: Lucide React icons throughout

This visual guide shows exactly how the Feedback Inbox appears and behaves in the FeedbackLens application.
