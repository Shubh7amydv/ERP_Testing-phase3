# Module 12: Events & Calendar - UI/UX Flow

## Screens

### 1. School Calendar
```
┌──────────────────────────────────────────────┐
│  📅 School Calendar                          │
│  ──────────────────────────────────────────  │
│  ◄ June 2025 ►   [Today] [Month] [Week]     │
│  ──────────────────────────────────────────  │
│  [+ Add Event]                               │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Mo   Tu   We   Th   Fr   Sa   Su      │  │
│  │                          1     2       │  │
│  │  3    4    5    6    7    8    9       │  │
│  │ 10   11   12   13   14   15   16      │  │
│  │ 17   18   19   20   21   22   23      │  │
│  │ 24  [25]  26   27   28   29   30      │  │
│  │                                        │  │
│  │ [25] = Today                           │  │
│  │ 🔴 = Holiday  🟡 = Exam  🔵 = Event   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Today's Events (25 Jun):                    │
│  • 🔵 Sports Day Practice (2:00 PM - 4:00 PM)│
│  • 🟡 Unit Test (9:00 AM - 12:00 PM)        │
└──────────────────────────────────────────────┘
```

### 2. Event List
```
┌──────────────────────────────────────────────┐
│  Events                     [+ Create Event] │
│  ──────────────────────────────────────────  │
│  [Type ▼] [Date Range] [Audience ▼]          │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Event          │ Date     │ Type │Aud. │  │
│  ├────────────────────────────────────────┤  │
│  │ Sports Day     │ 15 Jul   │ Sports│All │  │
│  │ Parent Meeting │ 20 Jul   │Meeting│Parents││
│  │ Annual Day     │ 15 Aug   │ Cultural│All│  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Event Detail Modal:                         │
│  ┌────────────────────────────────────────┐  │
│  │ 🏆 Sports Day 2025                     │  │
│  │ Type: Sports | Audience: All           │  │
│  │ Date: 15 Jul 2025, 9:00 AM - 5:00 PM  │  │
│  │ Location: School Ground                │  │
│  │                                        │  │
│  │ Description: Annual sports day...      │  │
│  │                                        │  │
│  │ ☑ Holiday                              │  │
│  │                                        │  │
│  │ [Edit] [Delete] [Send Reminder]        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 3. Create Event
```
┌──────────────────────────────────────────────┐
│  Create Event                                │
│  ──────────────────────────────────────────  │
│                                              │
│  Title:    [                        ]        │
│  Type:     [Sports ▼]                        │
│  Description: [                        ]     │
│             [                        ]       │
│  ──────────────────────────────────────────  │
│  Start: [2025-07-15] [09:00 AM]              │
│  End:   [2025-07-15] [05:00 PM]              │
│  Location: [School Ground          ]         │
│  ──────────────────────────────────────────  │
│  Target: ○ All  ○ Teachers  ○ Students       │
│          ○ Parents                           │
│  ☑ Mark as Holiday                           │
│  ──────────────────────────────────────────  │
│  [  Create Event  ]                          │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Events List | `GET /events/` |
| Create Event | `POST /events/` |
| Update Event | `PUT /events/{id}/` |
| Delete Event | `DELETE /events/{id}/` |
| Today's Events | `GET /events/today/` |
| This Week | `GET /events/this-week/` |
| Event Types | `GET /event-types/` |
| Calendar | `GET /school-calendars/` |
| Publish Calendar | `POST /school-calendars/{id}/publish/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `SchoolCalendar` | Calendar | Monthly calendar view |
| `EventList` | Page | Event management |
| `EventForm` | Modal | Create/edit event |
| `EventDetail` | Modal | Event info + actions |
| `EventCard` | Card | Event summary card |
| `CalendarPublish` | Page | Publish annual calendar |
