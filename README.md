# TechSalary LK

Community-driven tech salary transparency platform for Sri Lanka.

## Team Members Contributions
- Sasfak Ahamed — Frontend + BFF Service 
- Himal — Database Schema + Identity Service
- Savinthie — Salary Service + Vote Service
- Puselle — Search Service + Stats Service 

## Tech Stack
- Frontend: Next.js, Tailwind CSS
- Backend: Python, Flask
- Database: PostgreSQL
- Containerization: Docker
- Orchestration: Kubernetes (AKS on Azure)

## Architecture
Microservices architecture with 7 independent services
deployed on a single-node Kubernetes cluster on Azure.

## How to Run Backend
cd services/backend
docker compose up --build

## How to Run Frontend
cd services
cd techsalary-frontend
npm run dev 
