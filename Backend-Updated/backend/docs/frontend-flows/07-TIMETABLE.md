# Module 6: Timetable & Scheduling - UI/UX Flow

## Screens

### 1. Timetable Grid View
```
┌──────────────────────────────────────────────────┐
│  Timetable - Class 10-A                          │
│  ──────────────────────────────────────────────  │
│  Class: [10-A ▼]  Section: [A ▼]  Week: [Current▼]│
│  ──────────────────────────────────────────────  │
│  [+ Add Entry] [Bulk Edit] [Copy to Section]     │
│  ──────────────────────────────────────────────  │
│  ┌───────┬────────┬────────┬────────┬────────┬───┐
│  │ Time  │ Monday │Tuesday │Wednesday│Thursday│Fri│
│  ├───────┼────────┼────────┼────────┼────────┼───┤
│  │8:00- │ Math   │Science │ English│  Math  │SST│
│  │8:45  │ Rm 101 │Rm 102  │Rm 101  │Rm 101  │103│
│  ├───────┼────────┼────────┼────────┼────────┼───┤
│  │8:45- │Science │ English│  Math  │Science │Eng│
│  │9:30  │ Rm 102 │Rm 101  │Rm 101  │Rm 102  │101│
│  ├───────┼────────┼────────┼────────┼────────┼───┤
│  │9:30- │──── BREAK ──────┼────────┼────────┼───│
│  │9:45  │        │        │        │        │   │
│  ├───────┼────────┼────────┼────────┼────────┼───┤
│  │9:45- │ English│  Hindi │Science │  Hindi │Math│
│  │10:30 │ Rm 101 │Rm 103  │Rm 102  │Rm 103  │101│
│  ├───────┼────────┼────────┼────────┼────────┼───┤
│  │10:30-│  Hindi │  SST   │  Hindi │ English│SST│
│  │11:15 │ Rm 103 │Rm 104  │Rm 103  │Rm 101  │104│
│  └───────┴────────┴────────┴────────┴────────┴───┘
│                                                  │
│  Legend: 📚 Subject  📍 Room  👨‍🏫 Teacher          │
└──────────────────────────────────────────────────┘
```

### 2. Add/Edit Timetable Entry Modal
```
┌──────────────────────────────────────────┐
│  Add Timetable Entry              [×]   │
│  ──────────────────────────────────────  │
│  Day:      [Monday      ▼]              │
│  Time Slot:[8:00-8:45   ▼]              │
│  Subject:  [Mathematics ▼]              │
│  Teacher:  [Rajesh Sir  ▼]              │
│  Room:     [Room 101     ]              │
│  ──────────────────────────────────────  │
│  ⚠️ Conflict: Rajesh Sir already has     │
│  Class 9-B at this time                  │
│  ──────────────────────────────────────  │
│           [Cancel]  [Save]              │
└──────────────────────────────────────────┘
```

### 3. Teacher's Timetable View
```
┌──────────────────────────────────────────────┐
│  Teacher Timetable - Rajesh Kumar            │
│  ──────────────────────────────────────────  │
│  Teacher: [Rajesh Kumar ▼]                   │
│  ──────────────────────────────────────────  │
│                                              │
│  Weekly Load: 25 periods (5 classes)         │
│                                              │
│  ┌───────┬────────┬────────┬────────┬──────┐ │
│  │ Time  │ Mon    │ Tue    │ Wed    │ Thu  │ │
│  ├───────┼────────┼────────┼────────┼──────┤ │
│  │8:00   │10-A Math│9-A Math│10-A Math│9-B Math│
│  │8:45   │10-B Math│9-B Math│10-B Math│9-A Math│
│  │9:45   │8-A Math │        │8-A Math │      │
│  │10:30  │        │8-B Math│        │8-B Math│
│  └───────┴────────┴────────┴────────┴──────┘ │
│                                              │
│  Free Slots:                                 │
│  • Monday: 9:30-9:45, 11:15-12:00            │
│  • Tuesday: 8:00-8:45, 9:45-10:30            │
└──────────────────────────────────────────────┘
```

### 4. Substitute Teacher Assignment
```
┌──────────────────────────────────────────────┐
│  Substitute Teachers          [+ Assign Sub] │
│  ──────────────────────────────────────────  │
│  Date: [26/06/2025 📅]                       │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Original   │ Substitute  │ Period │Reason│ │
│  ├────────────────────────────────────────┤  │
│  │ Rajesh K.  │ Amit S.    │ 10-A Math│Leave│ │
│  │ Sunita M.  │ Priya R.   │ 9-B Science│Ill│ │
│  └────────────────────────────────────────┘  │
│                                              │
│  Assign Modal:                               │
│  ┌────────────────────────────────────────┐  │
│  │ Original Teacher: [Rajesh Kumar ▼]     │  │
│  │ Date: [26/06/2025]                     │  │
│  │ Period: [10-A Math, 8:00-8:45 ▼]       │  │
│  │ Substitute: [Amit Singh ▼]             │  │
│  │ Reason: [Medical Leave    ]             │  │
│  │                                        │  │
│  │ Available subs at this time:           │  │
│  │ • Amit Singh (Free)                    │  │
│  │ • Priya Rawat (Free)                   │  │
│  │                                        │  │
│  │         [Cancel]  [Assign]             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 5. Room Management
```
┌──────────────────────────────────────────────┐
│  Rooms                       [+ Add Room]    │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Room   │ Building │ Type     │Capacity │  │
│  ├────────────────────────────────────────┤  │
│  │ 101    │ Main     │Classroom │ 40      │  │
│  │ 102    │ Main     │Classroom │ 40      │  │
│  │ Lab 1  │ Science  │Lab       │ 30      │  │
│  │ Comp 1 │ IT       │Lab       │ 30      │  │
│  │ Hall 1 │ Main     │Hall      │ 200     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Utilization:                                │
│  Room 101: 85% (34/40 slots used)           │
│  Room 102: 70% (28/40 slots used)           │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Timetable List | `GET /timetables/` |
| Create Timetable | `POST /timetables/` |
| Get Entries | `GET /timetables/{id}/entries/` |
| Add Entry | `POST /timetables/{id}/entries/` |
| Bulk Add | `POST /timetables/{id}/entries/bulk/` |
| Update Entry | `PUT /timetable-entries/{id}/` |
| Delete Entry | `DELETE /timetable-entries/{id}/` |
| Teacher View | `GET /teacher-timetable/{teacher_id}/` |
| Free Slots | `GET /teacher-timetable/free-slots/{teacher_id}/` |
| Substitutes | `GET/POST /substitutes/` |
| Rooms | `GET/POST /rooms/` |
| Conflicts | `GET /timetable/reports/conflicts/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `TimetableGrid` | Grid | Weekly grid view |
| `TimetableEntryForm` | Modal | Add/edit entry |
| `TeacherTimetable` | Page | Teacher-specific view |
| `SubstituteManager` | Page | Substitute assignment |
| `RoomList` | Page | Room management |
| `ConflictDetector` | Alert | Schedule conflict warnings |
| `TimetableCopy` | Modal | Copy to another section |
