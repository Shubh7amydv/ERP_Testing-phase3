# Module 9: Communication & Notifications - UI/UX Flow

## Screens

### 1. Notifications Center
```
┌──────────────────────────────────────────────┐
│  Notifications                    [Mark All ✅]│
│  ──────────────────────────────────────────  │
│  [All] [Unread] [Urgent] [Info]              │
│  ──────────────────────────────────────────  │
│                                              │
│  🔴 Fee reminder: 5 students have pending    │
│     dues > 30 days                    2 min  │
│  🔴 Leave approved: Rajesh Kumar's leave     │
│     has been approved                  1 hr   │
│  🟡 Exam schedule published: Mid Term 2025   │
│     schedule is now available          3 hr   │
│  🟢 New circular: Sports Day announcement    │
│     published by Principal            1 day  │
└──────────────────────────────────────────────┘
```

### 2. Send Notification
```
┌──────────────────────────────────────────────┐
│  Send Notification                           │
│  ──────────────────────────────────────────  │
│                                              │
│  Title:     [                        ]       │
│  Type:      ○ Info  ○ Warning  ○ Urgent      │
│  Message:   [                        ]       │
│             [                        ]       │
│             [                        ]       │
│  ──────────────────────────────────────────  │
│  Target Audience:                            │
│  ○ All  ○ Teachers  ○ Parents  ○ Students   │
│  ○ Specific (select users)                   │
│                                              │
│  Channel:                                    │
│  ☑ In-App  ☐ SMS  ☐ Email                   │
│                                              │
│  [  Send Notification  ]                     │
└──────────────────────────────────────────────┘
```

### 3. Circular Management
```
┌──────────────────────────────────────────────┐
│  Circulars                 [+ Create Circular]│
│  ──────────────────────────────────────────  │
│  [Status ▼] [Audience ▼]                     │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Title           │ Audience │ Status    │  │
│  ├────────────────────────────────────────┤  │
│  │ Sports Day 2025 │ All      │ Published │  │
│  │ Holiday Notice   │ All      │ Published │  │
│  │ Staff Meeting    │ Teachers │ Draft     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Create Circular Modal:                      │
│  ┌────────────────────────────────────────┐  │
│  │ Title: [Sports Day Announcement   ]    │  │
│  │ Content: [                         ]   │  │
│  │          [                         ]   │  │
│  │ Target: [All ▼]                        │  │
│  │ Attachment: [📎 Upload]                │  │
│  │                                        │  │
│  │ [Save Draft] [Publish 🚀]             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 4. SMS/Email Logs
```
┌──────────────────────────────────────────────┐
│  Communication Logs                          │
│  ──────────────────────────────────────────  │
│  [SMS] [Email]                               │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ To         │ Message     │ Status │Date│  │
│  ├────────────────────────────────────────┤  │
│  │ +91-987..  │ Fee due...  │ Sent   │Today│ │
│  │ +91-987..  │ Leave app.. │ Sent   │Yest│ │
│  │ user@..    │ Circular... │ Failed │2d  │ │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Resend Failed] [Export Log]                │
└──────────────────────────────────────────────┘
```

### 5. Parent Communication
```
┌──────────────────────────────────────────────┐
│  Parent Communication                        │
│  ──────────────────────────────────────────  │
│  [+ Send to Parent]                          │
│  ──────────────────────────────────────────  │
│  Student: [Aarav Kumar ▼]                    │
│  ──────────────────────────────────────────  │
│                                              │
│  History with Aarav Kumar's parents:         │
│  ┌────────────────────────────────────────┐  │
│  │ Date     │ Subject    │ Channel │ Read │  │
│  ├────────────────────────────────────────┤  │
│  │ 25 Jun   │ Fee Due    │ SMS     │ Yes  │  │
│  │ 20 Jun   │ Attendance │ Email   │ Yes  │  │
│  │ 15 Jun   │ Exam Result│ App     │ No   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Send New:                                   │
│  Subject: [                        ]         │
│  Message: [                        ]         │
│  Channel: ○ SMS  ○ Email  ○ Both  ○ App     │
│  [  Send  ]                                  │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Notifications | `GET /notifications/` |
| Send Notification | `POST /notifications/` |
| Mark Read | `PUT /notifications/{id}/read/` |
| Mark All Read | `PUT /notifications/read-all/` |
| Unread Count | `GET /notifications/unread-count/` |
| Send SMS | `POST /sms/send/` |
| Bulk SMS | `POST /sms/bulk-send/` |
| Send Email | `POST /email/send/` |
| Circulars | `GET/POST /circulars/` |
| Publish Circular | `POST /circulars/{id}/publish/` |
| Parent Comm | `GET/POST /parent-comm/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `NotificationCenter` | Page | Notification inbox |
| `NotificationBell` | Icon | Header bell with count badge |
| `SendNotificationForm` | Form | Compose notification |
| `CircularList` | Page | Circular management |
| `CircularForm` | Modal | Create/edit circular |
| `SMSLog` | Page | SMS history |
| `EmailLog` | Page | Email history |
| `ParentCommHistory` | Page | Per-student communication log |
