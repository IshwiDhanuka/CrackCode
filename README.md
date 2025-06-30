# CrackCode

## Problem Statement:

A coding challenge is a competitive event in which a group of participants solve a set of coding questions within a specified timeframe, typically ranging from a few hours to a few days. Participants who have registered beforehand compete by submitting their solutions, which are evaluated against concealed test cases. Based on the test results, participants are assigned scores. An online judge is a platform that hosts these coding challenges, providing the infrastructure to manage and execute the competitions. Examples of online judges include Codechef, Codeforces etc.

---

## Overview:

Designing a Full Stack Online Judge Using MERN Stack. Takes code from different users over the server. Evaluates it automatically as accepted or not accepted.

---

## Core Functional Screens

### a. User Management

- Signup/Login pages, JWT-based Authentication, Profile Updates  
- Admin and User roles with conditional rendering and protected routes  
- Password hashing (bcrypt), email verification, rate limiting on auth endpoints to prevent abuse like brute-force login  
- Register page, Login page, Forgot password/reset flow  

### b. Problem Management

- Problem List page for users (with categories, tags, difficulty)  
- Admin CRUD access to add/edit/delete problems and test cases  
- Secure and isolated test case management (including hidden and sample cases)  

### c. Code Submission & Evaluation

- Asynchronous code execution using Docker containers triggered via RabbitMQ  
- Secure isolated containers for Python, Java, C++, etc.  
- Accepts code via frontend submission form, executes in Docker with memory/time limits  
- Compares output with hidden test cases and returns verdict (AC, WA, TLE, etc.) with detailed case-wise feedback  
- Uses WebSockets for live submission verdict updates  

### d. Leaderboard and Scoring

- Live leaderboard for ongoing contests  
- Global and contest-specific ranking pages  
- Tie-breaker and timestamp logic for resolving identical scores  
- Implemented WebSockets for real-time UI refresh  

### e. Practice Arena

- Practice problem library with status tags (solved/unsolved)  
- Submission history for every problem  
- Verdict logs with past attempts  

### f. Profile Management

- View stats (problems solved, submission count, contest participation)  
- Change name, password, avatar, preferred language  
- Complete verdict history with timestamps  

---

## Database Designing (MongoDB)

### Collection: `users`

- **Purpose:** Stores user profile and auth info  
- **Fields:**  
  - `username`: string (unique)  
  - `user_id`: int (auto-generated)  
  - `email`: string (unique)  
  - `password_hash`: string (bcrypt)  
  - `full_name`: string  
  - `dob`: date  
  - `role`: string (user/admin)  
  - `created_at`: date-time  

### Collection: `problems`

- **Purpose:** Stores coding problem data  
- **Fields:**  
  - `problem_id`: string (auto-generated)  
  - `title`: string (required)  
  - `code`: string (unique ID like "UCS599")  
  - `statement`: string – problem description  
  - `difficulty`: string – enum: { “Easy”, “Medium”, “Hard” }  
  - `tags`: array of strings (e.g., ["array", "dp", "string"])  
  - `created_at`: datetime  

### Collection: `submissions`

- **Purpose:** Tracks user submissions  
- **Fields:**  
  - `user_id`: foreign key referencing to `user_id` in users  
  - `problem_id`: foreign key referencing to `problem_id` in problems  
  - `language`: string (e.g., cpp, python)  
  - `code`: string  
  - `verdict`: string (AC, WA, TLE)  
  - `exec_time`: float (ms)  
  - `memory_used`: int (KB)  
  - `submitted_at`: date-time  

### Collection: `test_cases`

- **Purpose:** Input/output validation for problems  
- **Fields:**  
  - `problem_id`: foreign key referencing to `problem_id` in problems  
  - `input`: string – test case input  
  - `output`: string – test case output  
  - `is_sample`: boolean (true for sample cases)  

---

## Web Server Design

### Frontend Design (ReactJS + TailwindCSS)

#### UI Screens:
- **Home**: Problem List, Login/Register  
- **Problem Page**: Problem Statement + Code Editor  
- **Submissions Page**: Verdicts and Logs  
- **Leaderboard**: User Rankings  

---

### Backend (ExpressJS API)

#### Authentication:
- `POST /api/register`  
- `POST /api/login`  

#### Problems:
- `GET /api/problems`  
- `GET /api/problems/:id`  

#### Submissions:
- `POST /api/submit`  
- `GET /api/submissions/user/:id`  
- `GET /api/submissions/problem/:id`  

#### Leaderboard:
- `GET /api/leaderboard`  

---

## Code Evaluation System (Secure Docker Executor)

### Uses Docker containers to isolate and securely execute user code

#### Execution Flow:
1. User submits code from frontend  
2. Backend queues submission (via Redis/RabbitMQ)  
3. Judge Engine (worker) picks from queue  
4. Executes inside secure Docker container  
5. Compares output with test cases  
6. Verdict + resource usage saved to DB  
