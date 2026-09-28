/**
 * SkillBase - Authentication & User Session Management
 * Skill-Matching Platform Implementation
 */

// Helper to show inline alerts in form containers
function showAlert(elementId, message, type = 'danger') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = message;
  el.style.display = 'block';
}

function hideAlert(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = 'none';
}

// Redirect if already logged in (used on login & register pages)
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    if (user.role === 'provider') {
      window.location.href = 'provider.html';
    } else {
      window.location.href = 'seeker.html';
    }
  }
}

// Ensure the page is protected for a specific role or logged-in user
function requireAuth(allowedRole = null) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (allowedRole && user.role !== allowedRole) {
    // If logged in as wrong role, redirect to their proper dashboard
    if (user.role === 'provider') {
      window.location.href = 'provider.html';
    } else {
      window.location.href = 'seeker.html';
    }
    return null;
  }
  return user;
}

// Logout current user
function logoutUser() {
  clearCurrentUser();
  window.location.href = 'login.html';
}

// Registration logic
function initRegisterPage() {
  redirectIfLoggedIn();

  const registerForm = document.getElementById('registerForm');
  const roleRadios = document.querySelectorAll('input[name="userRole"]');
  const providerFields = document.getElementById('providerFields');
  const seekerFields = document.getElementById('seekerFields');

  // Check URL query param for default selection (e.g. ?type=provider or ?type=seeker)
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (typeParam === 'seeker') {
    const seekerRadio = document.querySelector('input[name="userRole"][value="seeker"]');
    if (seekerRadio) seekerRadio.checked = true;
  } else if (typeParam === 'provider') {
    const providerRadio = document.querySelector('input[name="userRole"][value="provider"]');
    if (providerRadio) providerRadio.checked = true;
  }

  // Toggle field visibility depending on selected user type
  function toggleFields() {
    const selected = document.querySelector('input[name="userRole"]:checked');
    if (!selected) return;

    if (selected.value === 'provider') {
      providerFields.style.display = 'block';
      seekerFields.style.display = 'none';
    } else {
      providerFields.style.display = 'none';
      seekerFields.style.display = 'block';
    }
  }

  roleRadios.forEach(radio => radio.addEventListener('change', toggleFields));
  toggleFields(); // Initial run

  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert('registerAlert');

      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const role = document.querySelector('input[name="userRole"]:checked').value;

      if (!name || !email || !password) {
        showAlert('registerAlert', 'Please fill in all basic required fields.');
        return;
      }

      // Check if email already registered
      const existing = getUserByEmail(email);
      if (existing) {
        showAlert('registerAlert', 'An account with this email address already exists. Please login.');
        return;
      }

      let newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toISOString().split('T')[0]
      };

      if (role === 'provider') {
        const skillsRaw = document.getElementById('regSkills').value.trim();
        const experience = document.getElementById('regExperience').value.trim();
        const location = document.getElementById('regLocation').value.trim();
        const description = document.getElementById('regDescription').value.trim();

        if (!skillsRaw) {
          showAlert('registerAlert', 'Please enter at least one skill.');
          return;
        }

        // Split skills by commas
        const skillsArray = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);

        newUser = {
          ...newUser,
          skills: skillsArray,
          experience: experience || 'Entry Level',
          location: location || 'Not Specified',
          description: description || 'Skill provider on SkillBase'
        };
      } else {
        // Seeker
        const reqSkill = document.getElementById('regReqSkill').value.trim();
        const location = document.getElementById('regSeekerLocation').value.trim();
        const reqDescription = document.getElementById('regReqDescription').value.trim();
        const budget = document.getElementById('regBudget').value.trim();

        if (!reqSkill) {
          showAlert('registerAlert', 'Please specify the skill you are looking for.');
          return;
        }

        newUser = {
          ...newUser,
          requiredSkill: reqSkill,
          location: location || 'Not Specified',
          description: reqDescription || 'Looking for skilled talent on SkillBase',
          budget: budget || 'Negotiable'
        };
      }

      // Save user to LocalStorage
      saveUser(newUser);

      // Auto login
      setCurrentUser(newUser);

      showAlert('registerAlert', 'Registration successful! Redirecting to your dashboard...', 'success');

      setTimeout(() => {
        if (role === 'provider') {
          window.location.href = 'provider.html';
        } else {
          window.location.href = 'seeker.html';
        }
      }, 1000);
    });
  }
}

// Login logic
function initLoginPage() {
  redirectIfLoggedIn();

  const loginForm = document.getElementById('loginForm');
  const roleRadios = document.querySelectorAll('input[name="loginRole"]');

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert('loginAlert');

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const selectedRole = document.querySelector('input[name="loginRole"]:checked')?.value;

      if (!email || !password) {
        showAlert('loginAlert', 'Please provide both email and password.');
        return;
      }

      const user = getUserByEmail(email);

      if (!user) {
        showAlert('loginAlert', 'No account found with this email. Please register first.');
        return;
      }

      // Simple credential verification for demonstration
      if (user.password && user.password !== password) {
        showAlert('loginAlert', 'Incorrect password. (Hint: For demo accounts, try password123)');
        return;
      }

      // Check role if specified
      if (selectedRole && user.role !== selectedRole) {
        showAlert('loginAlert', `This account is registered as a ${user.role === 'provider' ? 'Skill Provider' : 'Skill Seeker'}. Please select the matching role.`);
        return;
      }

      // Successful login
      setCurrentUser(user);
      showAlert('loginAlert', 'Login successful! Redirecting...', 'success');

      setTimeout(() => {
        if (user.role === 'provider') {
          window.location.href = 'provider.html';
        } else {
          window.location.href = 'seeker.html';
        }
      }, 800);
    });
  }

  // Quick fill helper buttons for demo testing
  const quickProviderBtn = document.getElementById('quickProviderDemo');
  const quickSeekerBtn = document.getElementById('quickSeekerDemo');

  if (quickProviderBtn) {
    quickProviderBtn.addEventListener('click', () => {
      document.getElementById('loginEmail').value = 'rahul@example.com';
      document.getElementById('loginPassword').value = 'password123';
      const r = document.querySelector('input[name="loginRole"][value="provider"]');
      if (r) r.checked = true;
    });
  }

  if (quickSeekerBtn) {
    quickSeekerBtn.addEventListener('click', () => {
      document.getElementById('loginEmail').value = 'techfest@example.com';
      document.getElementById('loginPassword').value = 'password123';
      const r = document.querySelector('input[name="loginRole"][value="seeker"]');
      if (r) r.checked = true;
    });
  }
}
