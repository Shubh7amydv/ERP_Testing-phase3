# 🚀 Backend Setup Guide

Follow these steps to set up and run the backend server locally.

---

## 🧱 1. Prerequisites

Make sure you have the following installed:

- Python (3.10+ recommended)
- pip
- Docker & Docker Compose

---

## 📁 2. Navigate to Backend Folder

```bash
cd backend
```
---

## 🐍 3. Create Virtual Environment

```bash
python -m venv venv
```

---

## ⚡ 4. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

---

## 📦 5. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🐘 6. Start PostgreSQL Database (Docker)

Make sure Docker is running, then:
```bash
docker-compose up -d
```

This will start a PostgreSQL database with:

- **DB Name:** school_db  
- **User:** postgres  
- **Password:** postgres  
- **Port:** 5432  

---

## 🛠️ 7. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 👤 8. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

---

## ▶️ 9. Run Development Server

```bash
python manage.py runserver
```

---

## 🌐 10. Access the App

- **Backend API:** http://127.0.0.1:8000/  
- **Admin Panel:** http://127.0.0.1:8000/admin/  

---

## 📂 11. Media Files (if applicable)

Uploaded files will be stored in the `media/` folder.

**Make sure:**

- `MEDIA_ROOT` and `MEDIA_URL` are configured in settings  
- Files are accessible via browser  