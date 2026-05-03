# Team Task Manager

A full-stack MERN application designed to help teams manage projects and tasks efficiently.  
The application includes authentication, task tracking, and role-based access to control user permissions.

---

##  Features

- User authentication (Signup / Login)
- JWT-based secure authentication
- **Role-Based Access Control (RBAC)**
  - **Admin**: Can manage projects and perform critical actions (e.g., delete projects)
  - **Member**: Can create and update tasks within projects
- Create and manage projects
- Add, update, and delete tasks
- Track task progress (Pending / In Progress / Completed)
- Responsive UI (mobile + desktop)

---

##  Tech Stack

- **Frontend:** React (Vite), Axios, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Atlas)  
- **Authentication:** JWT  

---

##  How Role-Based Access Works

- Each user is assigned a role (`admin` or `member`)
- The role is stored in the database and included in the JWT token
- Backend middleware verifies the role before allowing access to protected routes

Example:
- Only **admin** can delete a project
- **Members** can manage tasks but cannot perform restricted actions

This ensures proper security and controlled access within the application.

---

##  Live Demo

https://team-task-manager-production-XXXX.up.railway.app

---

##  Local Setup

### 1. Clone repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
