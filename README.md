# SkillBase — Skill-Matching Platform
### A Simple Platform for Skill Sharing and Direct Collaboration

**SkillBase** is a peer-to-peer skill exchange platform designed to connect people who **HAVE** skills with individuals and organizations who **NEED** skills.

Built with clean, semantic HTML5, hand-crafted CSS, vanilla JavaScript (ES6+), and browser `LocalStorage`, it provides a straightforward, user-friendly experience for discovering talent, matching requirements, and communicating directly without intermediaries.

---

## 📁 Project Architecture & File Structure

```text
skillbase/
├── index.html          # Public homepage (Hero, Benefits, How It Works, Navigation)
├── login.html          # Login portal with role selection & demo 1-click test helpers
├── register.html       # Dynamic registration (Skill Provider vs. Skill Seeker)
├── provider.html       # Skill Provider Dashboard (manage skills, profile, inquiries)
├── seeker.html         # Skill Seeker Dashboard (manage project requirement, searches)
├── matches.html        # Skill Matching Engine (dual-mode provider/project matcher)
├── profile.html        # Individual profile and requirement view with contact trigger
├── server.js           # Zero-dependency local Node.js static file server (Port 3000)
├── css/
│   └── style.css       # Clean, manual CSS stylesheet with responsive media queries
└── js/
    ├── storage.js      # LocalStorage management, default seed data, CRUD & matching logic
    ├── auth.js         # Authentication, session guards, registration, login/logout
    ├── main.js         # Navigation header updates, mobile toggle & global contact modal
    ├── provider.js     # Provider dashboard logic (skills add/remove, profile edit, inbox)
    ├── seeker.js       # Seeker dashboard logic (requirement edit, search, sent log)
    └── matches.js      # Deterministic matching algorithm & filter execution
```

---

## 🚀 How to Run Locally

You can run the project in any of the following ways:

### Option 1: Using the included lightweight Node server (Recommended)
1. Open terminal in the `skillbase` directory.
2. Run:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

### Option 2: Open directly in any browser
Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari. All features work natively via `LocalStorage`.

---

## 🔑 Pre-Configured Demo Test Accounts

To allow immediate testing and evaluation during our presentation, the system is pre-seeded with realistic sample profiles:

| Account Name | Role | Email | Password | Primary Skills / Requirement | Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rahul Sharma** | Skill Provider | `rahul@example.com` | `password123` | HTML, CSS, JavaScript, React, Web Development | Mumbai |
| **Priya Patel** | Skill Provider | `priya@example.com` | `password123` | Figma, UI Design, Wireframing, Graphic Design | Pune |
| **Aman Verma** | Skill Provider | `aman@example.com` | `password123` | Python, SQL, Data Analysis, Machine Learning | Delhi |
| **Sneha Roy** | Skill Provider | `sneha@example.com` | `password123` | Content Writing, SEO, Technical Writing | Bangalore |
| **Rohan Gupta** | Skill Provider | `rohan@example.com` | `password123` | Flutter, Java, Android, Mobile App Development | Mumbai |
| **TechFest Committee** | Skill Seeker | `techfest@example.com` | `password123` | Seeks: **Web Development** (Budget: ₹8,000) | Mumbai |
| **GreenCampus NGO** | Skill Seeker | `greencampus@example.com` | `password123` | Seeks: **UI Design** (Budget: ₹4,000) | Pune |
| **Campus Incubator** | Skill Seeker | `incubator@example.com` | `password123` | Seeks: **Python** (Budget: ₹6,000) | Delhi |

> **Pro Tip:** On `login.html`, click **"Fill Demo Provider"** or **"Fill Demo Seeker"** to autofill credentials with a single click.

---

## 🧠 Skill Matching Algorithm Logic

Our matching logic is transparent, deterministic, and implemented in vanilla JavaScript (`js/storage.js` and `js/matches.js`):

1. **Keyword Skill Scoring (`+10 points`):**
   - Compares the Seeker's required skill against the Provider's advertised skill list.
   - Example: Seeker needs `"Web Development"` $\rightarrow$ Matches Provider with `["HTML", "CSS", "JavaScript", "Web Development"]`.
2. **Geographic Proximity Bonus (`+5 points`):**
   - If the Provider's location matches the Seeker's city (e.g., both are in `"Mumbai"`), a bonus score is added.
3. **Priority Ranking & Badging:**
   - **Score $\ge$ 15:** Marked with a green **"Top Match (Skill + Location)"** badge and ranked at the top.
   - **Score = 10:** Marked with a blue **"Skill Match"** badge.
   - **Score = 5 (Location only):** Marked with an orange **"Location Match"** badge.
4. **Dual Mode Discovery:**
   - Users can toggle between **"Find Skill Providers"** and **"Find Project Requirements"** directly on `matches.html`.

---

## 🔄 Complete Tested User Journey

1. **Home Page (`index.html`)** &rarr; Review hero, 3 major benefits (*Verified Skills*, *Smart Matching*, *Direct Contact*), and the 4-step workflow.
2. **Registration (`register.html`)** &rarr; Select either Provider or Seeker. Dynamic fields display according to user type. New user is saved to `LocalStorage` and auto-logged in.
3. **Login (`login.html`)** &rarr; Role-aware authentication with credential check against `LocalStorage`.
4. **Provider Dashboard (`provider.html`)** &rarr; View profile, click **"Add Skill"** to instantly add a skill badge, click **"Edit Profile"** to update bio/experience, and review received inquiries.
5. **Seeker Dashboard (`seeker.html`)** &rarr; View requirement details, click **"Edit Requirement"** to update budget/deliverables, search candidates, and track sent inquiries.
6. **Matching Engine (`matches.html`)** &rarr; Search by skill keywords and filter by city. Click **"Use My Requirement"** for 1-click matching based on logged-in criteria.
7. **Profile View (`profile.html`)** &rarr; Inspect full credentials, experience, and contact button.
8. **Contact Modal** &rarr; Send direct messages stored in `LocalStorage` with instant confirmation.
9. **Logout** &rarr; Clears session and updates navigation headers.
