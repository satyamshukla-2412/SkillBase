/**
 * SkillBase - Main Global Scripts & Navigation
 * Skill-Matching Platform Implementation
 */

document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupContactModal();
});

// Setup dynamic navigation items and mobile toggle
function setupNavigation() {
  const currentUser = getCurrentUser();
  const navAuthContainer = document.getElementById('navAuthContainer');
  const navMobileToggle = document.getElementById('navToggleBtn');
  const navLinksList = document.getElementById('navLinksList');

  // Mobile menu toggle
  if (navMobileToggle && navLinksList) {
    navMobileToggle.addEventListener('click', function () {
      navLinksList.classList.toggle('active');
    });
  }

  // Update navbar items depending on login state
  if (navAuthContainer) {
    if (currentUser) {
      const dashboardLink = currentUser.role === 'provider' ? 'provider.html' : 'seeker.html';
      const roleText = currentUser.role === 'provider' ? 'Provider' : 'Seeker';

      navAuthContainer.innerHTML = `
        <span style="font-size: 0.9rem; color: var(--secondary-color); margin-right: 8px;">
          Hi, <strong>${currentUser.name.split(' ')[0]}</strong> (${roleText})
        </span>
        <a href="${dashboardLink}" class="btn btn-outline btn-sm">Dashboard</a>
        <button id="logoutNavBtn" class="btn btn-secondary btn-sm" style="margin-left: 6px;">Logout</button>
      `;

      // Update hero CTA buttons if present
      const heroHaveBtn = document.getElementById('heroHaveSkillsBtn');
      const heroNeedBtn = document.getElementById('heroNeedSkillsBtn');
      if (heroHaveBtn) heroHaveBtn.href = currentUser.role === 'provider' ? 'provider.html' : 'matches.html';
      if (heroNeedBtn) heroNeedBtn.href = currentUser.role === 'seeker' ? 'seeker.html' : 'matches.html';

      const logoutBtn = document.getElementById('logoutNavBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          clearCurrentUser();
          window.location.href = 'index.html';
        });
      }
    } else {
      navAuthContainer.innerHTML = `
        <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
      `;
    }
  }
}

// Global Contact Modal Handler
let currentRecipientUser = null;

function setupContactModal() {
  const modalOverlay = document.getElementById('contactModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const contactForm = document.getElementById('contactForm');

  if (!modalOverlay) return;

  function closeModal() {
    modalOverlay.classList.remove('active');
    if (contactForm) contactForm.reset();
    const alertBox = document.getElementById('contactModalAlert');
    if (alertBox) alertBox.style.display = 'none';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close when clicking outside of modal card
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Handle contact form submission
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const senderName = document.getElementById('contactSenderName').value.trim();
      const senderEmail = document.getElementById('contactSenderEmail').value.trim();
      const messageText = document.getElementById('contactMessage').value.trim();
      const alertBox = document.getElementById('contactModalAlert');

      if (!senderName || !senderEmail || !messageText) {
        if (alertBox) {
          alertBox.className = 'alert alert-danger';
          alertBox.textContent = 'Please fill out all required fields.';
          alertBox.style.display = 'block';
        }
        return;
      }

      // Save message to storage
      const newMsg = {
        senderName: senderName,
        senderEmail: senderEmail,
        recipientId: currentRecipientUser ? currentRecipientUser.id : 'unknown',
        recipientName: currentRecipientUser ? currentRecipientUser.name : 'User',
        recipientRole: currentRecipientUser ? currentRecipientUser.role : '',
        message: messageText
      };

      saveMessage(newMsg);

      if (alertBox) {
        alertBox.className = 'alert alert-success';
        alertBox.textContent = 'Message sent successfully! The recipient has been notified.';
        alertBox.style.display = 'block';
      }

      setTimeout(() => {
        closeModal();
      }, 1500);
    });
  }
}

// Public helper to open contact modal for any specified user
function openContactModalForUser(targetUser) {
  const modalOverlay = document.getElementById('contactModal');
  const recipientNameSpan = document.getElementById('contactRecipientName');
  const senderNameInput = document.getElementById('contactSenderName');
  const senderEmailInput = document.getElementById('contactSenderEmail');

  if (!modalOverlay) return;

  currentRecipientUser = targetUser;

  if (recipientNameSpan) {
    recipientNameSpan.textContent = targetUser.name + (targetUser.role === 'provider' ? ' (Skill Provider)' : ' (Skill Seeker)');
  }

  // Pre-fill sender info if logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    if (senderNameInput) senderNameInput.value = currentUser.name;
    if (senderEmailInput) senderEmailInput.value = currentUser.email;
  }

  modalOverlay.classList.add('active');
}
