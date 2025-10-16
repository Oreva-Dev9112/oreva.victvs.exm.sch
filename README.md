# 🧾 VICTVS Exam Scheduler

Full-stack exam scheduling system built with a **Laravel 11 REST API** and a **React 19 + Vite** frontend.

---

## 🌐 Hosted URLs
- **API:** [https://victvs-exm.alwaysdata.net/backend/public/api/exams](https://victvs-exm.alwaysdata.net/backend/public/api/exams)  
- **Frontend:** [https://oreva-victvs-exm-sch.vercel.app](https://oreva-victvs-exm-sch.vercel.app)

---

## ⚙️ Backend (Laravel)
- Laravel 11, PHP 8.2+, Composer
- MySQL database hosted on AlwaysData
- CORS configured for both localhost and deployed frontend

### Key Endpoints
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/exams` | List upcoming exam sessions (with filter support) |
| `PUT` | `/api/exams/{id}/status` | Advance exam status (Pending → Started → Finished) |

---

## 💻 Frontend (React + Vite)
- React 19, Vite 7, TypeScript
- Tailwind CSS + shadcn/ui component styling

### Pages
- **Home** – Hero section with quick navigation  
- **Sessions** – Table view with search, filter, and detail modals  
- **Map** – Google Maps integration for location plotting  

---

## 🛠 Implementation Notes
- Laravel Eloquent models (`Exam`, `Candidate`) backed by pivot table `exam_candidates`
- Axios-based API client with `VITE_API_BASE_URL` environment variable
- Map view reads from `/api/exams` and dynamically plots markers
- Deployments:
  - **Backend:** Laravel hosted on AlwaysData via SSH + Composer
  - **Frontend:** React app deployed on Vercel (`frontend/vercel.json` handles SPA rewrites)

---

## 👤 Author
**Oreva U.**  
_Project submission for the **VICTVS Exam Schedule System** technical test_
