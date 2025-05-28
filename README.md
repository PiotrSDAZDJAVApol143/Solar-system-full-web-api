# Solar-Api-Astro-Friq

## About the Project

**Solar-Api-Astro-Friq** is a personal, hobby project aimed at learning programming, new technologies, and building a portfolio. The project is a full-stack application that visualizes the Solar System in 3D scale and provides astronomical information about planets, moons, and the Sun.

The backend is written in Java and provides an API for retrieving data about celestial bodies, which are stored in a MySQL database. The frontend is built with React and uses Three.js for 3D animations and interactive visualizations.

---

## Features

- **3D Visualization**: Explore a realistic, interactive 3D model of the Solar System using Three.js.
- **Accurate Data**: View real parameters for each planet and moon, fetched from the backend API or external sources.
- **Modular Architecture**: The project is organized into separate frontend and backend modules.
- **Responsive Interface**: Works on modern desktops and laptops.
- **Educational Purpose**: Includes fun facts and detailed astronomical information.
- **Custom Animations**: Each celestial object has its own unique animation and visual style.
- **Contact Form**: Send feedback directly from the application.

---

## Technology Stack

- **Backend**: Java (Spring Boot), MySQL
- **Frontend**: React, Three.js, Bootstrap
- **Other Libraries**: lil-gui, GSAP, Axios

---

## How to Run

### Prerequisites

- Node.js & npm
- Java 17+ (for backend)
- MySQL database

### 1. Backend Setup

1. Configure your MySQL database and update the backend settings (e.g., `application.properties`).
2. Build and run the Java backend (using your IDE or command line):
    ```bash
    ./mvnw spring-boot:run
    ```
3. The backend will start by default on [http://localhost:8080](http://localhost:8080).

### 2. Frontend Setup

1. Navigate to the `/frontend` directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm start
    ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Building for Production

To build the frontend for deployment:
```bash
npm run build