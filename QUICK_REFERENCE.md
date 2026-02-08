# Quick Reference - AI Recommendation Integration

## 🚀 Quick Start

### Import the Component
```tsx
import RecommendedVolunteers from '../components/RecommendedVolunteers';
```

### Use It (Simplest Form)
```tsx
<RecommendedVolunteers displayMode="carousel" />
```

### Full Example
```tsx
<RecommendedVolunteers 
  displayMode="carousel"    // 'carousel' | 'cards' | 'list'
  maxDisplay={4}            // Number of recommendations to show
  userId={currentUser.id}   // User ID (default: 1)
/>
```

---

## 📊 Display Modes at a Glance

### Carousel ✨
```tsx
<RecommendedVolunteers displayMode="carousel" />
// → Large featured display with swipeable navigation
// → Best for: Homepage hero section
// → Engagement: ⭐⭐⭐⭐⭐
```

### Cards 📋
```tsx
<RecommendedVolunteers displayMode="cards" maxDisplay={6} />
// → Grid gallery of recommendation cards
// → Best for: Dedicated recommendations page
// → Mobile friendly: ✅
```

### List 📝
```tsx
<RecommendedVolunteers displayMode="list" maxDisplay={5} />
// → Compact list view
// → Best for: Sidebars, quick scanning
// → Data density: High
```

---

## 🎨 Advanced Displays

### Timeline (Journey View)
```tsx
import { TimelineRecommendations } from '../components/AdvancedRecommendationDisplays';

<TimelineRecommendations maxDisplay={3} />
// Shows matching progression with detailed criteria breakdown
```

### Radar (Data Visualization)
```tsx
import { RadarChartRecommendations } from '../components/AdvancedRecommendationDisplays';

<RadarChartRecommendations maxDisplay={2} />
// Polygonal charts showing match dimensions
```

### Gamified (Engagement)
```tsx
import { GamifiedRecommendations } from '../components/AdvancedRecommendationDisplays';

<GamifiedRecommendations maxDisplay={4} />
// Badges, favorites, scores - fun & engaging
```

### Matrix (Analytics)
```tsx
import { ComparisonMatrixRecommendations } from '../components/AdvancedRecommendationDisplays';

<ComparisonMatrixRecommendations maxDisplay={5} />
// Heatmap comparison table for detailed analysis
```

---

## 🎯 Common Use Cases

### Homepage Feature Section
```tsx
<div className="mt-12">
  <h2 className="text-3xl font-bold mb-6">Volunteer Matches For You</h2>
  <RecommendedVolunteers displayMode="carousel" maxDisplay={4} />
</div>
```

### Sidebar Widget
```tsx
<aside className="bg-white rounded-lg p-4">
  <h3 className="font-bold mb-4">Recommended For You</h3>
  <RecommendedVolunteers displayMode="list" maxDisplay={5} />
</aside>
```

### Dedicated Page
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <RecommendedVolunteers displayMode="cards" maxDisplay={12} />
</div>
```

### Admin Analytics
```tsx
<div className="p-6 bg-gray-50 rounded-lg">
  <h2 className="font-bold mb-4">Recommendation Analytics</h2>
  <ComparisonMatrixRecommendations maxDisplay={10} />
</div>
```

---

## 🔧 Configuration Presets

### High Engagement (Homepage)
```tsx
<RecommendedVolunteers 
  displayMode="carousel"
  maxDisplay={4}
/>
```

### Maximum Discovery (Explore Page)
```tsx
<RecommendedVolunteers 
  displayMode="cards"
  maxDisplay={12}
/>
```

### Mobile Optimized
```tsx
<RecommendedVolunteers 
  displayMode="list"
  maxDisplay={3}
/>
```

### Data-Driven Analysis
```tsx
<ComparisonMatrixRecommendations maxDisplay={20} />
```

---

## 📱 Responsive Behavior

| Screen Size | Recommended Mode | Props |
|-------------|------------------|-------|
| Mobile <640px | Carousel or List | `maxDisplay={3}` |
| Tablet 640-1024px | Cards or Timeline | `maxDisplay={6}` |
| Desktop >1024px | Any mode | `maxDisplay={8+}` |

---

## ⚙️ Data Flow

```
RecommendedVolunteers Component
    ↓
getUserRecommendations(userId)
    ↓
Analytics Engine
    ├── Build User Profile
    ├── Find Cultural Matches
    ├── Calculate Match Scores
    └── Apply Weighting Algorithm
    ↓
Return UserRecommendation[]
    ↓
Format & Display
```

---

## 📊 Match Score Interpretation

```
90-100% → 🔥 Perfect Match    (Highest compatibility)
80-89%  → ⭐ Great Match       (Very good fit)
70-79%  → 💚 Good Match        (Solid connection)
60-69%  → 👍 Nice Match        (Good opportunity)
40-59%  → 📌 Possible Match    (Worth exploring)
<40%    → Hidden              (Below minimum threshold)
```

---

## 🎨 Styling & Customization

Components use Tailwind CSS and inherit from your theme:

```tsx
// Colors: Uses brand color from your constants
// Dark mode: Fully supported with 'dark:' classes
// Responsive: Mobile-first design
// Animations: Smooth 300ms transitions
```

To customize colors, edit the component's Tailwind classes:
```tsx
// From component file
className="bg-brand text-white"  // Uses your brand color
className="dark:bg-slate-800"    // Dark mode support
```

---

## 🚨 Common Issues & Solutions

### "Recommendations not loading"
- Check user ID is provided: `userId={currentUser.id}`
- Verify API key in environment
- Check browser console for errors

### "Match scores seem low"
- Algorithm uses 4 matching criteria
- Minimum score is 40% by default
- Adjust via config if needed

### "Component is slow"
- Results are cached for 24 hours
- Use `maxDisplay` to limit items
- Consider lazy loading images

### "Dark mode isn't working"
- Components auto-detect dark mode
- Ensure Tailwind dark mode is enabled
- Check parent container has `dark` class when needed

---

## 🔌 Props Reference

```typescript
interface RecommendedVolunteersProps {
  userId?: number;                    // Default: 1
  displayMode?: 'carousel' | 'cards' | 'list';  // Default: 'cards'
  maxDisplay?: number;                // Default: 4
}
```

---

## 📈 Performance Tips

1. **Limit Results**: Use `maxDisplay={4}` instead of 20
2. **Cache Aggressively**: Results cached for 24 hours
3. **Lazy Load**: Images load with `loading="lazy"`
4. **Pagination**: For large result sets, paginate
5. **Debounce**: Filter/sort operations debounced

---

## 🎓 Learning Path

1. **Start**: Use carousel mode on homepage
2. **Explore**: Try cards mode on dedicated page
3. **Engage**: Implement gamified mode for interaction
4. **Analyze**: Use matrix for admin dashboard
5. **Optimize**: A/B test different modes

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `components/RecommendedVolunteers.tsx` | Main component (3 modes) |
| `components/AdvancedRecommendationDisplays.tsx` | 4 advanced display modes |
| `analytics/recommendationEngine.ts` | Matching algorithm |
| `analytics/culturalMatcher.ts` | Cultural similarity logic |
| `pages/Home.tsx` | Homepage with integration |
| `pages/RecommendationDemoPage.tsx` | Interactive demo of all modes |
| `RECOMMENDATION_DISPLAY_GUIDE.md` | Full documentation |
| `AI_RECOMMENDATION_IMPLEMENTATION.md` | Technical details |

---

## 🎯 Next Steps

1. ✅ View recommendations on homepage
2. Add recommendations to volunteers page
3. Create dedicated recommendations page
4. Implement gamified mode for engagement
5. Set up analytics tracking
6. A/B test different display modes

---

## 💡 Pro Tips

- Use **Carousel** on homepage for maximum impact
- Use **Gamified** when you want to boost engagement
- Use **Timeline** when explaining the algorithm
- Use **Matrix** for admin/data analysis
- Combine modes across different pages for variety
- Test all modes on mobile devices
- Monitor user engagement metrics

---

## 🔗 Quick Links

- **Full Guide**: `RECOMMENDATION_DISPLAY_GUIDE.md`
- **Implementation Details**: `AI_RECOMMENDATION_IMPLEMENTATION.md`
- **Demo Page**: `/recommendation-demo` route
- **Live on Homepage**: Already integrated! ✅

---

**Remember**: All components are production-ready and fully integrated. Start using them today!
