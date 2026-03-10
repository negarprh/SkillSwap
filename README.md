# SkillSwap 🔧

**SkillSwap** is a freelance marketplace frontend built with **Angular** that integrates with a real **REST API**.
The application allows users to register, post jobs, submit proposals, accept offers, complete jobs, and review participants.

This project demonstrates a **complete marketplace workflow**, **JWT authentication**, **API integration**, and **modern Angular architecture**.


---

# Tech Stack

Frontend

* Angular
* TypeScript
* SCSS
* Angular Router
* Reactive Forms
* RxJS
* HTTP Interceptors

Backend API (provided by instructor)

* REST API
* JWT Authentication

---

# Application Overview

SkillSwap simulates a freelance marketplace platform where:

* Users create accounts
* Clients post jobs
* Freelancers submit proposals
* Clients accept proposals
* Jobs progress through lifecycle states
* Participants review each other
* User ratings update automatically

The frontend communicates with a **real backend API** and handles all **authentication, validation, and error states**.

---

# Features

### Authentication

* User registration
* User login
* JWT token handling
* Secure API requests using HTTP interceptor
* Automatic redirect on authentication errors

### User Profiles

* View own profile
* View public user profiles
* Display user skills
* Show rating and completed jobs

### Jobs Marketplace

* Browse available jobs
* Filter jobs using search
* View job details
* Create new jobs
* Update job details
* Manage personal job postings

### Proposals System

* Submit proposals for jobs
* View proposals submitted
* Accept a proposal (job owner)
* Withdraw pending proposals

### Job Lifecycle

Jobs move through these states:

```
open → in_progress → completed
```

### Reviews System

* Participants review each other
* Rating from 1–5
* Reviews only allowed after job completion

### Platform Statistics

Public platform data including:

* total users
* active jobs
* value exchanged

---

# API Integration

This project integrates with the provided backend API:

```
https://stingray-app-wxhhn.ondigitalocean.app
```

All business data comes from the API.

Authentication uses:

```
Authorization: Bearer <JWT_TOKEN>
```

The application uses an **Angular HTTP interceptor** to automatically attach the token to requests.

---

# Project Architecture

The application follows a **feature-based Angular architecture**.

```
src/app/
  core/
    config/
    guards/
    interceptors/
    models/
    services/
    utils/
  shared/
    components/
  features/
    auth/
    dashboard/
    jobs/
    proposals/
    platform/
    users/
  layout/
```

This structure ensures:

* separation of concerns
* reusable components
* scalable architecture

---

# Mandatory Business Flow

The application implements the required workflow:

1. User A registers
2. User A logs in
3. User A posts a job
4. User B registers
5. User B submits a proposal
6. User A accepts the proposal
7. Job moves to **in_progress**
8. Job is completed
9. Both participants leave reviews
10. Ratings update automatically

---

# Error Handling

The application handles all documented API errors including:

* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 409 Conflict

Errors are displayed clearly to the user through UI messages.

---

# Form Validation

Reactive Forms ensure strong validation:

Examples:

* Required fields
* Valid email format
* Password constraints
* Numeric budget validation
* Rating limits (1–5)
* Proposal price validation

---

# Running the Project

### 1. Clone the repository

```
git clone https://github.com/negarprh/SkillSwap.git
cd SkillSwap
```

### 2. Install dependencies

```
npm install
```

### 3. Run the development server

```
ng serve
```

Open:

```
http://localhost:4200
```

---

# Build for Production

```
ng build
```

Build files will appear in:

```
dist/
```

---

# Evaluation Criteria Covered

This project demonstrates:

* Correct API integration
* JWT authentication handling
* Clean Angular architecture
* Error handling
* Form validation
* Complete marketplace business flow
* Responsive UI
* Organized code structure

---

# Future Improvements

Possible improvements include:

* real-time notifications
* messaging between users
* job categories filtering
* advanced search
* profile editing
* UI animations

---
