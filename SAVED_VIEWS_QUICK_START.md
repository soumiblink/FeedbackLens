# Saved Views - Quick Start Guide

## What is Saved Views?

Saved Views is a **productivity feature** that lets Product Managers bookmark commonly used filter combinations in the Feedback Inbox. Instead of repeatedly setting the same filters, you can save them once and access them with a single click.

## Why Use Saved Views?

**Before Saved Views:**
1. Go to Feedback Inbox
2. Select sentiment filter
3. Select type filter
4. Select segment filter
5. Review results
6. *Next day: repeat steps 1-4 for the same investigation*

**With Saved Views:**
1. Set up filters once
2. Save with a descriptive name
3. *Next time: click "Open View" - done!*

## How to Use

### Saving Your First View

1. Navigate to **Feedback Inbox** (`/feedback`)

2. Apply filters you use frequently:
   - Example: Sentiment = "Negative", Type = "Complaints"

3. Click **"Save Current Filters"** button (appears in header)

4. Enter a descriptive name:
   - Good names: "High Priority Complaints", "Enterprise Negative Feedback", "Feature Requests This Week"
   - Bad names: "View 1", "Test", "Filters"

5. Click **"Save View"** (or press Enter)

6. Done! Your view is saved.

### Using a Saved View

1. Navigate to **Saved Views** (`/saved-views`)

2. You'll see cards for each saved view showing:
   - View name
   - Created date
   - Active filters (with color-coded badges)
   - Filter count

3. Click **"Open View"** on any card

4. You're taken to Feedback Inbox with filters automatically applied!

### Deleting a View

1. Go to **Saved Views**
2. Click the **trash icon** on any view card
3. Confirm deletion
4. View is removed

## Example Use Cases

### For Product Managers

**"Weekly Complaints Review"**
- Sentiment: Negative
- Type: Complaints
- *Use case: Every Monday morning, quickly review all complaints*

**"Enterprise Feedback"**
- Customer Segment: Enterprise
- *Use case: Preparing for quarterly business reviews with enterprise customers*

**"High Priority Issues"**
- Priority: High
- Type: Complaints
- *Use case: Daily triage of critical customer issues*

**"Feature Demand Signal"**
- Type: Feature Requests
- Sentiment: Positive or Neutral
- *Use case: Roadmap planning - what customers are asking for*

### For Team Workflows

**"Support Escalations"**
- Sentiment: Negative
- Priority: High
- *Use case: Customer support team checking escalations*

**"Product Improvements"**
- Type: Feature Requests
- Customer Segment: Paid
- *Use case: Understanding what paying customers want*

## Tips & Best Practices

### Naming Your Views

✅ **Good Names** (descriptive and action-oriented):
- "Critical Bug Reports"
- "SMB Feature Requests"
- "Post-Release Sentiment Check"
- "Education Segment Feedback"

❌ **Bad Names** (vague and non-descriptive):
- "View 1"
- "Test"
- "Filters"
- "Feedback"

### When to Save a View

Save a view when you find yourself:
- Applying the same filters repeatedly
- Conducting regular weekly/monthly investigations
- Preparing for recurring meetings or reviews
- Tracking specific customer segments
- Monitoring product health indicators

### How Many Views Should You Have?

**Sweet spot: 3-8 saved views**

Too few (1-2): You're probably not using the feature enough
Just right (3-8): Covers your common investigations without clutter
Too many (15+): Hard to find the right view, consider consolidating

## Access Points

### Navigation
- **Sidebar**: Click "Saved Views" (bookmark icon)
- **Direct URL**: `/saved-views`

### From Feedback Inbox
- Apply filters → Click "Save Current Filters" button in header

## What Gets Saved?

Saved Views stores **filter settings only**:
- ✅ Sentiment filter (positive/negative/neutral)
- ✅ Type filter (complaints/feature requests)
- ✅ Customer segment filter
- ✅ Priority level filter
- ✅ View name
- ✅ Created date

Saved Views **does NOT store**:
- ❌ Feedback data (queries database every time)
- ❌ Sort order
- ❌ Search terms
- ❌ Date ranges
- ❌ Custom queries

## Technical Details

### URL Parameters

When you open a saved view, filters are applied via URL parameters:

```
/feedback?sentiment=negative&type=complaint
```

This means you can:
- **Bookmark** the URL in your browser
- **Share** the URL with team members
- **Deep link** from external tools

### Data Storage

- Stored in SQLite database (same as feedback data)
- Lightweight records (6 fields + metadata)
- No performance impact on Feedback Inbox
- Instant loading and filtering

## Troubleshooting

### "Save Current Filters" button doesn't appear

**Cause**: No filters are active
**Solution**: Apply at least one filter (sentiment or type)

### Saved view shows no results

**Possible causes**:
1. No feedback matches the saved filters
2. Feedback data has been reset
3. All matching feedback was deleted

**Solution**: Check Feedback Inbox without filters to see available data

### Can't delete a saved view

**Possible cause**: JavaScript error or network issue
**Solution**: Refresh page and try again. Check browser console for errors.

## Keyboard Shortcuts

While in Save View dialog:
- **Enter**: Save the view
- **Escape**: Cancel (close dialog)

## Browser Compatibility

Saved Views works in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Privacy & Sharing

- Saved views are **workspace-specific**
- Stored in local database (not cloud)
- Currently **not shareable** between team members
- No analytics or tracking on view usage

## Limitations (By Design)

These are intentionally NOT supported to keep the feature lightweight:

- ❌ Editing saved views (delete and recreate instead)
- ❌ Organizing views into folders
- ❌ Exporting/importing views
- ❌ View templates or suggestions
- ❌ Automated view creation
- ❌ View usage analytics
- ❌ Team sharing or permissions
- ❌ Scheduling or notifications

## Getting Help

If you encounter issues:

1. **Check this guide** - Most questions answered here
2. **Verify filters work** - Test in Feedback Inbox first
3. **Check database** - Ensure feedback data exists
4. **Console logs** - Open browser developer tools for errors
5. **Backend logs** - Check terminal running FeedbackLens backend

## Next Steps

Now that you understand Saved Views:

1. ✅ Go to Feedback Inbox
2. ✅ Apply your most common filters
3. ✅ Save your first view
4. ✅ Try opening it from Saved Views page
5. ✅ Create 2-3 more views for different investigations

Happy investigating! 🔖
