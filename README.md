# 🌐 Aasth Browser

<div align="center">
  <img src="https://img.shields.io/badge/Status-Completed-success" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Mac%20%7C%20Linux-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Engine-Chromium-orange" alt="Engine" />
  <img src="https://img.shields.io/badge/Tech-Electron%20%2B%20React-61DAFB" alt="Tech Stack" />
</div>

> *"Privacy is not a feature. It is a fundamental right." — Aasth*

## 📖 About The Project

**Aasth Browser** is a custom, ultra-fast, privacy-first desktop web browser built from the ground up using **Electron, React, and TypeScript**. 

The goal was to create a personalized browsing experience that rivals modern privacy browsers like Brave, but with a highly tailored, beautiful, and distraction-free user interface. It combines the powerful Chromium rendering engine with a sleek, glassmorphism-inspired React frontend.

### ❓ Why was this built?
Standard web browsers are often cluttered, resource-heavy, and compromise user data. Aasth was built to:
1. **Guarantee Privacy:** Zero telemetry, aggressive ad-blocking, and complete control over your data.
2. **Provide Premium Aesthetics:** A truly beautiful, personalized daily-driver interface.
3. **Optimize Resources:** Smartly manage background tabs to keep your computer running fast.

## ✨ Key Features

- **🛡️ Aasth Shield:** Natively blocks intrusive ads, cross-site tracking cookies, fingerprinting, and automatically upgrades insecure connections to HTTPS.
- **🎨 Unified Glass UI:** A stunning top bar that seamlessly merges window controls, tabs, and the toolbar to maximize your viewing space.
- **🏠 Custom New Tab Dashboard:** Features dynamic HD landscape wallpapers, a massive AASTH typography centerpiece, customizable site shortcuts, and live privacy statistics.
- **⚙️ Full-Page Settings:** A comprehensive Brave-style dashboard to control appearance, shields, memory saver modes, and browsing data.
- **⚡ Smart Tab Sleeping:** Automatically unloads background tabs from memory after a set time to conserve RAM and Battery.
- **🧩 Extensions Support:** Safely load and manage custom Chromium extensions.
- **🔍 Aasth Search:** Integrated private search functionality directly in the omnibox.

## 🛠️ Technology Stack

- **Core Engine:** [Electron](https://www.electronjs.org/) (Chromium Blink + Node.js V8)
- **Frontend UI:** [React](https://reactjs.org/) with functional components & Hooks
- **Styling:** Pure Vanilla CSS with CSS Variables for a lightweight, Tailwind-free UI
- **Language:** TypeScript for end-to-end type safety
- **Build Tool:** Electron Forge + Webpack

## 🚀 Getting Started

If you want to run or package Aasth Browser locally on your machine:

### 1. Installation
Ensure you have Node.js installed, then install dependencies:
```bash
npm install
```

### 2. Development Mode
Run the browser in development mode (with hot-reloading for the React UI):
```bash
npm run dev
```

### 3. Packaging for Production
To build a standalone `.exe` for Windows:
```bash
npm run make
```
The compiled executable will be located in the `out/make/` folder.

## 🎨 Design Identity
The browser is characterized by its signature minimalist white "8" logo with a diagonal cut. The interface prioritizes smooth micro-animations, vibrant active states, and a dark-mode-first approach for late-night developers and creators.
