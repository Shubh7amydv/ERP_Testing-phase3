# Module 14: Parents Portal - UI/UX Flow

## Screens

### 1. Parent Dashboard
```
┌──────────────────────────────────────────────┐
│  👨‍👩‍👧 Parent Portal - Welcome, Rajesh!        │
│  ──────────────────────────────────────────  │
│                                              │
│  Your Children:                              │
│  ┌────────────────────────────────────────┐  │
│  │ 📷 Aarav Kumar  | Class 10-A | Roll 15│  │
│  │    Attendance: 92% | Pending Fee: ₹0   │  │
│  │    [View Profile →]                     │  │
│  │                                        │  │
│  │ 📷 Aanya Kumar  | Class 7-B | Roll 8  │  │
│  │    Attendance: 88% | Pending Fee: ₹2000│ │
│  │    [View Profile →]                     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Recent Notifications:                       │
│  • 🔴 Fee reminder for Aanya                │
│  • 🟡 Sports Day on 15 Jul                  │
│  • 🟢 Circular: Holiday on 26 Jun           │
└──────────────────────────────────────────────┘
```

### 2. Child Profile View
```
┌──────────────────────────────────────────────┐
│ ← Dashboard     Aarav Kumar                  │
│  ──────────────────────────────────────────  │
│  Class 10-A | Roll 15 | ADM-2025-0001       │
│  ──────────────────────────────────────────  │
│                                              │
│  [Overview] [Attendance] [Fees] [Exams]      │
│  [Timetable] [Notifications]                 │
│  ──────────────────────────────────────────  │
│                                              │
│  Overview:                                   │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ 📊 Attendance│  │ 💰 Fees     │           │
│  │ 92% (Good)  │  │ All Clear ✅│           │
│  └─────────────┘  └─────────────┘           │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ 📝 Last Exam │  │ ⏰ Next Class│           │
│  │ Rank: 5/40  │  │ Mathematics │           │
│  └─────────────┘  └─────────────┘           │
│                                              │
│  Today's Timetable:                          │
│  8:00 - Math | 9:00 - Science | 10:00 - Eng │
└──────────────────────────────────────────────┘
```

### 3. Fee Status View
```
┌──────────────────────────────────────────────┐
│  Aarav Kumar - Fee Status                    │
│  ──────────────────────────────────────────  │
│                                              │
│  Total Paid: ₹60,000  |  Pending: ₹0        │
│  ──────────────────────────────────────────  │
│                                              │
│  Payment History:                            │
│  ┌────────────────────────────────────────┐  │
│  │ Receipt   │ Description    │ Amount    │  │
│  ├────────────────────────────────────────┤  │
│  │ REC-001   │ Tuition (Apr)  │ ₹5,000   │  │
│  │ REC-002   │ Tuition (May)  │ ₹5,000   │  │
│  │ REC-003   │ Tuition (Jun)  │ ₹5,000   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Download All Receipts]                     │
└──────────────────────────────────────────────┘
```

### 4. Exam Results View
```
┌──────────────────────────────────────────────┐
│  Aarav Kumar - Exam Results                  │
│  ──────────────────────────────────────────  │
│  Exam: [Mid Term 2025 ▼]                     │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Subject   │ Marks │ Grade │ Remarks    │  │
│  ├────────────────────────────────────────┤  │
│  │ Hindi     │ 85    │ A     │ Excellent  │  │
│  │ Science   │ 78    │ B+    │ Good       │  │
│  │ Math      │ 92    │ A+    │ Outstanding│  │
│  │ English   │ 88    │ A     │ Excellent  │  │
│  │ SST       │ 75    │ B+    │ Good       │  │
│  ├────────────────────────────────────────┤  │
│  │ Total     │ 418/500        │            │  │
│  │ Percentage│ 83.6%          │ Grade: A   │  │
│  │ Rank      │ 5/40           │ PASS       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Download Report Card 📥]                   │
└──────────────────────────────────────────────┘
```

### 5. Feedback / Communication
```
┌──────────────────────────────────────────────┐
│  Feedback & Communication                    │
│  ──────────────────────────────────────────  │
│  [+ Submit Feedback]                         │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Subject          │ Type    │ Status    │  │
│  ├────────────────────────────────────────┤  │
│  │ Library timing   │Suggestion│ Resolved │  │
│  │ Bus route change │ Complaint│ Pending  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Submit Feedback Modal:                      │
│  ┌────────────────────────────────────────┐  │
│  │ Subject:  [                        ]   │  │
│  │ Type:     ○ Suggestion ○ Complaint     │  │
│  │           ○ Praise                     │  │
│  │ Message:  [                        ]   │  │
│  │          [                        ]   │  │
│  │                                        │  │
│  │         [Cancel]  [Submit]             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Parent Dashboard | `GET /parent/dashboard/` |
| Children | `GET /parents/{id}/children/` |
| Attendance | `GET /parent/attendance/` |
| Fees | `GET /parent/fees/` |
| Exams | `GET /parent/exams/` |
| Timetable | `GET /parent/timetable/` |
| Notifications | `GET /parent/notifications/` |
| Submit Feedback | `POST /parent-feedback/` |
| Feedback List | `GET /parent-feedback/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `ParentDashboard` | Page | Children overview |
| `ChildProfile` | Page | Detailed child view |
| `ChildAttendance` | Tab | Attendance history |
| `ChildFees` | Tab | Fee status + receipts |
| `ChildExams` | Tab | Exam results |
| `ChildTimetable` | Tab | Weekly timetable |
| `FeedbackForm` | Modal | Submit feedback |
| `ParentNotifications` | Page | Notifications |
