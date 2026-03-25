# Chillmaxxing

Chillmaxxing is a web app that helps you find the best nearby place to chill right now.

Instead of acting like a generic weather app, Chillmaxxing combines live weather data with nearby public places to answer a more useful question:

**Where should I go in the next 30–60 minutes if I want the best spot to hang out?**

Users can choose a vibe like **Sun**, **Shade**, **Low Wind**, or **Golden Hour**, and the app ranks nearby spots based on current and near-future conditions.

---

## Features

- Desktop-first React app built with **Vite + TypeScript**
- Uses browser **geolocation** to get the user’s current position
- Finds nearby public places such as:
  - parks
  - viewpoints
  - picnic areas
  - benches
  - waterfront-style spots when available
- Fetches live weather and short-term forecast data
- Scores locations based on the selected vibe
- Shows:
  - best spots **right now**
  - best spots **in 60 minutes**
- Displays results in both a **ranked list** and on a **map**
- Stores preferences locally with `localStorage`

---

## Vibes

The current MVP supports these vibe modes:

- **Sun**  
  Prefer sunny, dry, comfortable spots with lower cloud cover

- **Shade**  
  Prefer cooler-feeling spots, more cloud cover, and comfortable conditions

- **Low Wind**  
  Prefer calmer locations with less wind and low rain chance

- **Golden Hour**  
  Prefer spots with good sunset timing, low rain chance, and decent evening conditions

---

## Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **Leaflet / React Leaflet**
- **TanStack Query**
- **Tailwind CSS**
- **Open-Meteo** for weather data
- **OpenStreetMap / Overpass API** for nearby public places

---

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm

### Install dependencies

```bash
npm install