/**
 * SkillBase - LocalStorage Management & Data Persistence
 * Skill-Matching Platform Implementation
 */

// Keys used in localStorage
const STORAGE_KEYS = {
  USERS: 'skillbase_users',
  MESSAGES: 'skillbase_messages',
  CURRENT_USER: 'skillbase_current_user'
};

// Default seed data to ensure the platform is immediately testable and functional
const DEFAULT_USERS = [
  {
    id: 'user_prov_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    role: 'provider',
    skills: ['HTML', 'CSS', 'JavaScript', 'Web Development', 'React'],
    experience: '2 years',
    location: 'Mumbai',
    description: 'Frontend developer building responsive web applications and portals.',
    createdAt: '2026-02-15'
  },
  {
    id: 'user_prov_2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'password123',
    role: 'provider',
    skills: ['Figma', 'UI Design', 'Wireframing', 'Web Design', 'Graphic Design'],
    experience: '1.5 years',
    location: 'Pune',
    description: 'Passionate UI/UX designer focusing on clean user flows, accessibility, and modern interfaces.',
    createdAt: '2026-02-18'
  },
  {
    id: 'user_prov_3',
    name: 'Aman Verma',
    email: 'aman@example.com',
    password: 'password123',
    role: 'provider',
    skills: ['Python', 'SQL', 'Data Analysis', 'Pandas', 'Machine Learning'],
    experience: '1 year',
    location: 'Delhi',
    description: 'Data specialist skilled in statistical data analysis, automated data workflows, and reporting.',
    createdAt: '2026-02-20'
  },
  {
    id: 'user_prov_4',
    name: 'Sneha Roy',
    email: 'sneha@example.com',
    password: 'password123',
    role: 'provider',
    skills: ['Content Writing', 'SEO', 'Technical Writing', 'Copywriting', 'Blogging'],
    experience: '3 years',
    location: 'Bangalore',
    description: 'Freelance technical writer creating clear software documentation, blog posts, and articles.',
    createdAt: '2026-02-22'
  },
  {
    id: 'user_prov_5',
    name: 'Rohan Gupta',
    email: 'rohan@example.com',
    password: 'password123',
    role: 'provider',
    skills: ['Flutter', 'Java', 'Android', 'Mobile App Development', 'Firebase'],
    experience: '2 years',
    location: 'Mumbai',
    description: 'Experienced mobile app developer who has published 3 apps on the Google Play Store.',
    createdAt: '2026-02-25'
  },
  {
    id: 'user_seek_1',
    name: 'TechFest Committee',
    email: 'techfest@example.com',
    password: 'password123',
    role: 'seeker',
    requiredSkill: 'Web Development',
    location: 'Mumbai',
    description: 'Need a competent frontend web developer to build our annual festival schedule, events catalog, and participant registration portal.',
    budget: '₹8,000 / Project',
    createdAt: '2026-02-10'
  },
  {
    id: 'user_seek_2',
    name: 'GreenCampus NGO',
    email: 'greencampus@example.com',
    password: 'password123',
    role: 'seeker',
    requiredSkill: 'UI Design',
    location: 'Pune',
    description: 'Looking for a designer to create event posters, social media banners, and UI wireframes for our plantation tracking app.',
    budget: '₹4,000 / Project',
    createdAt: '2026-02-12'
  },
  {
    id: 'user_seek_3',
    name: 'Startup Incubator',
    email: 'incubator@example.com',
    password: 'password123',
    role: 'seeker',
    requiredSkill: 'Python',
    location: 'Delhi',
    description: 'Seeking a coder to write data extraction scripts and build automated spreadsheets for survey responses.',
    budget: '₹6,000 / Project',
    createdAt: '2026-02-14'
  }
];

// Initialize storage with sample data if first time
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
}

// User CRUD functions
function getUsers() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  } catch (e) {
    console.error('Error parsing users from storage', e);
    return [];
  }
}

function getUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

function getUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

function saveUser(user) {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // If updating the currently logged-in user, refresh currentUser in storage
  const current = getCurrentUser();
  if (current && current.id === user.id) {
    setCurrentUser(user);
  }
  return user;
}

function deleteUser(id) {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Current session user functions
function getCurrentUser() {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Profile management helpers
function saveProfile(profileData) {
  const current = getCurrentUser();
  if (!current) return null;
  const updatedUser = { ...current, ...profileData };
  return saveUser(updatedUser);
}

function getProfile(userId) {
  if (userId) {
    return getUserById(userId);
  }
  return getCurrentUser();
}

// Requirement management helpers (for seekers)
function saveRequirement(reqData) {
  const current = getCurrentUser();
  if (!current || current.role !== 'seeker') return null;
  const updatedUser = { ...current, ...reqData };
  return saveUser(updatedUser);
}

function getRequirements() {
  return getUsers().filter(u => u.role === 'seeker');
}

// Messages helpers
function getMessages() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
  } catch (e) {
    return [];
  }
}

function saveMessage(message) {
  const messages = getMessages();
  const newMsg = {
    id: 'msg_' + Date.now(),
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    ...message
  };
  messages.unshift(newMsg);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  return newMsg;
}

// Core Matching Algorithm (Manually coded, deterministic)
// Matches a Seeker requirement with Skill Providers
function findMatches(criteria = {}) {
  const users = getUsers();
  const providers = users.filter(u => u.role === 'provider');
  const targetSkill = (criteria.skill || '').trim().toLowerCase();
  const targetLocation = (criteria.location || '').trim().toLowerCase();

  const results = [];

  providers.forEach(provider => {
    let skillScore = 0;
    let locationScore = 0;
    const matchedSkills = [];

    const providerSkills = Array.isArray(provider.skills) ? provider.skills : [];

    // Check skill match
    if (targetSkill) {
      providerSkills.forEach(s => {
        const sLower = s.toLowerCase();
        if (sLower.includes(targetSkill) || targetSkill.includes(sLower)) {
          skillScore += 10;
          matchedSkills.push(s);
        }
      });
    } else {
      // If no target skill entered, include all providers with baseline score
      skillScore = 5;
    }

    // Check location bonus match
    if (targetLocation && provider.location) {
      if (provider.location.toLowerCase().includes(targetLocation) || targetLocation.includes(provider.location.toLowerCase())) {
        locationScore = 5;
      }
    }

    const totalScore = skillScore + locationScore;

    // If matches criteria (or general browse)
    if (!targetSkill || skillScore > 0) {
      results.push({
        provider: provider,
        score: totalScore,
        hasLocationMatch: locationScore > 0,
        matchedSkills: matchedSkills
      });
    }
  });

  // Sort: highest score first, then by location match
  results.sort((a, b) => b.score - a.score);

  return results;
}

// Matches Provider skills against Seeker requirements
function findRequirementMatches(criteria = {}) {
  const users = getUsers();
  const seekers = users.filter(u => u.role === 'seeker');
  const providerSkills = Array.isArray(criteria.skills) ? criteria.skills.map(s => s.toLowerCase()) : [];
  const targetSkill = (criteria.skill || '').trim().toLowerCase();
  const targetLocation = (criteria.location || '').trim().toLowerCase();

  const results = [];

  seekers.forEach(seeker => {
    let skillScore = 0;
    let locationScore = 0;
    const reqSkill = (seeker.requiredSkill || '').toLowerCase();

    // Check against specific filter query or provider's skill set
    if (targetSkill) {
      if (reqSkill.includes(targetSkill) || targetSkill.includes(reqSkill)) {
        skillScore += 10;
      }
    } else if (providerSkills.length > 0) {
      providerSkills.forEach(ps => {
        if (reqSkill.includes(ps) || ps.includes(reqSkill)) {
          skillScore += 10;
        }
      });
    } else {
      skillScore = 5; // General browse
    }

    // Check location
    if (targetLocation && seeker.location) {
      if (seeker.location.toLowerCase().includes(targetLocation) || targetLocation.includes(seeker.location.toLowerCase())) {
        locationScore = 5;
      }
    }

    const totalScore = skillScore + locationScore;

    if (!targetSkill && providerSkills.length === 0 || skillScore > 0) {
      results.push({
        seeker: seeker,
        score: totalScore,
        hasLocationMatch: locationScore > 0
      });
    }
  });

  results.sort((a, b) => b.score - a.score);
  return results;
}

// Auto-run initialization on load
initStorage();
