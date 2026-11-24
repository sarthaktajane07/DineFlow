# DineFlow Pro — Spring Boot 3 Backend

Production-ready restaurant table & waitlist management backend rewritten in **Java 21 + Spring Boot 3.3.x**, featuring MongoDB, Spring Security (JWT), Spring WebSocket (STOMP), and Twilio SDK (with mock fallback).

---

## 🛠️ Stack & Technologies
* **Language & Runtime:** Java 21 (LTS)
* **Framework:** Spring Boot 3.3.5
* **Data Persistence:** Spring Data MongoDB (compatible with MongoDB Atlas)
* **Security:** Spring Security 6 with stateless JWT Bearer authentication (`jjwt 0.12.x`)
* **Real-Time:** Spring WebSocket with STOMP message broker (`/ws`)
* **SMS & WhatsApp:** Twilio Java SDK (with automated Mock mode when credentials are not configured)
* **Documentation:** OpenAPI 3 & Swagger UI (`springdoc-openapi`)

---

## 🚀 Getting Started

### 1. Prerequisites
* **Java 21** or later (`java -version`)
* **MongoDB** instance running locally or a MongoDB Atlas URI

### 2. Environment Variables
Copy `.env.example` to `.env` or export environment variables:
```bash
export MONGODB_URI="mongodb://localhost:27017/dineflow"
export JWT_SECRET="dineflow-super-secret-jwt-key-must-be-at-least-256bits-long-for-hs256"
export PORT=5000
```

### 3. Build & Run
Using the Maven wrapper:
```bash
# Build the application
./mvnw clean package

# Run the application (starts on port 5000)
./mvnw spring-boot:run
```

---

## 🔐 Default Credentials (Auto-seeded on first run)
* **Manager:** `admin@dineflow.com` / `admin123`
* **Host:** `host@dineflow.com` / `host123`
* **Staff:** `staff@dineflow.com` / `staff123`

---

## 📖 API Documentation & Swagger UI
Once running, open your browser:
* **Swagger UI:** `http://localhost:5000/swagger-ui.html`
* **OpenAPI Specs:** `http://localhost:5000/v3/api-docs`

---

## 🔌 WebSocket STOMP
* **Endpoint:** `http://localhost:5000/ws` (Native WebSocket and SockJS supported)
* **Topic:** `/topic/all` broadcasts all events:
  * `table:created`, `table:updated`, `table:deleted`
  * `waitlist:added`, `waitlist:updated`, `waitlist:removed`
  * `guest:seated`, `notification:sent`, `activity:new`

---

## 🧪 Testing
```bash
./mvnw test
```
