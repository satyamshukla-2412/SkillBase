/**
 * SkillBase - Skill Matching & Discovery Logic
 * Skill-Matching Platform Implementation
 * Features deterministic manual matching algorithm
 */

document.addEventListener('DOMContentLoaded', function () {
  initMatchingPage();
});

let currentMode = 'providers'; // 'providers' or 'requirements'

function initMatchingPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const skillParam = urlParams.get('skill') || '';
  const locationParam = urlParams.get('location') || '';
  const modeParam = urlParams.get('mode') || 'providers';

  currentMode = modeParam;

  const skillInput = document.getElementById('filterSkillInput');
  const locationInput = document.getElementById('filterLocationInput');
  const filterForm = document.getElementById('matchFilterForm');
  const resetBtn = document.getElementById('resetFilterBtn');
  const loadMyReqBtn = document.getElementById('loadMyReqBtn');
  const tabProvidersBtn = document.getElementById('tabProvidersBtn');
  const tabRequirementsBtn = document.getElementById('tabRequirementsBtn');

  if (skillInput && skillParam) skillInput.value = skillParam;
  if (locationInput && locationParam) locationInput.value = locationParam;

  // Tab switching
  if (tabProvidersBtn && tabRequirementsBtn) {
    function updateTabs() {
      if (currentMode === 'providers') {
        tabProvidersBtn.className = 'btn btn-primary btn-sm';
        tabRequirementsBtn.className = 'btn btn-secondary btn-sm';
      } else {
        tabProvidersBtn.className = 'btn btn-secondary btn-sm';
        tabRequirementsBtn.className = 'btn btn-primary btn-sm';
      }
    }

    tabProvidersBtn.addEventListener('click', function () {
      currentMode = 'providers';
      updateTabs();
      executeMatchSearch();
    });

    tabRequirementsBtn.addEventListener('click', function () {
      currentMode = 'requirements';
      updateTabs();
      executeMatchSearch();
    });

    updateTabs();
  }

  // Check if current user is seeker to enable "Load My Requirement" button
  const currentUser = getCurrentUser();
  if (loadMyReqBtn) {
    if (currentUser && currentUser.role === 'seeker') {
      loadMyReqBtn.style.display = 'inline-block';
      loadMyReqBtn.addEventListener('click', function () {
        if (skillInput) skillInput.value = currentUser.requiredSkill || '';
        if (locationInput) locationInput.value = currentUser.location || '';
        currentMode = 'providers';
        if (tabProvidersBtn && tabRequirementsBtn) {
          tabProvidersBtn.className = 'btn btn-primary btn-sm';
          tabRequirementsBtn.className = 'btn btn-secondary btn-sm';
        }
        executeMatchSearch();
      });
    } else if (currentUser && currentUser.role === 'provider') {
      loadMyReqBtn.style.display = 'inline-block';
      loadMyReqBtn.textContent = 'Load My Skills Criteria';
      loadMyReqBtn.addEventListener('click', function () {
        currentMode = 'requirements';
        if (tabProvidersBtn && tabRequirementsBtn) {
          tabProvidersBtn.className = 'btn btn-secondary btn-sm';
          tabRequirementsBtn.className = 'btn btn-primary btn-sm';
        }
        if (locationInput) locationInput.value = currentUser.location || '';
        executeMatchSearch();
      });
    } else {
      loadMyReqBtn.style.display = 'none';
    }
  }

  // Handle filter submission
  if (filterForm) {
    filterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      executeMatchSearch();
    });
  }

  // Handle reset
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (skillInput) skillInput.value = '';
      if (locationInput) locationInput.value = '';
      executeMatchSearch();
    });
  }

  // Execute initial match search
  executeMatchSearch();
}

function executeMatchSearch() {
  const skill = (document.getElementById('filterSkillInput')?.value || '').trim();
  const location = (document.getElementById('filterLocationInput')?.value || '').trim();
  const resultsContainer = document.getElementById('matchResultsContainer');
  const resultsCount = document.getElementById('matchResultsCount');
  const querySummary = document.getElementById('matchQuerySummary');
  const currentUser = getCurrentUser();

  if (!resultsContainer) return;

  if (currentMode === 'providers') {
    // Mode 1: Search Providers
    const matches = findMatches({ skill, location });

    if (resultsCount) {
      resultsCount.textContent = `${matches.length} Skill Provider${matches.length === 1 ? '' : 's'} Found`;
    }

    if (querySummary) {
      if (skill && location) {
        querySummary.textContent = `Showing providers matching skill "${skill}" and location "${location}"`;
      } else if (skill) {
        querySummary.textContent = `Showing providers with skill matching "${skill}"`;
      } else if (location) {
        querySummary.textContent = `Showing providers in location "${location}"`;
      } else {
        querySummary.textContent = 'Showing all available Skill Providers in database';
      }
    }

    resultsContainer.innerHTML = '';

    if (matches.length === 0) {
      renderEmptyState(resultsContainer, 'No Matching Providers Found', 'Try adjusting your search criteria, searching for a broader skill keyword (e.g. "Web", "Python", "Design"), or clearing the location filter.');
      return;
    }

    matches.forEach(item => {
      const provider = item.provider;
      const card = document.createElement('div');
      card.className = 'match-card';

      let badgeHtml = '';
      if (item.score >= 15) {
        badgeHtml = `<span class="badge badge-success">Top Match (Skill + Location)</span>`;
      } else if (item.matchedSkills.length > 0) {
        badgeHtml = `<span class="badge badge-primary">Skill Match</span>`;
      } else if (item.hasLocationMatch) {
        badgeHtml = `<span class="badge badge-warning">Location Match</span>`;
      } else {
        badgeHtml = `<span class="badge" style="background-color: #f3f4f6; color: #4b5563;">Available Provider</span>`;
      }

      const skillsList = Array.isArray(provider.skills) ? provider.skills : [];
      const skillTagsHtml = skillsList.map(s => {
        const isMatched = item.matchedSkills.includes(s);
        return `<span class="skill-tag" style="${isMatched ? 'background-color: #e0f2fe; border-color: #7dd3fc; font-weight: 600;' : ''}">${s}</span>`;
      }).join(' ');

      card.innerHTML = `
        <div class="match-header">
          <div>
            <h3 style="margin-bottom: 4px;">${provider.name}</h3>
            <span style="font-size: 0.88rem; color: var(--text-muted);">
              Location: <strong>${provider.location || 'Not Specified'}</strong> &bull; Experience: <strong>${provider.experience || 'Entry Level'}</strong>
            </span>
          </div>
          <div>
            ${badgeHtml}
          </div>
        </div>

        <p style="margin-bottom: 6px; font-size: 0.92rem; color: var(--text-dark);">
          ${provider.description || 'Skill provider on SkillBase'}
        </p>

        <div>
          <div style="font-size: 0.82rem; font-weight: 600; color: var(--secondary-color); margin-bottom: 4px;">Skills:</div>
          <div class="skill-tags" style="margin-top: 2px;">
            ${skillTagsHtml}
          </div>
        </div>

        <div class="match-actions">
          <a href="profile.html?id=${provider.id}" class="btn btn-secondary btn-sm">View Profile</a>
          <button class="btn btn-primary btn-sm contact-match-btn" data-id="${provider.id}">Contact</button>
        </div>
      `;

      resultsContainer.appendChild(card);
    });
  } else {
    // Mode 2: Search Project Requirements
    const providerSkills = (currentUser && currentUser.role === 'provider' && Array.isArray(currentUser.skills)) ? currentUser.skills : [];
    const matches = findRequirementMatches({ skill, location, skills: providerSkills });

    if (resultsCount) {
      resultsCount.textContent = `${matches.length} Project Requirement${matches.length === 1 ? '' : 's'} Found`;
    }

    if (querySummary) {
      if (skill && location) {
        querySummary.textContent = `Showing projects requiring skill "${skill}" and location "${location}"`;
      } else if (skill) {
        querySummary.textContent = `Showing projects requiring skill "${skill}"`;
      } else if (location) {
        querySummary.textContent = `Showing projects in location "${location}"`;
      } else {
        querySummary.textContent = 'Showing all open Project Requirements posted by Seekers';
      }
    }

    resultsContainer.innerHTML = '';

    if (matches.length === 0) {
      renderEmptyState(resultsContainer, 'No Matching Projects Found', 'There are no active requirements matching your filter criteria. Try clearing the filters.');
      return;
    }

    matches.forEach(item => {
      const seeker = item.seeker;
      const card = document.createElement('div');
      card.className = 'match-card';

      let badgeHtml = '';
      if (item.score >= 15) {
        badgeHtml = `<span class="badge badge-success">Top Match (Skill + Location)</span>`;
      } else if (item.hasLocationMatch) {
        badgeHtml = `<span class="badge badge-warning">Location Match</span>`;
      } else {
        badgeHtml = `<span class="badge badge-primary">Open Opportunity</span>`;
      }

      card.innerHTML = `
        <div class="match-header">
          <div>
            <h3 style="margin-bottom: 4px;">${seeker.name}</h3>
            <span style="font-size: 0.88rem; color: var(--text-muted);">
              Location: <strong>${seeker.location || 'Not Specified'}</strong> &bull; Budget: <strong>${seeker.budget || 'Negotiable'}</strong>
            </span>
          </div>
          <div>
            ${badgeHtml}
          </div>
        </div>

        <div style="margin: 4px 0;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--secondary-color);">Required Skill:</span>
          <span class="badge badge-primary" style="margin-left: 6px;">${seeker.requiredSkill || 'General'}</span>
        </div>

        <p style="margin-bottom: 6px; font-size: 0.92rem; color: var(--text-dark);">
          ${seeker.description || 'Project looking for talented collaborators.'}
        </p>

        <div class="match-actions">
          <a href="profile.html?id=${seeker.id}" class="btn btn-secondary btn-sm">View Details</a>
          <button class="btn btn-primary btn-sm contact-match-btn" data-id="${seeker.id}">Contact Seeker</button>
        </div>
      `;

      resultsContainer.appendChild(card);
    });
  }

  // Attach contact button listeners
  resultsContainer.querySelectorAll('.contact-match-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-id');
      const targetUser = getUserById(targetId);
      if (targetUser) {
        openContactModalForUser(targetUser);
      }
    });
  });
}

function renderEmptyState(container, title, message) {
  container.innerHTML = `
    <div class="card" style="text-align: center; padding: 40px 20px;">
      <h3 style="color: var(--secondary-color); margin-bottom: 8px;">${title}</h3>
      <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 16px auto;">${message}</p>
      <button id="clearFiltersEmptyBtn" class="btn btn-secondary btn-sm">Clear All Filters</button>
    </div>
  `;
  const clearBtn = document.getElementById('clearFiltersEmptyBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.getElementById('filterSkillInput').value = '';
      document.getElementById('filterLocationInput').value = '';
      executeMatchSearch();
    });
  }
}
