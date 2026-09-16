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


## 📖 How to Use Mindora

### 1. Setting Up as a Caregiver (Daughter Anu)

* **Adding & Managing Medicines**:
1. Open `/today` or navigate to `/caregiver/reminders`.
2. Click the **Caregiver Schedule Customizer** button in the header.
3. Select **Add New Medicine**:
* Tap quick-select time chips (e.g., *Morning*, *Afternoon*, *Night*).
* Set frequency presets (e.g., *Once daily*, *Twice daily*) and dosage (e.g., *1 Tablet*).
* Add simple instructions (e.g., *"Take after breakfast with warm water"*).


4. Click **Save**. To make rapid adjustments later, click the inline ✏️ **pencil icon** on any medicine card directly.


* **Curating the Memory Library**:
1. Go to `/memory` or `/caregiver/memories` and click **Add Memory**.
2. Select a category: **People**, **Places**, **Things**, or **Moments**.
3. Upload/link a portrait or image, specify the relationship (e.g., *"Grandchild"*), and add a short reassurance note.
4. Record or attach an audio greeting clip so Amma can hear familiar voices during games.


* **Tracking Cognitive Trends & Adjusting Difficulty**:
1. Visit `/caregiver/activity` to view Amma's 7-day cognitive trend line, accuracy %, and response times.
2. Adjust the **Adaptive Difficulty Engine** slider (*Gentle*, *Moderate*, or *Challenging*) to match her current focus levels.



---

### 2. Daily Routine for the Patient (Amma)

* **Checking In & Taking Medicines**:
1. Open `/patient` to view the warm greeting (*"Namaste Amma"*), current date, and time.
2. Head to `/today`:
* Look at the **Medicines & Health** list.
* When a pill is taken, tap the large **Mark Taken** button (switches to a soothing green **Taken** state).
* Tap **Start Activity** on routine cards (e.g., walks, tea, rest) to follow daily habits.




* **Talking with TalkBot (Voice Assistant)**:
1. Tap the **Floating Microphone** icon in the bottom corner of any page (or go to `/talk`).
2. Speak naturally:
* *"What are my medicines today?"* → TalkBot reads out the scheduled medicines, times, and dosages.
* *"Remind me to drink water at 4 PM"* → TalkBot schedules the reminder directly into the routine.
* *"How did I do in my games today?"* → TalkBot offers an encouraging audio summary of recent activity.




* **Playing Cognitive Games**:
1. Navigate to `/play` and choose a game:
* **Who’s Speaking?**: Tap the audio button to hear a family member's voice, then tap their portrait to identify them.
* **Who Is This?**: Look at the family portrait and select the matching name using the helpful relationship hints.
* **Memory Match**: Tap cards to find matching pairs of culturally familiar items like Sewali flowers, prayer bells, and tea kettles.





---

## 🛠️ Tech Stack

* **Frontend**: Vanilla HTML5, Modern CSS3, JavaScript (ES6+)
* **Speech Engine**: Native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **State Management**: Reactive local client store via `storage.js`
* **Audio System**: Soft ambient feedback and chime cues via `sound.js`

```

```
