# Module 7: Library - UI/UX Flow

## Screens

### 1. Library Dashboard
```
┌──────────────────────────────────────────────┐
│  Library Dashboard                           │
│  ──────────────────────────────────────────  │
│                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ 📚 Books    │ │ 📖 Issued   │ │ ⏰ Over│ │
│  │ 2,500       │ │ 180         │ │ 12     │ │
│  └─────────────┘ └─────────────┘ └────────┘ │
│                                              │
│  Recent Issues:                              │
│  ──────────────────────────────────────────  │
│  • Aarav → "Science NCERT" (Due: 09 Jul)     │
│  • Priya → "Mathematics Ref" (Due: 08 Jul)   │
│                                              │
│  ⚠️ Overdue Books:                           │
│  ──────────────────────────────────────────  │
│  • Rahul - "English Grammar" (5 days overdue) │
│  • Sneha - "History Vol 2" (3 days overdue)  │
└──────────────────────────────────────────────┘
```

### 2. Book Catalog
```
┌──────────────────────────────────────────────┐
│  Book Catalog              [+ Add Book]      │
│  ──────────────────────────────────────────  │
│  [Search title/author/ISBN...] [Category ▼]  │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ 📖 │ Title        │ Author  │ Available│ │
│  ├────────────────────────────────────────┤  │
│  │ 📖 │ Science NCERT│ NCERT   │ 5/8     │ │
│  │ 📖 │ Math Ref Book│ R.D. S. │ 3/5     │ │
│  │ 📖 │ English Gram │ Wren&M. │ 0/4 ⚠️  │ │
│  └────────────────────────────────────────┘  │
│  Showing 1-20 of 500                         │
│                                              │
│  Book Detail Modal:                          │
│  ┌────────────────────────────────────────┐  │
│  │ 📖 Science NCERT Class 10              │  │
│  │ Author: NCERT                          │  │
│  │ ISBN: 978-81-7450-XXX                  │  │
│  │ Category: Textbook                     │  │
│  │ Copies: 8 (5 available, 3 issued)      │  │
│  │ Location: Shelf A-3                    │  │
│  │ Price: ₹150                            │  │
│  │                                        │  │
│  │ [Issue Book] [Reserve] [Edit]          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 3. Issue Book Flow
```
┌──────────────────────────────────────────────┐
│  Issue Book                                  │
│  ──────────────────────────────────────────  │
│                                              │
│  Step 1: Select Member                       │
│  [Search student/staff name or ID...]        │
│  → Aarav Kumar (Student, Class 10-A)         │
│     Books issued: 1/3                        │
│                                              │
│  Step 2: Select Book                         │
│  [Search book title or ISBN...]              │
│  → Science NCERT (Available: 5)              │
│                                              │
│  Step 3: Issue Details                       │
│  Issue Date: [25/06/2025]                    │
│  Due Date:   [09/07/2025] (14 days)          │
│  Remarks:    [            ]                  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Issue Summary:                         │  │
│  │ Book: Science NCERT                    │  │
│  │ Member: Aarav Kumar                    │  │
│  │ Issue: 25 Jun → Due: 09 Jul            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [  Issue Book  ]                            │
└──────────────────────────────────────────────┘
```

### 4. Return Book Flow
```
┌──────────────────────────────────────────────┐
│  Return Book                                 │
│  ──────────────────────────────────────────  │
│                                              │
│  [Search by book ID or member name...]       │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Active Issues:                         │  │
│  │ ☐ Science NCERT (Due: 09 Jul) - OK    │  │
│  │ ☑ English Grammar (Due: 20 Jun) - OVERDUE│ │
│  │                                        │  │
│  │ Return Date: [25/06/2025]              │  │
│  │ Fine: ₹50 (5 days × ₹10/day)          │  │
│  │ Fine Paid: ☐ Yes                       │  │
│  │                                        │  │
│  │ [  Process Return  ]                   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 5. Overdue Books
```
┌──────────────────────────────────────────────┐
│  Overdue Books                               │
│  ──────────────────────────────────────────  │
│  ┌────────────────────────────────────────┐  │
│  │ Book          │ Member  │ Due    │Days │  │
│  ├────────────────────────────────────────┤  │
│  │ English Gram  │ Rahul   │20 Jun  │5    │  │
│  │ History Vol 2 │ Sneha   │22 Jun  │3    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Total Fine: ₹80                             │
│                                              │
│  [Send Reminders] [Export] [Print List]      │
└──────────────────────────────────────────────┘
```

---

## API Integration Points

| Screen | API Calls |
|--------|-----------|
| Book List | `GET /books/` |
| Add Book | `POST /books/` |
| Issue Book | `POST /book-issues/` |
| Return Book | `POST /book-issues/{id}/return/` |
| Active Issues | `GET /book-issues/active/` |
| Overdue | `GET /book-issues/overdue/` |
| Reserve | `POST /book-reservations/` |
| Members | `GET /library-members/` |
| Member History | `GET /library-members/{id}/history/` |
| Popular Books | `GET /library/reports/popular-books/` |

---

## Key Components

| Component | Type | Description |
|-----------|------|-------------|
| `LibraryDashboard` | Page | Stats + recent activity |
| `BookCatalog` | Page | Book search + list |
| `BookForm` | Modal | Add/edit book |
| `IssueBook` | Page | Issue workflow |
| `ReturnBook` | Page | Return workflow |
| `OverdueList` | Page | Overdue books |
| `BookReservation` | Page | Reservation management |
| `LibraryMemberList` | Page | Member management |
