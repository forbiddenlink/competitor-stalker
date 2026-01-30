# Historical Tracking Feature Design

**Date:** 2026-01-30
**Status:** Ready for implementation

## Overview

Add automatic and manual snapshot tracking for competitor data, enabling users to see how competitors change over time.

## Approach

**Hybrid model:**
- Auto-snapshot on every competitor edit
- Manual "milestone" snapshots with user-provided labels
- Keep last 50 auto-snapshots per competitor (milestones never pruned)

## Data Model

```typescript
interface Snapshot {
  id: string;
  competitorId: string;
  timestamp: string;        // ISO date
  type: 'auto' | 'milestone';
  label?: string;           // For milestones: "Q1 pricing change"
  data: Competitor;         // Full competitor state at that moment
}
```

**Storage:**
- New localStorage key: `stalker_snapshots`
- Array of snapshots, sorted by timestamp descending
- 50 auto-snapshot limit per competitor

## UI Components

### 1. SnapshotTimeline
Vertical timeline showing all snapshots for a competitor:
```
├─ ★ Jan 15 - "Series B announcement" (milestone)
├─ • Jan 12 - Pricing changed (auto)
├─ • Jan 8 - Features updated (auto)
├─ ★ Dec 1 - "Initial tracking" (milestone)
```
- Stars for milestones, dots for auto-snapshots
- Expandable items showing what changed
- Compare button to diff any two snapshots

### 2. SnapshotDiff
Compare two snapshots with visual highlighting:
- Side-by-side or inline view
- Red = removed, green = added, yellow = changed
- Skip non-meaningful fields (id, timestamps)

### 3. MilestoneForm
Simple form to create labeled milestone:
- Label input (required)
- Optional notes
- Creates snapshot of current state

### 4. History Drawer
Modal/drawer accessed from DossierCard:
- Shows SnapshotTimeline
- "Add Milestone" button
- "Compare" mode for selecting two snapshots
- "Revert" option to restore previous state

## Implementation Phases

### Phase 1: Data Layer
- [ ] Add `Snapshot` type to `src/types/index.ts`
- [ ] Create `src/hooks/useSnapshots.ts` with CRUD operations
- [ ] Add `stalker_snapshots` to `src/constants/index.ts` STORAGE_KEYS
- [ ] Integrate auto-snapshot into `CompetitorContext.updateCompetitor()`

### Phase 2: Core Components
- [ ] Create `src/components/features/history/SnapshotTimeline.tsx`
- [ ] Create `src/components/features/history/SnapshotDiff.tsx`
- [ ] Create `src/components/features/history/MilestoneForm.tsx`
- [ ] Create `src/components/features/history/HistoryDrawer.tsx`

### Phase 3: Integration
- [ ] Add "History" button to `DossierCard.tsx`
- [ ] Wire up HistoryDrawer with competitor data
- [ ] Add toast notifications for actions

### Phase 4: Polish
- [ ] Empty state for no history
- [ ] Export history functionality
- [ ] Tests for useSnapshots hook

## Diffing Logic

Compare snapshots by checking these key fields:
- `name`, `website`, `oneLiner` - basic info
- `threatLevel` - threat assessment
- `positionX`, `positionY` - market positioning
- `features` - feature comparison data
- `pricingModels` - pricing tiers
- `weaknesses` - identified vulnerabilities
- `strategies` - counter-strategies
- `socialHandles` - social presence
- `strengths`, `opportunities`, `threats` - SWOT data

## Future Enhancements

- Compression for older snapshots
- Export/import history separately
- Trend visualization (charts over time)
- Automated change detection alerts
