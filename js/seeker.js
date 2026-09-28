/**
 * SkillBase - Skill Seeker Dashboard Logic
 * Skill-Matching Platform Implementation
 */

document.addEventListener('DOMContentLoaded', function () {
  const user = requireAuth('seeker');
  if (!user) return;

  renderSeekerDashboard();
  setupEditRequirementModal();
  setupQuickSearch();
  renderSentInquiries();
});

// Render seeker requirement card and details
function renderSeekerDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  const welcomeName = document.getElementById('seekerWelcomeName');
  if (welcomeName) welcomeName.textContent = user.name;

  const orgNameEl = document.getElementById('reqOrgName');
  const skillEl = document.getElementById('reqSkill');
  const locationEl = document.getElementById('reqLocation');
  const budgetEl = document.getElementById('reqBudget');
  const descEl = document.getElementById('reqDescription');

  if (orgNameEl) orgNameEl.textContent = user.name;
  if (skillEl) skillEl.textContent = user.requiredSkill || 'Not Specified';
  if (locationEl) locationEl.textContent = user.location || 'Not Specified';
  if (budgetEl) budgetEl.textContent = user.budget || 'Negotiable';
  if (descEl) descEl.textContent = user.description || 'No description provided.';

  // Update direct link for "View Matches for My Requirement"
  const viewMyMatchesBtn = document.getElementById('viewMyMatchesBtn');
  if (viewMyMatchesBtn) {
    const skillParam = encodeURIComponent(user.requiredSkill || '');
    const locParam = encodeURIComponent(user.location || '');
    viewMyMatchesBtn.href = `matches.html?skill=${skillParam}&location=${locParam}`;
  }
}

// Edit Requirement Modal
function setupEditRequirementModal() {
  const editBtn = document.getElementById('editRequirementBtn');
  const modal = document.getElementById('editRequirementModal');
  const closeBtn = document.getElementById('closeEditReqModalBtn');
  const cancelBtn = document.getElementById('cancelEditReqModalBtn');
  const form = document.getElementById('editRequirementForm');

  if (!modal) return;

  function openModal() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('editReqOrgName').value = user.name || '';
    document.getElementById('editReqSkill').value = user.requiredSkill || '';
    document.getElementById('editReqLocation').value = user.location || '';
    document.getElementById('editReqBudget').value = user.budget || '';
    document.getElementById('editReqDescription').value = user.description || '';

    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  if (editBtn) editBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const user = getCurrentUser();
      if (!user) return;

      user.name = document.getElementById('editReqOrgName').value.trim();
      user.requiredSkill = document.getElementById('editReqSkill').value.trim();
      user.location = document.getElementById('editReqLocation').value.trim();
      user.budget = document.getElementById('editReqBudget').value.trim();
      user.description = document.getElementById('editReqDescription').value.trim();

      saveUser(user);
      closeModal();
      renderSeekerDashboard();
      setupNavigation();
    });
  }
}

// Quick Search from Seeker dashboard
function setupQuickSearch() {
  const searchForm = document.getElementById('seekerSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const skill = document.getElementById('searchSkillInput').value.trim();
      const location = document.getElementById('searchLocationInput').value.trim();

      const params = new URLSearchParams();
      if (skill) params.append('skill', skill);
      if (location) params.append('location', location);

      window.location.href = `matches.html?${params.toString()}`;
    });
  }
}

// Render log of inquiries this seeker sent
function renderSentInquiries() {
  const listContainer = document.getElementById('seekerInquiriesList');
  if (!listContainer) return;

  const user = getCurrentUser();
  if (!user) return;

  const allMessages = getMessages();
  // Filter messages sent by this seeker's email
  const mySent = allMessages.filter(m => m.senderEmail && m.senderEmail.toLowerCase() === user.email.toLowerCase());

  if (mySent.length === 0) {
    listContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">You have not sent any inquiries to providers yet. Click "Search Providers" or "View Matches" to browse and contact talent.</p>';
    return;
  }

  listContainer.innerHTML = '';
  mySent.forEach(msg => {
    const item = document.createElement('div');
    item.style.backgroundColor = 'var(--bg-light)';
    item.style.border = '1px solid var(--border-color)';
    item.style.borderRadius = 'var(--radius-sm)';
    item.style.padding = '12px 14px';
    item.style.marginBottom = '10px';

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85rem;">
        <strong>To: ${msg.recipientName}</strong>
        <span style="color: var(--text-muted);">${msg.date}</span>
      </div>
      <p style="margin: 0; font-size: 0.9rem; color: var(--text-dark);">${msg.message}</p>
    `;
    listContainer.appendChild(item);
  });
}
