/**
 * SkillBase - Skill Provider Dashboard Logic
 * Skill-Matching Platform Implementation
 */

document.addEventListener('DOMContentLoaded', function () {
  const user = requireAuth('provider');
  if (!user) return;

  renderProviderDashboard();
  setupAddSkill();
  setupEditProfileModal();
  renderReceivedMessages();
});

// Render the main provider profile details
function renderProviderDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  // Welcome banner
  const welcomeName = document.getElementById('providerWelcomeName');
  if (welcomeName) welcomeName.textContent = user.name;

  // Profile fields
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const locationEl = document.getElementById('profileLocation');
  const expEl = document.getElementById('profileExperience');
  const descEl = document.getElementById('profileDescription');
  const skillCountBadge = document.getElementById('providerSkillCountBadge');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (locationEl) locationEl.textContent = user.location || 'Not Specified';
  if (expEl) expEl.textContent = user.experience || 'Entry Level';
  if (descEl) descEl.textContent = user.description || 'No description provided yet.';

  const skills = Array.isArray(user.skills) ? user.skills : [];
  if (skillCountBadge) skillCountBadge.textContent = `${skills.length} Skills Listed`;

  renderSkillsList(skills);
}

// Render the list of skills as tags with remove buttons
function renderSkillsList(skills) {
  const container = document.getElementById('providerSkillsContainer');
  if (!container) return;

  container.innerHTML = '';

  if (skills.length === 0) {
    container.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem;">No skills added yet. Use the form below to add skills.</span>';
    return;
  }

  skills.forEach((skill, index) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      <span>${skill}</span>
      <span class="remove-btn" title="Remove skill" data-index="${index}">&times;</span>
    `;
    container.appendChild(tag);
  });

  // Attach event listeners to remove buttons
  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const idx = parseInt(this.getAttribute('data-index'), 10);
      removeSkill(idx);
    });
  });
}

// Add a new skill to current provider profile
function setupAddSkill() {
  const addSkillForm = document.getElementById('addSkillForm');
  const skillInput = document.getElementById('newSkillInput');

  if (addSkillForm) {
    addSkillForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = skillInput.value.trim();
      if (!val) return;

      const user = getCurrentUser();
      if (!user) return;

      const currentSkills = Array.isArray(user.skills) ? [...user.skills] : [];

      // Avoid exact duplicates
      if (currentSkills.some(s => s.toLowerCase() === val.toLowerCase())) {
        alert('This skill is already in your profile list.');
        return;
      }

      currentSkills.push(val);
      user.skills = currentSkills;
      saveUser(user);

      skillInput.value = '';
      renderProviderDashboard();
    });
  }
}

// Remove skill by index
function removeSkill(index) {
  const user = getCurrentUser();
  if (!user || !Array.isArray(user.skills)) return;

  user.skills.splice(index, 1);
  saveUser(user);
  renderProviderDashboard();
}

// Modal logic for editing basic provider profile info
function setupEditProfileModal() {
  const editBtn = document.getElementById('editProfileBtn');
  const modal = document.getElementById('editProfileModal');
  const closeBtn = document.getElementById('closeEditModalBtn');
  const cancelBtn = document.getElementById('cancelEditModalBtn');
  const form = document.getElementById('editProfileForm');

  if (!modal) return;

  function openEditModal() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('editName').value = user.name || '';
    document.getElementById('editExperience').value = user.experience || '';
    document.getElementById('editLocation').value = user.location || '';
    document.getElementById('editDescription').value = user.description || '';

    modal.classList.add('active');
  }

  function closeEditModal() {
    modal.classList.remove('active');
  }

  if (editBtn) editBtn.addEventListener('click', openEditModal);
  if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeEditModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const user = getCurrentUser();
      if (!user) return;

      user.name = document.getElementById('editName').value.trim();
      user.experience = document.getElementById('editExperience').value.trim();
      user.location = document.getElementById('editLocation').value.trim();
      user.description = document.getElementById('editDescription').value.trim();

      saveUser(user);
      closeEditModal();
      renderProviderDashboard();
      // Re-trigger global nav update for new name
      setupNavigation();
    });
  }
}

// Render inquiries/messages received by this provider
function renderReceivedMessages() {
  const listContainer = document.getElementById('providerMessagesList');
  if (!listContainer) return;

  const user = getCurrentUser();
  if (!user) return;

  const allMessages = getMessages();
  // Filter messages addressed to this provider or general
  const myMessages = allMessages.filter(m => m.recipientId === user.id);

  if (myMessages.length === 0) {
    listContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No inquiries received yet. Once seekers view your profile and contact you, inquiries will appear here.</p>';
    return;
  }

  listContainer.innerHTML = '';
  myMessages.forEach(msg => {
    const item = document.createElement('div');
    item.style.backgroundColor = 'var(--bg-light)';
    item.style.border = '1px solid var(--border-color)';
    item.style.borderRadius = 'var(--radius-sm)';
    item.style.padding = '12px 14px';
    item.style.marginBottom = '10px';

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem;">
        <strong>From: ${msg.senderName} (${msg.senderEmail})</strong>
        <span style="color: var(--text-muted);">${msg.date}</span>
      </div>
      <p style="margin: 0; font-size: 0.9rem; color: var(--text-dark);">${msg.message}</p>
    `;
    listContainer.appendChild(item);
  });
}
