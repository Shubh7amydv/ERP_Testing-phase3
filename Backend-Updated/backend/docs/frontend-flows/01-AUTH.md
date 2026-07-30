# Module 0: Authentication - Actual API Flow

## Base: `/api/`

---

## Screen 1: Login Page

```
┌─────────────────────────────────────────────┐
│         🏫  School ERP                     │
│    ┌─────────────────────────────────┐     │
│    │  Email:    [user@school.com   ] │     │
│    │  Password: [••••••••          ] │     │
│    │  ☐ Remember me                   │     │
│    │                                   │     │
│    │  [      Login      ]             │     │
│    │                                   │     │
│    │  Forgot Password?                 │     │
│    └─────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**API Calls:**
```
POST /api/auth/login/
Body: { "email": "...", "password": "..." }
Response: { "access": "JWT...", "refresh": "JWT...", "user": { id, email, role_name, school_name, permissions: [...] } }
```

**On Success:**
1. Store `access` + `refresh` tokens in localStorage
2. Store `user` object in auth store
3. Redirect to Dashboard

**On Error:**
- 401 → Toast: "Invalid credentials"
- 403 → Toast: "Account is disabled"

---

## Screen 2: Forgot Password

```
┌─────────────────────────────────────────────┐
│    ┌─────────────────────────────────┐     │
│    │  Email: [user@school.com     ]   │     │
│    │  [  Send Reset Link  ]           │     │
│    │  ✅ Reset link sent to email!     │     │
│    │  ← Back to Login                  │     │
│    └─────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**API Calls:**
```
POST /api/auth/password-reset/
Body: { "email": "user@school.com" }
Response: { "message": "If the email exists, a reset link has been sent" }
```

---

## Screen 3: Reset Password (via email link)

```
┌─────────────────────────────────────────────┐
│    ┌─────────────────────────────────┐     │
│    │  New Password:     [••••••    ]  │     │
│    │  Confirm Password: [••••••    ]  │     │
│    │  [  Reset Password  ]            │     │
│    └─────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**API Calls:**
```
POST /api/auth/password-reset/confirm/
Body: { "token": "UUID-from-email", "new_password": "..." }
Response: { "message": "Password reset successful" }
```

---

## Screen 4: Profile Page

```
┌─────────────────────────────────────────────┐
│  My Profile                                 │
│  ─────────────────────────────────────────  │
│  ┌──────┐                                  │
│  │ 📷   │  Name: John Doe                  │
│  │Avatar│  Email: john@school.com          │
│  └──────┘  Role: Teacher                   │
│            School: DPS Delhi               │
│  ─────────────────────────────────────────  │
│  [Edit Profile]                             │
│                                             │
│  Change Password                            │
│  Current: [••••••]  New: [••••••]           │
│  [  Update  ]                               │
│                                             │
│  Active Sessions                            │
│  📍 Chrome | 2 min ago          [Revoke]    │
│  📍 Mobile | 1 day ago          [Revoke]    │
└─────────────────────────────────────────────┘
```

**API Calls:**
```
GET  /api/auth/me/                    → UserSerializer
PUT  /api/auth/me/                    → Update profile
PUT  /api/auth/change-password/       → { old_password, new_password }
GET  /api/auth/sessions/              → Session[]
DELETE /api/auth/sessions/<id>/       → Revoke session
```

---

## Screen 5: Role Management (Super Admin only)

```
┌─────────────────────────────────────────────┐
│  Role Management              [+ Add Role]  │
│  ─────────────────────────────────────────  │
│  │ Role Name      │ Permissions │ Actions   │
│  │ School Admin   │ All (24)    │ ⋮         │
│  │ Accountant     │ 8          │ ⋮         │
│  │ Teacher        │ 6          │ ⋮         │
│                                              │
│  Edit Role:                                  │
│  Role: [Teacher]                             │
│  ☑ admissions.view  ☑ attendance.view         │
│  ☑ attendance.mark  ☑ exams.view              │
│  ☐ fees.view        ☐ library.view            │
│  [Save]                                      │
└─────────────────────────────────────────────┘
```

**API Calls:**
```
GET    /api/roles/                         → Role[]
POST   /api/roles/create/                  → Create role
GET    /api/roles/<id>/                    → Role detail
PUT    /api/roles/<id>/update/             → Update role
DELETE /api/roles/<id>/delete/             → Delete role
GET    /api/permissions/                   → Permission[]
POST   /api/roles/<id>/assign-permissions/ → { permission_ids: [1,2,3] }
POST   /api/roles/<id>/remove-permissions/ → { permission_ids: [1,2] }
```

---

## Auth Flow Diagram

```
Login Page
  │
  ├── POST /api/auth/login/
  │     ├── Success → Store tokens → Store user → Dashboard
  │     ├── 401 → "Invalid credentials"
  │     └── 403 → "Account disabled"
  │
  ├── Forgot Password → POST /api/auth/password-reset/
  │     └── Reset Link Page → POST /api/auth/password-refresh/confirm/
  │
  └── Profile Page
        ├── GET /api/auth/me/
        ├── PUT /api/auth/me/
        ├── PUT /api/auth/change-password/
        ├── GET /api/auth/sessions/
        └── DELETE /api/auth/sessions/<id>/
```

---

## Token Management

```typescript
// Store in localStorage
localStorage.setItem('access_token', response.access);
localStorage.setItem('refresh_token', response.refresh);

// Axios interceptor
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response.status === 401) {
      // Try refresh
      const { data } = await axios.post('/api/auth/refresh/', {
        refresh: localStorage.getItem('refresh_token')
      });
      localStorage.setItem('access_token', data.access);
      // Retry original request
    }
    if (err.response.status === 401 && refreshFailed) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
);
```

---

## Permission Check Helper

```typescript
function hasPermission(permissions: string[], codename: string): boolean {
  return permissions.includes(codename) || permissions.includes('*');
}

// Usage in components
{hasPermission(user.permissions, 'fees.collect') && <FeeCollectionButton />}
{hasPermission(user.permissions, 'admissions.view') && <StudentListLink />}
```
