# OrbitSpace // 3D Keplerian Simulation Engine

An interactive 3D particle simulation built to visualize complex orbital mechanics, conceptual telemetry pipelines, and high-density planetary defense dashboards.

## 🚀 Core Features

* **WebGL High-Density Swarm:** Animates 140+ individual orbital vectors simultaneously at a locked 60 FPS using **Globe.gl** and **Three.js**.
* **Global Distribution Loop:** Leverages advanced phase-shift trigonometry to distribute vectors realistically across all global coordinates, completely preventing regional or periodic clustering.
* **Tactical HUD Interface:** A glassmorphic military-grade dashboard featuring real-time conceptual logging, data ingestion summaries, and an automated threat index chart (**Chart.js**).

## 🛰️ Architectural Decision: Live API vs. Simulation

During development, the live **NASA NeoWs (Near-Earth Object) API** was evaluated but bypassed due to two critical production bottlenecks:

1. **Data Scarcity vs. UI Density:** The official API yields only 5–15 real-time data points per day depending on current near-Earth passes. Rendering only 10 points fails to stress-test WebGL performance and leaves a high-density tactical viewport looking functionally empty.
2. **API Rate Limiting:** Free-tier or demo API credentials impose strict request thresholds, making live continuous rendering unsafe for a public-facing web demo.

**The Solution:** To demonstrate front-end capabilities under high-volume data structures, this engine uses a local **Keplerian Telemetry Simulator**. It mirrors NASA’s exact JSON payload schema (diameters, miss distances, hazard flags) while scaling the viewport load to 140+ concurrent entities to prove raw rendering and parsing performance.

## 🛠️ Tech Stack

* Vanilla JavaScript (ES6+)
* WebGL / Three.js / Globe.gl
* Chart.js
* Geist Mono Font & Phosphor Icons

---
Developed with engineering focus by **Yagiz Karagoz**.
