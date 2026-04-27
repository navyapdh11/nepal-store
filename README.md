# NEPAL STORE

An enterprise-grade e-commerce prototype inspired by the minimalist, high-quality structure of Uniqlo, enhanced with a Modern Nepali aesthetic and intelligent AI orchestration.

## 🚀 Key Features

*   **Platform UX:** Mobile-first, gender-based tab navigation (WOMEN, MEN, KIDS, BABY).
*   **Modern Nepali Aesthetic:** Custom design system using Vanilla CSS, featuring earthy tones and Dhaka-inspired accents.
*   **Customer Dashboard:** A personalized hub featuring a Myntra-style loyalty tier system, Flipkart-inspired order timelines, and AI-personalized recommendations.
*   **AI Companion Kernel:** Provides context-aware nudges for a personalized shopping journey.
*   **Hierarchical Search:** Utilizes Depth-First Search (DFS) for efficient navigation of complex regional hierarchies (Provinces/Districts/Municipalities).
*   **Remotion Integration:** Dynamic video hero banners that animate based on category selections.
*   **Microservices Architecture:** Decoupled `AuthService` for secure JWT-based authentication.

## 🛠️ Technical Stack

*   **Frontend:** React 18, TypeScript, Vite.
*   **Styling:** Vanilla CSS (Custom Design Tokens).
*   **Video:** Remotion v4 (Declarative `<Composition>` API).
*   **Backend:** Node.js (Express), JWT, Zod validation.
*   **Data:** Postgres with DFS utilities for tree traversal.

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/navyapdh11/nepal-store.git
   cd nepal-store
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🧠 Architectural Insights

*   **AI Engine:** The `AICompanionKernel` provides hyper-contextual nudges, such as weather-based gear recommendations (e.g., monsoon alerts for Kathmandu).
*   **Hierarchical Search:** The `dfs.ts` utility allows for high-performance traversal of nested structures, critical for managing regional services in Nepal.
*   **Authentication:** Microservice-ready Auth module providing secure, JWT-backed user sessions.

## 🛡️ Security & Compliance

*   **PII Protection:** Strict adherence to security standards; only high-level regional data (suburb/municipality) is processed for AI context.
*   **Type Safety:** 100% TypeScript coverage with Zod schema validation on all API boundaries.

---
*Built as a state-of-the-art e-commerce prototype.*
