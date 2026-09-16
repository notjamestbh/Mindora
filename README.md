# 🧠 Mindora — Gentle Cognitive Care & Memory Companion

> A compassionate, culturally grounded web companion designed to support individuals living with early-to-moderate dementia, foster neuroplasticity, and ease daily coordination for family caregivers.

---

## 💡 About the Project

Dementia care often lacks tools that feel warm, familiar, and non-clinical. **Mindora** bridges memory rehabilitation with daily routine management. Built with culturally resonant motifs (rooted in North-Eastern & Assamese traditions like Sewali flowers, prayer bells, and Gamosa looms), it creates a calming digital sanctuary for elders ("Amma") while giving family caregivers ("Anu") clear visibility into cognitive well-being.

---

## ✨ Key Features

### 1. Patient Portal (Calm, High-Contrast, Low-Cognitive Load)
* **Daily Home Dashboard (`/patient`)**: Calming greeting (*"Namaste Amma"*), visual routine tracker, and low-friction navigation cards.
* **Today's Schedule & Medicine Center (`/today`)**:
  * **Medicines & Health**: Clear timing, dosage amounts, frequency tags (e.g., *"Once daily (Morning)"*), and one-tap completion logs.
  * **Daily Activities**: Inline *"Start Activity"* triggers for walks, meals, and brain training.
* **My Memory Library (`/memory`)**:
  * Richly categorized into **People**, **Places**, **Things**, and **Moments**.
  * Audio-visual cards featuring personal voice notes and family ties.
* **TalkBot Voice Assistant (`/talk` & Floating Widget)**:
  * Powered by the **Web Speech API** for two-way, hands-free voice interactions.
  * Context-aware queries: *"What are my medicines today?"* or *"Remind me to take tea at 4 PM"*.
  * Time-of-day empathetic fallbacks to soothe confusion or agitation.
* **Cognitive Games Suite (`/play`)**:
  * 🎙️ **Who’s Speaking?**: Audio recognition game playing real voice clips of loved ones matched to portrait cues.
  * 🖼️ **Who Is This?**: Gentle facial-recognition flashcards with subtle relationship hints.
  * 🎴 **Memory Match**: Cultural card-flip game featuring familiar objects (tea kettle, prayer bell, loom).

### 2. Caregiver Management Hub (`/caregiver`)
* **Cognitive Analytics (`/caregiver/activity`)**: Tracks response latency, accuracy trends, and gameplay completion rates over 7-day intervals.
* **Adaptive Difficulty Calibration**: Adjust game mechanics dynamically across **Gentle**, **Moderate**, and **Challenging** tiers.
* **Schedule & Memory Manager**: Add medicines with custom frequency presets, upload voice notes, or edit daily routines with immediate persistence.
* **Emergency Hub (`/caregiver/profile`)**: Quick-dial emergency contacts and clinical guidance notes.

### 3. Architecture & Accessibility
* **Real-Time Cross-Tab Sync (`storage.js`)**: Real-time state updates across medicines, routines, and games without page reloads.
* **Elder-First UX**: Extra-large click targets, soft ambient audio chimes (`sound.js`), zero flickering, and WCAG-compliant high-contrast typography.

---

## 🚀 Getting Started

### Prerequisites
* Any modern web browser with **Web Speech API** support (Google Chrome or Microsoft Edge recommended for voice synthesis).
* A local static server or simple live server extension.

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/mindora.git](https://github.com/your-username/mindora.git)
   cd mindora
