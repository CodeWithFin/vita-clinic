# Product Requirements Document (PRD)

## Product Name

**Vitapharm Clinic Booking & Queueing System**

## Version

v1.0

## Prepared By

Product & Engineering Team

## Date

2026

---

## 1. Product Overview

Vitapharm Clinic Booking & Queueing System is a web-based healthcare management platform designed to streamline patient booking, real-time queue management, and clinical record handling. The system emphasizes **real-time updates, reduced waiting anxiety, operational efficiency**, and a **gamified user experience** while maintaining medical professionalism.

The platform supports four core user roles: **Patient, Receptionist, Doctor, and Admin**.

---

## 2. Goals & Objectives

### Primary Goals

* Reduce patient waiting uncertainty through real-time queue visibility
* Digitize appointment booking and patient records
* Improve clinic operational efficiency
* Enable seamless communication between patients and clinic staff
* Provide a calm, gamified experience to reduce patient stress

### Success Metrics

* Average patient wait time reduced
* Queue visibility accuracy (>95%)
* Appointment no-show rate reduced
* System uptime >99%
* Positive patient satisfaction feedback

---

## 3. Target Users

### 3.1 Patients

* Clinic visitors booking consultations
* Walk-in patients registered by receptionist

### 3.2 Receptionists

* Front-desk staff managing bookings and queues

### 3.3 Doctors

* Medical practitioners attending patients

### 3.4 Admin

* Clinic system administrators

---

## 4. User Roles & Permissions

| Role         | Key Permissions                                                       |
| ------------ | --------------------------------------------------------------------- |
| Patient      | OTP login via email, book appointment, view queue, view prescriptions |
| Receptionist | Manage bookings, manage queue, register patients, edit records        |
| Doctor       | Manage schedule, view records, write prescriptions                    |
| Admin        | User management, system configuration, reports                        |

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization

#### Patients

* Login/signup via **email + OTP**
* No password required
* Auto account creation on first login
* OTP verification handled by backend service (custom implementation)

#### Staff (Receptionist, Doctor, Admin)

* Email + password authentication
* Role-based access control (RBAC)

---

### 5.2 Patient Features

#### Booking

* Book clinic session
* Select preferred doctor (optional)
* Receive booking confirmation

#### Dashboard

* Upcoming visit details
* Last visit summary
* Visit history timeline

#### Live Queue (Real-Time)

* View current position
* See who is before and after
* Real-time estimated wait time
* Auto-updating via WebSockets

#### Prescriptions

* View prescriptions per visit
* Doctor notes attached to each prescription

---

### 5.3 Receptionist Features

#### Patient Management

* Register walk-in patients
* Send **email OTP** to patients for account creation
* Search patients by email
* Update patient records

#### Booking Management

* Create bookings on behalf of patients
* Assign doctor and visit date
* Schedule next visit
* Modify or cancel appointments

#### Queue Management

* View live queue
* Add/remove patients from queue
* Mark patient status (waiting, in-progress, no-show, completed)
* Send patient reminders

#### Prescriptions (Fallback)

* Enter prescriptions if doctor unavailable
* Changes tracked with audit logs

---

### 5.4 Doctor Features

#### Schedule Management

* Set availability
* View daily appointments

#### Patient Records

* View full patient medical history
* Access past prescriptions and visit notes

#### Prescriptions

* Create and update prescriptions
* Add medical notes per visit

#### Queue Interaction

* Call next patient
* Update visit status

---

### 5.5 Admin Features

* Add/edit/remove doctors and receptionists
* Assign roles and permissions
* Configure clinic hours and queue rules
* Manage appointment durations
* View analytics and reports

---

## 6. Gamification Requirements

* Queue progress indicator (progress ring/bar)
* Status badges for visit states
* Encouraging micro-copy messages
* Visual milestones for visit history
* Subtle animations for state changes

Gamification must remain **calm, professional, and healthcare-appropriate**.

---

## 7. Non-Functional Requirements

### Performance

* Queue updates latency < 1 second
* Support concurrent users (patients + staff)

### Security

* JWT-based API authentication
* Encrypted data at rest and in transit
* Role-based access enforcement
* Audit logs for sensitive actions

### Availability

* 99% uptime target

### Scalability

* Horizontal backend scaling
* WebSocket support for concurrent sessions

---

## 8. Technical Architecture

### Frontend

* Framework: **Vite + Svelte**
* Hosting: Vercel

### Backend

* Framework: Fastify (Node.js)
* REST APIs + WebSockets
* Custom email OTP service for patient login

### Database

* PostgreSQL or MySQL
* Tables for:

  * users
  * patients
  * doctors
  * appointments
  * queue
  * visits
  * prescriptions
  * audit_logs

### Authentication

* Custom email OTP + JWT for patients
* Email/password + JWT for staff

### Realtime

* WebSockets (@fastify/websocket)

### Cache (Optional)

* Redis

---

## 9. Data Entities (High-Level)

* Users
* Patients
* Doctors
* Appointments
* Queue Entries
* Visits
* Prescriptions
* Audit Logs

---

## 10. Risks & Mitigations

| Risk                     | Mitigation                                    |
| ------------------------ | --------------------------------------------- |
| Email OTP delivery delay | Use reliable email service + retry mechanisms |
| Network latency          | WebSockets + caching                          |
| Data access misuse       | RBAC + audit logs                             |
| No-shows                 | Reminder notifications                        |

---

## 11. Out of Scope (v1)

* Online payments
* Telemedicine/video calls
* Insurance claims processing
* Multi-clinic support

---

## 12. Future Enhancements

* WhatsApp notifications
* AI wait-time prediction
* Patient feedback & ratings
* Multi-branch clinic support
* Offline-first mode

---

## 13. Acceptance Criteria (v1)

* Patients can log in via **email OTP**
* Real-time queue updates work reliably
* Receptionists can manage bookings and queues
* Doctors can write prescriptions
* Admin can manage users and settings

---
