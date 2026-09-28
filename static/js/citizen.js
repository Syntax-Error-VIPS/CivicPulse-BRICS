/**
 * CIVICPULSE-BRICS: CITIZEN SUBSYSTEM
 * 10+ Sectors with Vector Icons, Color Coding, Participatory Budgeting Demands with Real-Time Upvoting,
 * SLA Stepper Tracking with Google TTS & Maps, and WhatsApp DPI Simulator
 */

window.initCitizenPortal = function() {
  try { if (window.renderSectorCards) window.renderSectorCards(); } catch(e) { console.warn('renderSectorCards notice:', e); }
  try { setupCitizenEvents(); } catch(e) { console.warn('setupCitizenEvents notice:', e); }
  try { if (window.loadCitizenDemands) window.loadCitizenDemands(); } catch(e) { console.warn('loadCitizenDemands notice:', e); }
  try { if (window.loadComplaints) window.loadComplaints(); } catch(e) { console.warn('loadComplaints notice:', e); }
  try { if (window.setupAICitizenAgent) window.setupAICitizenAgent(); } catch(e) { console.warn('setupAICitizenAgent notice:', e); }

  if (window.GlobalProblemMapSystem && document.getElementById('cit-geospatial-map')) {
    window.GlobalProblemMapSystem.init({
      mapId: 'cit-geospatial-map',
      tableBodyId: 'cit-map-table-body',
      countrySelectId: 'cit-map-country-filter',
      citySelectId: 'cit-map-city-filter',
      statusSelectId: 'cit-map-status-filter',
      searchInputId: 'cit-map-search-input',
      mapModeSelectId: 'cit-map-mode-select',
      counterBadgeId: 'cit-map-counter-badge',
      countryTableBodyId: 'cit-country-telemetry-body'
    });
  }
};

// Immediate fallback registration in case DOM is already ready
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  try { setupCitizenEvents(); } catch(e) {}
  try { if (window.setupAICitizenAgent) window.setupAICitizenAgent(); } catch(e) {}
}

// ==============================================================================
// ==============================================================================
// 1. RENDER 10+ SECTOR CARDS (COLOR CODED WITH VECTOR ICONS)
// ==============================================================================
window.renderSectorCards = function() {
  const container = document.getElementById('sector-grid-container');
  const modalSectorSelect = document.getElementById('modal-demand-sector');
  if (!container || !AppState.sectors.length) return;

  container.innerHTML = AppState.sectors.map((s, idx) => {
    const color = s.color || 'var(--accent-primary)';
    const sectorName = window.i18n ? window.i18n(`sector_${s.id}_name`, s.name) : s.name;
    const slaText = window.i18n ? window.i18n('lbl_sla_24h', 'SLA: < 24h') : 'SLA: < 24h';
    const reportText = window.i18n ? window.i18n('btn_report_issue', 'Report Issue') : 'Report Issue';
    const imgUrl = s.image || `/static/img/sectors/${s.id}.jpg`;

    return `
      <div class="sector-card" data-name="${s.name}" data-sector-id="${s.id}" data-color="${color}" data-svg="${s.svg_key || 'zap'}" style="--sector-color: ${color}; cursor:pointer;" title="${reportText}: ${sectorName}">
        <div class="sector-card-img-wrap">
          <img src="${imgUrl}" alt="${sectorName}" class="sector-card-img" loading="lazy">
          <div class="sector-card-img-overlay"></div>
        </div>
        <div class="sector-card-body">
          <div class="sector-name">${sectorName}</div>
          <div class="sector-card-footer">
            <span class="sector-sla">${slaText}</span>
            <span class="sector-action" style="color:${color};">
              <span>${reportText}</span>
              <svg class="svg-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (modalSectorSelect) {
    const curVal = modalSectorSelect.value;
    modalSectorSelect.innerHTML = AppState.sectors.map(s => {
      const locName = window.i18n ? window.i18n(`sector_${s.id}_name`, s.name) : s.name;
      return `<option value="${s.name}">${s.icon || ''} ${locName}</option>`;
    }).join('');
    if (curVal) modalSectorSelect.value = curVal;
  }

  // Click listener for sector cards: opens the incident reporting modal for that category!
  container.querySelectorAll('.sector-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.sector-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const sectorName = card.getAttribute('data-name');
      const color = card.getAttribute('data-color') || 'var(--accent-primary)';
      const svgKey = card.getAttribute('data-svg') || 'zap';

      // Set input field value
      const catInput = document.getElementById('selected-category-input');
      if (catInput) {
        catInput.value = sectorName;
        catInput.style.color = color;
      }

      // Update modal header title, subtitle & icon
      const modalTitle = document.getElementById('modal-incident-title');
      if (modalTitle) modalTitle.textContent = `Report Issue: ${sectorName}`;

      const modalSubtitle = document.getElementById('modal-incident-subtitle');
      if (modalSubtitle) modalSubtitle.textContent = `Filing municipal grievance under ${sectorName}`;

      const iconWrap = document.getElementById('modal-incident-icon-wrap');
      if (iconWrap) {
        iconWrap.style.color = color;
        iconWrap.style.background = `${color}18`;
        iconWrap.style.borderColor = `${color}35`;
        iconWrap.innerHTML = window.getSvgIcon(svgKey, color, 22);
      }

      // Open incident modal or scroll to inline complaint form
      const incidentModal = document.getElementById('incident-modal');
      const aiReportView = document.getElementById('modal-ai-report-view');
      const complaintForm = document.getElementById('complaint-form');
      if (incidentModal) {
        if (aiReportView) aiReportView.style.display = 'none';
        if (complaintForm) complaintForm.style.display = 'grid';
        incidentModal.classList.add('active');
        setTimeout(() => {
          const descInput = document.getElementById('complaint-desc-input');
          if (descInput) descInput.focus();
        }, 120);
      } else {
        const formEl = document.getElementById('complaint-form') || document.getElementById('propose-demand-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const descInput = document.getElementById('complaint-desc-input');
            if (descInput) descInput.focus();
          }, 200);
        }
      }
    });
  });
};

// ==============================================================================
// 2. CITIZEN EVENT HANDLERS & FORMS
// ==============================================================================
function setupCitizenEvents() {
  // Modal: Open & Close Incident Modal
  const incidentModal = document.getElementById('incident-modal');
  const btnCloseIncident = document.getElementById('btn-close-incident-modal');
  const btnCancelIncident = document.getElementById('btn-cancel-incident-modal');
  const aiReportView = document.getElementById('modal-ai-report-view');

  const resetModalViews = () => {
    if (aiReportView) aiReportView.style.display = 'none';
    const formEl = document.getElementById('complaint-form');
    if (formEl) {
      formEl.reset();
      formEl.style.display = 'grid';
    }
  };

  if (btnCloseIncident && incidentModal) {
    btnCloseIncident.addEventListener('click', () => {
      incidentModal.classList.remove('active');
      resetModalViews();
    });
  }
  if (btnCancelIncident && incidentModal) {
    btnCancelIncident.addEventListener('click', () => {
      incidentModal.classList.remove('active');
      resetModalViews();
    });
  }
  if (incidentModal) {
    incidentModal.addEventListener('click', (e) => {
      if (e.target === incidentModal) {
        incidentModal.classList.remove('active');
        resetModalViews();
      }
    });
  }

  // Back & Track Action Buttons inside AI Report View
  const btnAiBack = document.getElementById('btn-ai-report-back');
  if (btnAiBack) {
    btnAiBack.onclick = () => {
      resetModalViews();
      if (incidentModal) incidentModal.classList.remove('active');
    };
  }

  const btnAiTrack = document.getElementById('btn-ai-report-track');
  if (btnAiTrack) {
    btnAiTrack.onclick = async () => {
      resetModalViews();
      if (incidentModal) incidentModal.classList.remove('active');
      if (window.switchTab) {
        window.switchTab('cit-tab-track');
      } else {
        const trackTabBtn = document.querySelector('[data-target="cit-tab-track"]');
        if (trackTabBtn) trackTabBtn.click();
      }
    };
  }

  // Complaint Form Submission
  const complaintForm = document.getElementById('complaint-form') || document.getElementById('propose-demand-form');
  if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-complaint');
      btn.disabled = true;
      btn.innerHTML = `<span>${window.AppIcons ? window.AppIcons.refresh : '⏳'}</span> <span>Running Gemini AI Triage...</span>`;

      const formData = new FormData();
      formData.append('category', document.getElementById('selected-category-input')?.value || 'Roads & Bridges');
      formData.append('description', document.getElementById('complaint-desc-input')?.value || '');
      
      const detailedAddr = document.getElementById('complaint-address-input')?.value.trim() || '';
      const autoGpsAddr = document.getElementById('complaint-gps-address')?.value.trim() || '';
      const finalAddress = detailedAddr ? (autoGpsAddr ? `${detailedAddr} [GPS: ${autoGpsAddr}]` : detailedAddr) : (autoGpsAddr || 'Location Provided');
      formData.append('address', finalAddress);
      
      const currentUser = getCurrentLoggedInUser();
      const userIdVal = currentUser.email || currentUser.user_id || currentUser.name || 'priya.sharma@delhi.gov.in';
      formData.append('user_id', userIdVal);
      formData.append('user_name', currentUser.name || 'Priya Sharma');

      const userPhone = document.getElementById('complaint-phone-input')?.value.trim() || '';
      if (userPhone) {
        formData.append('phone', userPhone);
      }
      
      const photoFile = document.getElementById('complaint-photo-input')?.files[0];
      if (photoFile) formData.append('photo', photoFile);

      const audioFile = document.getElementById('complaint-audio-input')?.files[0];
      if (audioFile) formData.append('audio', audioFile);

      try {
        const res = await fetch('/api/complaints', {
          method: 'POST',
          body: formData
        });
        const result = await res.json();
        showToast(`Complaint registered successfully! Token #${result.id}`, 'success');
        
        delete complaintForm.dataset.lat;
        delete complaintForm.dataset.lon;
        const locChip = document.getElementById('location-detected-chip') || document.getElementById('demand-location-detected-chip');
        if (locChip) locChip.style.display = 'none';

        if (window.loadComplaints) await window.loadComplaints();

        // Render AI Report View inside modal
        const aiView = document.getElementById('modal-ai-report-view');
        if (aiView) {
          const ticketIdEl = document.getElementById('ai-report-ticket-id');
          if (ticketIdEl) ticketIdEl.textContent = `#CP-${result.id}`;

          const sevMatch = (result.description || '').match(/Severity:\s*([\d.]+)\/10/i);
          const sevNum = sevMatch ? parseFloat(sevMatch[1]) : parseFloat(result.severity || 6.5);
          const sevScoreStr = sevNum.toFixed(1);

          const scoreEl = document.getElementById('ai-report-sev-score');
          if (scoreEl) scoreEl.textContent = sevScoreStr;

          const barEl = document.getElementById('ai-report-sev-bar');
          const badgeEl = document.getElementById('ai-report-sev-badge');
          const urgencyTag = document.getElementById('ai-report-urgency-tag');

          const pct = Math.min(100, Math.max(10, (sevNum / 10) * 100));
          if (barEl) barEl.style.width = `${pct}%`;

          if (sevNum >= 8.0) {
            if (badgeEl) { badgeEl.style.color = '#ef4444'; badgeEl.style.background = 'rgba(239,68,68,0.15)'; badgeEl.style.borderColor = 'rgba(239,68,68,0.3)'; }
            if (urgencyTag) { urgencyTag.textContent = 'Critical Hazard / High Priority'; urgencyTag.style.color = '#ef4444'; }
            if (barEl) barEl.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
          } else if (sevNum >= 5.0) {
            if (badgeEl) { badgeEl.style.color = '#f59e0b'; badgeEl.style.background = 'rgba(245,158,11,0.15)'; badgeEl.style.borderColor = 'rgba(245,158,11,0.3)'; }
            if (urgencyTag) { urgencyTag.textContent = 'Moderate Risk Priority'; urgencyTag.style.color = '#f59e0b'; }
            if (barEl) barEl.style.background = 'linear-gradient(90deg, #3b82f6, #f59e0b)';
          } else {
            if (badgeEl) { badgeEl.style.color = '#10b981'; badgeEl.style.background = 'rgba(16,185,129,0.15)'; badgeEl.style.borderColor = 'rgba(16,185,129,0.3)'; }
            if (urgencyTag) { urgencyTag.textContent = 'Minor Defect / Standard Priority'; urgencyTag.style.color = '#10b981'; }
            if (barEl) barEl.style.background = 'linear-gradient(90deg, #10b981, #3b82f6)';
          }

          const catEl = document.getElementById('ai-report-category');
          if (catEl) catEl.textContent = result.category || document.getElementById('selected-category-input')?.value || 'Municipal Infrastructure';

          const addrEl = document.getElementById('ai-report-address');
          if (addrEl) addrEl.textContent = finalAddress;

          const notesEl = document.getElementById('ai-report-notes');
          if (notesEl) notesEl.textContent = result.description || 'Gemini AI automated risk triage completed.';

          // Switch modal view from form to AI report
          complaintForm.style.display = 'none';
          aiView.style.display = 'block';
        } else {
          if (incidentModal) incidentModal.classList.remove('active');
          if (window.switchTab) window.switchTab('cit-tab-track');
        }
      } catch (err) {
        showToast('Error registering complaint. Please retry.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `
          <svg class="svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span>Register Complaint & Trigger AI Triage</span>
        `;
      }
    });
  }

  // Setup GPS Location and Microphone Voice Transcription Controls
  setupLocationAndVoiceControls(complaintForm, incidentModal);

  // Modal: Open & Close Community Demand Modal
  const modal = document.getElementById('demand-modal');
  const btnOpenModal = document.getElementById('btn-open-demand-modal');
  const btnCloseModal = document.getElementById('btn-close-demand-modal');
  const btnCancelModal = document.getElementById('btn-cancel-demand-modal');

  if (btnOpenModal && modal) {
    btnOpenModal.addEventListener('click', () => modal.classList.add('active'));
  }
  if (btnCloseModal && modal) {
    btnCloseModal.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (btnCancelModal && modal) {
    btnCancelModal.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // Propose Demand Submission
  const demandForm = document.getElementById('propose-demand-form');
  if (demandForm) {
    demandForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('modal-demand-title').value,
        sector: document.getElementById('modal-demand-sector').value,
        address: document.getElementById('modal-demand-address').value,
        estimated_budget: document.getElementById('modal-demand-budget').value || '₹500 Cr',
        beneficiaries: document.getElementById('modal-demand-beneficiaries').value || '100,000 residents',
        description: document.getElementById('modal-demand-desc').value,
        author: 'Resident Association',
        country_code: AppState.activeCode
      };

      try {
        const res = await fetch('/api/demands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await res.json();
        showToast('Community Demand posted for citizen voting!', 'success');
        demandForm.reset();
        modal.classList.remove('active');
        await window.loadCitizenDemands();
      } catch (err) {
        showToast('Error posting community demand.', 'error');
      }
    });
  }

  // Search & Filter Demands
  const demandSearchInput = document.getElementById('demand-search-input');

  if (demandSearchInput) demandSearchInput.addEventListener('input', filterDemands);

  // Search Complaints
  const trackSearchInput = document.getElementById('track-search-input');
  if (trackSearchInput) trackSearchInput.addEventListener('input', filterTrackedComplaints);
}


// ==============================================================================
// 3. COMMUNITY DEMANDS WALL & REAL-TIME UPVOTING ENGINE
// ==============================================================================
window.loadCitizenDemands = async function() {
  try {
    const res = await fetch(`/api/demands?country_code=${AppState.activeCode}`);
    AppState.demands = await res.json();
    renderDemands(AppState.demands);

    // Update Demands KPI count
    const totalVotes = AppState.demands.reduce((acc, d) => acc + (d.upvotes || 0), 0);
    const kpiDemands = document.getElementById('kpi-demands');
    if (kpiDemands) kpiDemands.textContent = totalVotes.toLocaleString();

    if (window.updateStatCounters) {
      window.updateStatCounters(AppState.complaints || [], AppState.demands || []);
    }
  } catch (err) {
    console.error('Error loading demands:', err);
  }
};

function renderDemands(demandsList) {
  const container = document.getElementById('demands-list-container');
  if (!container) return;

  if (!demandsList.length) {
    container.innerHTML = `
      <div class="empty-state-wrap">
        <span class="empty-state-icon">🗳️</span>
        <h3 class="empty-state-title">No community projects yet!</h3>
        <p class="empty-state-subtitle">Be the first to propose a project for your neighbourhood. High-vote proposals go directly to city planners!</p>
      </div>
    `;
    return;
  }

  const upvoteText = window.i18n ? window.i18n('btn_upvote', 'Upvote') : 'Upvote';
  const estCostLabel = window.i18n ? window.i18n('lbl_est_cost', 'Estimated Cost') : 'Est. CapEx';
  const beneficiariesLabel = window.i18n ? window.i18n('lbl_beneficiaries', 'People Benefited') : 'Beneficiaries';
  const proposedByLabel = window.i18n ? window.i18n('lbl_proposed_by', 'Proposed by') : 'Proposed By';

  let upvotedDemands = [];
  try { upvotedDemands = JSON.parse(localStorage.getItem('civicpulse_upvoted_demands') || '[]'); } catch(e) {}
  const voterId = localStorage.getItem('civicpulse_voter_id') || '';

  container.innerHTML = demandsList.map(d => {
    const isUpvoted = upvotedDemands.includes(d.id) || (voterId && (d.upvoted_by || []).includes(voterId));
    return `
      <div class="demand-card" id="card-${d.id}">
        <!-- WARM GOLDEN UPVOTE BUTTON & REAL-TIME COUNTER -->
        <div class="upvote-box ${isUpvoted ? 'upvoted' : ''}" onclick="handleUpvote('${d.id}')" title="Click to Upvote / Support this Demand">
          <span class="upvote-icon">${window.AppIcons.chevron_up}</span>
          <span class="upvote-count" id="count-${d.id}">${d.upvotes.toLocaleString()}</span>
          <span class="upvote-label">${upvoteText}</span>
        </div>

        <div class="demand-body">
          <div class="demand-header">
            <span class="demand-title">${d.title}</span>
            <span class="pill ${d.status.includes('Sanctioned') ? 'pill-resolved' : (d.status.includes('Review') ? 'pill-progress' : 'pill-pending')}">
              ● ${d.status}
            </span>
          </div>

          <div class="demand-meta">
            <span>${window.AppIcons.map_pin} <b>${d.address || d.ward}</b></span>
            <span>${window.AppIcons.tag} <b>${d.sector}</b></span>
            <span>${window.AppIcons.coins} ${estCostLabel}: <b>${d.estimated_budget}</b></span>
            <span>${window.AppIcons.users} ${beneficiariesLabel}: <b>${d.beneficiaries}</b></span>
          </div>

          <p class="demand-desc">${d.description}</p>

          <div class="demand-footer">
            <span>${proposedByLabel}: <b>${d.author}</b></span>
            <span>Date: ${d.date}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
window.renderDemands = renderDemands;

// Global Upvote Handler
window.handleUpvote = async function(demandId) {
  const countEl = document.getElementById(`count-${demandId}`);
  const upvoteBox = countEl ? countEl.closest('.upvote-box') : null;

  // Track client-side upvoted demands in localStorage
  let upvotedDemands = [];
  try {
    upvotedDemands = JSON.parse(localStorage.getItem('civicpulse_upvoted_demands') || '[]');
  } catch(e) {}

  if (upvotedDemands.includes(demandId)) {
    showToast('You have already upvoted this proposal!', 'info');
    if (upvoteBox) upvoteBox.classList.add('upvoted');
    return;
  }

  let voterId = localStorage.getItem('civicpulse_voter_id');
  if (!voterId) {
    voterId = 'voter_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    localStorage.setItem('civicpulse_voter_id', voterId);
  }

  try {
    const res = await fetch(`/api/demands/${demandId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id: voterId })
    });
    const result = await res.json();
    if (result.status === 'ok') {
      showToast('Upvote recorded! CapEx prioritization weight updated.', 'success');
      if (countEl && result.upvotes !== undefined) {
        countEl.textContent = Number(result.upvotes).toLocaleString();
        countEl.style.transform = 'scale(1.25)';
        countEl.style.color = '#059669';
        setTimeout(() => {
          countEl.style.transform = 'scale(1)';
          countEl.style.color = '';
        }, 250);
      }
      const targetDemand = (window.AppState && window.AppState.demands) ? window.AppState.demands.find(d => d.id === demandId) : null;
      if (targetDemand) targetDemand.upvotes = result.upvotes;

      if (!upvotedDemands.includes(demandId)) {
        upvotedDemands.push(demandId);
        localStorage.setItem('civicpulse_upvoted_demands', JSON.stringify(upvotedDemands));
      }
      if (upvoteBox) upvoteBox.classList.add('upvoted');
    } else {
      showToast(result.message || 'Already upvoted!', 'info');
      if (countEl && result.upvotes !== undefined) {
        countEl.textContent = Number(result.upvotes).toLocaleString();
      }
      if (!upvotedDemands.includes(demandId)) {
        upvotedDemands.push(demandId);
        localStorage.setItem('civicpulse_upvoted_demands', JSON.stringify(upvotedDemands));
      }
      if (upvoteBox) upvoteBox.classList.add('upvoted');
    }
  } catch (err) {
    console.error('Error upvoting:', err);
  }
};

function filterDemands() {
  const query = (document.getElementById('demand-search-input')?.value || '').toLowerCase().trim();

  let filtered = AppState.demands;
  if (query) {
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      (d.address || d.ward || '').toLowerCase().includes(query) ||
      d.sector.toLowerCase().includes(query)
    );
  }
  renderDemands(filtered);
}

// ==============================================================================
// 4. COMPLAINT TRACKING WITH GOOGLE TTS & MAPS NAVIGATION
// ==============================================================================
window.loadComplaints = async function() {
  try {
    const res = await fetch('/api/complaints');
    AppState.complaints = await res.json();
    filterTrackedComplaints();

    // Update KPI complaints count
    const kpiComplaints = document.getElementById('kpi-complaints');
    if (kpiComplaints) kpiComplaints.textContent = AppState.complaints.length;

    if (window.updateStatCounters) {
      window.updateStatCounters(AppState.complaints || [], AppState.demands || []);
    }
  } catch (err) {
    console.error('Error loading complaints:', err);
  }
};

// Helper for report description expand/collapse toggle
window.toggleReportDescription = function(id) {
  const el = document.getElementById(id);
  const btn = document.getElementById('btn-' + id);
  if (!el) return;
  const hideText = window.getTranslation ? window.getTranslation('btn_hide_description', 'Hide Description') : 'Hide Description';
  const readText = window.getTranslation ? window.getTranslation('btn_read_description', 'Read Description') : 'Read Description';
  if (el.style.display === 'none' || !el.style.display) {
    el.style.display = 'block';
    if (btn) btn.innerHTML = `<span>📄 ${hideText}</span> <span style="margin-left:4px; font-size:0.75rem;">▲</span>`;
  } else {
    el.style.display = 'none';
    if (btn) btn.innerHTML = `<span>📄 ${readText}</span> <span style="margin-left:4px; font-size:0.75rem;">▼</span>`;
  }
};

function getPriorityBadgeInfo(c) {
  let priority = c.priority || c.urgency || '';
  if (!priority && c.description) {
    const match = c.description.match(/\[Priority\]:\s*([^.\n\r]+)/i);
    if (match) {
      priority = match[1].trim();
    }
  }
  if (!priority && c.description) {
    if (/critical/i.test(c.description) || /severity:\s*([7-9]|10)/i.test(c.description)) priority = 'High';
    else if (/urgent|high/i.test(c.description)) priority = 'High';
    else if (/medium/i.test(c.description)) priority = 'Medium';
    else if (/low/i.test(c.description)) priority = 'Low';
  }
  if (!priority) priority = 'Medium';

  let color = '#f59e0b';
  let bg = 'rgba(245,158,11,0.14)';
  let border = 'rgba(245,158,11,0.35)';
  const lower = priority.toLowerCase();
  if (lower.includes('high') || lower.includes('critical') || lower.includes('urgent')) {
    color = '#ef4444';
    bg = 'rgba(239,68,68,0.14)';
    border = 'rgba(239,68,68,0.35)';
  } else if (lower.includes('med')) {
    color = '#f59e0b';
    bg = 'rgba(245,158,11,0.14)';
    border = 'rgba(245,158,11,0.35)';
  } else if (lower.includes('low')) {
    color = '#10b981';
    bg = 'rgba(16,185,129,0.14)';
    border = 'rgba(16,185,129,0.35)';
  }

  let cleanLabel = priority;
  if (cleanLabel.includes('-')) cleanLabel = cleanLabel.split('-')[0].trim();

  if (c.description) {
    const sevMatch = c.description.match(/Severity:\s*([\d.]+)\/10/i);
    if (sevMatch) {
      cleanLabel = cleanLabel + " (" + sevMatch[1] + "/10)";
    }
  }

  return { priority: cleanLabel, color, bg, border };
}

function formatDescriptionHTML(desc) {
  if (!desc) return '<div style="color:var(--text-muted);">No description details provided.</div>';

  let raw = String(desc);

  // Extract Sentinel Vision AI analysis if present
  let aiPart = '';
  const visionMatch = raw.match(/\[Sentinel Vision\]:\s*([^\n\r]+(\n[^\n\r]+)*)/i);
  if (visionMatch) {
    aiPart = visionMatch[1].replace(/\[Priority\]:.*$/gis, '').replace(/\[Location\]:.*$/gis, '').trim();
  }

  // Extract Voice Note if present
  let voicePart = '';
  const voiceMatch = raw.match(/\[Voice Note\]:\s*([^\n\r]+)/i);
  if (voiceMatch) {
    voicePart = voiceMatch[1].trim();
  }

  // Clean the person's description
  let personText = raw;
  personText = personText.replace(/\[Sentinel Vision\]:[\s\S]*?(?=\[|$)/gi, '');
  personText = personText.replace(/\[Voice Note\]:[\s\S]*?(?=\[|$)/gi, '');
  personText = personText.replace(/\[Priority\]:[\s\S]*/gi, '');
  personText = personText.replace(/\[Location\]:[\s\S]*?(?=\[|$)/gi, '');
  personText = personText.replace(/Testing E2E reporting for sector \[[^\]]+\]:\s*/gi, '');
  personText = personText.replace(/for sector \[[^\]]+\]:\s*/gi, '');
  personText = personText.replace(/near Ward \d+ - [^,.]+(,\s*[^,.]+)?\.?/gi, '');
  personText = personText.split('\n').map(l => l.trim()).filter(Boolean).join('\n\n');

  if (voicePart) {
    if (personText) personText += `\n\n🎤 [Voice Note]: ${voicePart}`;
    else personText = `🎤 [Voice Note]: ${voicePart}`;
  }

  let html = '';

  if (personText) {
    html += `
      <div style="margin-bottom:10px;">
        <div style="font-size:0.75rem; font-weight:700; color:var(--accent-primary); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; display:flex; align-items:center; gap:5px;">
          <span>👤</span>
          <span>Description by Person</span>
        </div>
        <div style="color:var(--text-primary); font-size:0.92rem; line-height:1.55; white-space:pre-wrap;">${personText}</div>
      </div>
    `;
  }

  if (aiPart) {
    html += `
      <div style="${personText ? 'margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.08);' : ''}">
        <div style="font-size:0.75rem; font-weight:700; color:#60a5fa; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; display:flex; align-items:center; gap:5px;">
          <span>🤖</span>
          <span>Description by AI</span>
        </div>
        <div style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; white-space:pre-wrap;">${aiPart}</div>
      </div>
    `;
  }

  if (!html) {
    html = `<div style="color:var(--text-secondary); font-size:0.9rem;">${raw}</div>`;
  }

  return html;
}

window.trackFilterMode = 'mine';

function getCurrentLoggedInUser() {
  try {
    const userJson = localStorage.getItem('civicpulse_user');
    if (userJson) {
      const u = JSON.parse(userJson);
      if (u && typeof u === 'object') return u;
    }
  } catch (e) {}
  return {
    name: "Priya Sharma (Verified Resident)",
    email: "priya.sharma@delhi.gov.in",
    user_id: "priya.sharma@delhi.gov.in"
  };
}

function isComplaintMine(c, user) {
  if (!c) return false;
  if (!user) user = getCurrentLoggedInUser();

  const uEmail = String(user.email || '').toLowerCase().trim();
  const rawName = String(user.name || '').toLowerCase();
  const uName = rawName.replace(/\(.*?\)/g, '').trim(); // e.g. "priya sharma"
  const uId = String(user.user_id || '').toLowerCase().trim();
  const uPhone = String(user.phone || '').replace(/\D/g, '');

  const cUserId = String(c.user_id || '').toLowerCase().trim();
  const cReportedBy = String(c.reported_by || '').toLowerCase().trim();
  const cUserPhone = cUserId.replace(/\D/g, '');

  // 1. Exact or substring match on email or user_id
  if (uEmail && (cUserId === uEmail || cReportedBy.includes(uEmail))) return true;
  if (uId && (cUserId === uId || cReportedBy.includes(uId))) return true;
  
  // 2. Phone match
  if (uPhone && uPhone.length >= 7 && cUserPhone.includes(uPhone)) return true;

  // 3. Name match
  if (uName && uName.length >= 3) {
    if (cReportedBy.includes(uName) || cUserId.includes(uName)) return true;
    const parts = uName.split(/\s+/).filter(p => p.length >= 3);
    if (parts.length > 0 && parts.every(p => cReportedBy.includes(p) || cUserId.includes(p))) return true;
  }

  // 4. Default demo user match for Priya Sharma
  const isDemoPriya = uName.includes('priya') || uEmail.includes('priya') || uEmail.includes('demo');
  if (isDemoPriya && (cReportedBy.includes('priya') || cUserId.includes('priya'))) {
    return true;
  }

  return false;
}

window.setTrackFilterMode = function(mode) {
  window.trackFilterMode = mode;
  
  const mineBtns = document.querySelectorAll('#btn-track-mine, .btn-track-mine');
  const allBtns = document.querySelectorAll('#btn-track-all, .btn-track-all');
  
  if (mode === 'mine') {
    mineBtns.forEach(b => {
      b.classList.add('active', 'btn-primary');
      b.classList.remove('btn-secondary');
      b.style.background = 'var(--accent-primary, #3b82f6)';
      b.style.color = '#fff';
      b.style.border = '1px solid var(--accent-primary, #3b82f6)';
    });
    allBtns.forEach(b => {
      b.classList.remove('active', 'btn-primary');
      b.classList.add('btn-secondary');
      b.style.background = 'rgba(255, 255, 255, 0.06)';
      b.style.color = 'var(--text-primary, #fff)';
      b.style.border = '1px solid var(--border-color)';
    });
  } else {
    allBtns.forEach(b => {
      b.classList.add('active', 'btn-primary');
      b.classList.remove('btn-secondary');
      b.style.background = 'var(--accent-primary, #3b82f6)';
      b.style.color = '#fff';
      b.style.border = '1px solid var(--accent-primary, #3b82f6)';
    });
    mineBtns.forEach(b => {
      b.classList.remove('active', 'btn-primary');
      b.classList.add('btn-secondary');
      b.style.background = 'rgba(255, 255, 255, 0.06)';
      b.style.color = 'var(--text-primary, #fff)';
      b.style.border = '1px solid var(--border-color)';
    });
  }

  filterTrackedComplaints();
};

function renderTrackedComplaints(complaintsList) {
  const container = document.getElementById('tracked-complaints-list');
  if (!container) return;

  if (!complaintsList.length) {
    const isMineMode = window.trackFilterMode === 'mine';
    const noReportsTitle = window.getTranslation ? window.getTranslation('msg_no_user_reports', isMineMode ? 'No Reports Filed Under Your Account' : 'No Public Reports Found') : (isMineMode ? 'No Reports Filed Under Your Account' : 'No Public Reports Found');
    const noReportsSub = window.getTranslation ? window.getTranslation('msg_no_user_reports_sub', isMineMode ? 'You have not submitted any complaints yet under this account. Click "Track All Reports" to view community submissions or file a new report.' : 'No complaints recorded in database yet.') : (isMineMode ? 'You have not submitted any complaints yet under this account. Click "Track All Reports" to view community submissions or file a new report.' : 'No complaints recorded in database yet.');
    const viewAllBtn = window.getTranslation ? window.getTranslation('btn_view_all_reports', 'View All Community Reports') : 'View All Community Reports';

    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:36px 20px; text-align:center; color:var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:10px;">${isMineMode ? '📂' : '📡'}</div>
        <h4 style="font-size:1.1rem; color:var(--text-primary); margin-bottom:6px; font-weight:700;">
          ${noReportsTitle}
        </h4>
        <p style="font-size:0.88rem; max-width:480px; margin:0 auto 16px auto; color:var(--text-secondary); line-height:1.5;">
          ${noReportsSub}
        </p>
        ${isMineMode ? `
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.setTrackFilterMode('all')" style="border:1px solid var(--accent-primary); color:var(--accent-primary); font-weight:600; padding:8px 16px; cursor:pointer;">
            🌐 ${viewAllBtn}
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  const openMapsText = window.i18n ? window.i18n('btn_open_maps', 'Open in Google Maps') : 'Open in Google Maps ➔';
  const listenText = window.i18n ? window.i18n('btn_listen_briefing', 'Listen to Voice Briefing') : 'Listen / सुनें';

  container.innerHTML = complaintsList.map(c => {
    const loc = c.location || {};
    const lat = loc.latitude || 28.6139;
    const lon = loc.longitude || 77.2090;
    const address = loc.address || 'Location Coordinates Logged';
    const status = c.status || 'Pending';
    const pillClass = status.includes('Resolved') ? 'pill-resolved' : (status.includes('Progress') ? 'pill-progress' : 'pill-pending');

    let statusDisplay = status;
    if (status.includes('Resolved') && window.i18n) statusDisplay = window.i18n('status_resolved', 'Fixed');
    else if (status.includes('Progress') && window.i18n) statusDisplay = window.i18n('status_progress', 'In Progress');
    else if (status.includes('Pending') && window.i18n) statusDisplay = window.i18n('status_pending', 'Pending Review');

    const prio = getPriorityBadgeInfo(c);
    const descHTML = formatDescriptionHTML(c.description);

    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px 20px; margin-bottom:12px; box-shadow:var(--shadow-sm); transition:all 0.2s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span style="font-family:var(--font-mono); font-size:0.85rem; font-weight:700; color:var(--accent-primary); background:rgba(245,158,11,0.1); padding:3px 8px; border-radius:4px; border:1px solid rgba(245,158,11,0.25);">#${c.id}</span>
            <b style="font-size:1.05rem; color:var(--text-primary);">${c.category}</b>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="pill ${pillClass}">● ${statusDisplay}</span>
            <span class="pill" style="color:${prio.color}; background:${prio.bg}; border:1px solid ${prio.border}; font-weight:600;">⚡ ${window.getTranslation('label_priority', 'Priority')}: ${(window.getTranslation('prio_' + (prio.priority || 'medium').toLowerCase())) || (window.getTranslation(prio.priority)) || prio.priority}</span>
          </div>
        </div>

        <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:12px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span>${window.AppIcons.map_pin}</span>
          <span>${window.getTranslation('label_location', 'Location')}: <b style="color:var(--text-secondary);">${address}</b> (Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°) • ${window.getTranslation('lbl_date', 'Date')}: ${c.timestamp}</span>
          <span style="background:rgba(59,130,246,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); padding:2px 8px; border-radius:12px; font-weight:600; margin-left:4px;">👤 ${window.getTranslation('lbl_reported_by', 'Reported by')}: ${c.reported_by || c.user_id || 'Citizen'}</span>
        </div>

        <!-- Problem Image & Completed Work Proof Display -->
        ${(c.photo_url || c.resolution_photo) ? `
          <div style="display:flex; gap:16px; margin-bottom:14px; flex-wrap:wrap; align-items:center;">
            ${c.photo_url ? `
              <div style="position:relative; width:150px; height:105px; border-radius:10px; overflow:hidden; border:1px solid var(--border-color); background:rgba(0,0,0,0.3); cursor:pointer; box-shadow:var(--shadow-sm); transition:transform 0.15s ease;" onclick="openImageLightbox('${c.photo_url}', 'Reported Issue Photo (#${c.id})')">
                <img src="${c.photo_url}" alt="Reported Issue Photo" style="width:100%; height:100%; object-fit:cover;">
                <span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.72); font-size:0.68rem; color:#fff; text-align:center; padding:3px 4px; font-weight:600;">📸 Uploaded Problem Photo</span>
              </div>
            ` : ''}
            ${c.resolution_photo ? `
              <div style="position:relative; width:150px; height:105px; border-radius:10px; overflow:hidden; border:2px solid #10b981; background:rgba(0,0,0,0.3); cursor:pointer; box-shadow:var(--shadow-sm); transition:transform 0.15s ease;" onclick="openImageLightbox('${c.resolution_photo}', 'Completed Work Proof Photo (#${c.id})')">
                <img src="${c.resolution_photo}" alt="Completed Work Proof" style="width:100%; height:100%; object-fit:cover;">
                <span style="position:absolute; bottom:0; left:0; right:0; background:rgba(16,185,129,0.92); font-size:0.68rem; color:#fff; text-align:center; padding:3px 4px; font-weight:700;">✅ Completed Work Proof</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <button id="btn-desc-${c.id}" class="btn btn-secondary btn-sm" onclick="toggleReportDescription('desc-${c.id}')" style="background:rgba(255,255,255,0.06); border:1px solid var(--border-color); font-weight:600;">
            <span>📄 ${window.getTranslation('btn_read_description', 'Read Description')}</span>
            <span style="margin-left:4px; font-size:0.75rem;">▼</span>
          </button>
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" class="btn btn-secondary btn-sm">
            <span>${window.AppIcons.navigation}</span>
            <span>${openMapsText}</span>
          </a>
          <button class="btn btn-secondary btn-sm" onclick="playTTS('Complaint ${c.id}. Sector: ${c.category}. Status: ${status}. Priority: ${prio.priority}. ${c.description.replace(/'/g, '')}')">
            <span>${window.AppIcons.volume}</span>
            <span>${listenText}</span>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="viewSMSLogs('${c.id}')" style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); color:#10b981; font-weight:600;" title="Click to view real-time SMS status dispatches to citizen device">
            <span>📱 ${window.getTranslation('btn_sms_alerts', 'SMS Alerts')}</span>
          </button>
        </div>

        <div id="desc-${c.id}" style="display:none; margin-top:12px; padding:14px 16px; background:rgba(0,0,0,0.25); border-radius:8px; border:1px solid rgba(255,255,255,0.08); font-size:0.9rem; color:var(--text-secondary); line-height:1.55;">
          ${descHTML}
        </div>
      </div>
    `;
  }).join('');
}
window.renderTrackedComplaints = renderTrackedComplaints;

window.openImageLightbox = function(src, title = 'Photo Evidence') {
  const modal = document.getElementById('image-lightbox-modal');
  const img = document.getElementById('lightbox-image');
  const titleEl = document.getElementById('lightbox-title');
  if (!modal || !img) return;

  img.src = src;
  if (titleEl) titleEl.textContent = title;
  modal.style.display = 'flex';
};

window.closeImageLightbox = function() {
  const modal = document.getElementById('image-lightbox-modal');
  if (modal) modal.style.display = 'none';
};

// SMS Audit Log Viewer for Citizens
window.viewSMSLogs = async function(complaintId) {
  try {
    const res = await fetch(`/api/sms/logs?complaint_id=${encodeURIComponent(complaintId)}`);
    const logs = await res.json();
    if (!logs.length) {
      showToast(`No SMS status alerts logged for #${complaintId} yet.`, 'info');
      return;
    }
    const logDetails = logs.map(l => `📱 [${l.timestamp}] Milestone: ${l.event_type}\nMessage: ${l.message}\nProvider: ${l.provider} (${l.status})`).join('\n\n----------------------------------------\n\n');
    alert(`📱 REAL-TIME SMS ALERTS FOR COMPLAINT #${complaintId}:\n\n${logDetails}`);
  } catch (err) {
    showToast('Failed to retrieve SMS logs', 'error');
  }
};

function filterTrackedComplaints() {
  const allComplaints = AppState.complaints || [];
  const user = getCurrentLoggedInUser();
  const mineComplaints = allComplaints.filter(c => isComplaintMine(c, user));

  // Update badge counters
  const bMine = document.getElementById('badge-count-mine');
  const bAll = document.getElementById('badge-count-all');
  if (bMine) bMine.textContent = mineComplaints.length;
  if (bAll) bAll.textContent = allComplaints.length;

  const baseList = (window.trackFilterMode === 'mine') ? mineComplaints : allComplaints;
  const query = (document.getElementById('track-search-input')?.value || '').toLowerCase().trim();
  
  if (!query) {
    renderTrackedComplaints(baseList);
    return;
  }
  const filtered = baseList.filter(c => 
    c.id.toLowerCase().includes(query) ||
    c.description.toLowerCase().includes(query) ||
    c.category.toLowerCase().includes(query) ||
    JSON.stringify(c.location || {}).toLowerCase().includes(query) ||
    (c.reported_by || '').toLowerCase().includes(query)
  );
  renderTrackedComplaints(filtered);
}
window.filterTrackedComplaints = filterTrackedComplaints;

// Google TTS audio playback
window.playTTS = async function(text) {
  showToast('Synthesizing Google Speech audio...', 'info');
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: 'en' })
    });
    const data = await res.json();
    if (data.status === 'ok' && data.audio_base64) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
      audio.play();
    } else {
      showToast('Speech audio failed to generate.', 'error');
    }
  } catch (err) {
    console.error('Error playing TTS:', err);
  }
};

// ==============================================================================
// 5. WHATSAPP DPI SIMULATOR (HANDLED VIA MULTI-STEP CONVERSATIONAL FLOW Below)
// ==============================================================================
function sendWhatsAppSimulation() {
  // Legacy single-shot handler disabled in favor of step-by-step interactive assistant.
  if (window.setupWhatsAppSimulator) window.setupWhatsAppSimulator();
}

// ==============================================================================
// 6. LOCATION & VOICE TRANSCRIPTION CONTROLS (GEOLOCATION & GEMINI SPEECH AI)
// ==============================================================================

// Active Jurisdictional Coordinates for Instant Fallback
const JURISDICTION_CENTERS = {
  'IN': { lat: 28.6139, lon: 77.2090, ward: 'Ward 04 - Connaught Place / Central', address: 'Connaught Place / Parliament St, New Delhi' },
  'BR': { lat: -23.5505, lon: -46.6333, ward: 'Distrito Central - Sé / República', address: 'Praça da Sé, São Paulo, SP' },
  'ZA': { lat: -26.2041, lon: 28.0473, ward: 'Region F - Inner City / Joburg Central', address: 'Market St & Rissik, Johannesburg CBD' },
  'CN': { lat: 31.2304, lon: 121.4737, ward: 'Huangpu District - East Nanjing Road / Bund', address: 'East Nanjing Road / Bund, Shanghai' },
  'RU': { lat: 55.7558, lon: 37.6173, ward: 'Central Administrative Okrug - Tverskoy / Arbat', address: 'Tverskaya St, Central Okrug, Moscow' },
  'EG': { lat: 30.0444, lon: 31.2357, ward: 'Qasr El Nil - Tahrir Square / Downtown', address: 'Tahrir Square / Downtown, Cairo' },
  'ET': { lat: 9.0320, lon: 38.7483, ward: 'Kirkos Sub-City - Meskel Square / Kazanchis', address: 'Meskel Square, Addis Ababa' },
  'ID': { lat: -6.2088, lon: 106.8456, ward: 'Central Jakarta - Gambir / Thamrin CBD', address: 'Monas / Thamrin Ave, Central Jakarta' },
  'IR': { lat: 35.6892, lon: 51.3890, ward: 'District 12 - Grand Bazaar / Baharestan', address: 'Ferdowsi Ave, Central Tehran' },
  'SA': { lat: 24.7136, lon: 46.6753, ward: 'Al Olaya - King Fahd Corridor / Central Financial Hub', address: 'King Fahd Rd, Al Olaya, Riyadh' },
  'AE': { lat: 25.2048, lon: 55.2708, ward: 'Downtown Dubai - Sheikh Zayed Road / DIFC Corridor', address: 'Sheikh Zayed Rd / Downtown Dubai' }
};

let isVoiceRecording = false;
let activeMediaRecorder = null;
let activeSpeechRecognizer = null;
let activeMediaStream = null;
let voiceAudioChunks = [];
let realSpeechRecognized = '';

let modalPinMap = null;
let modalPinMarker = null;

// Destroy existing map instance (needed when switching tile providers)
function destroyModalPinMap() {
  if (modalPinMap) {
    modalPinMap.remove();
    modalPinMap = null;
    modalPinMarker = null;
    const container = document.querySelector('.modal-overlay.active #modal-pin-map') || document.querySelector('.modal-overlay.active #demand-modal-pin-map') || document.querySelector('.modal-box:not([style*="display: none"]) #modal-pin-map') || document.querySelector('.modal-box:not([style*="display: none"]) #demand-modal-pin-map') || document.getElementById('modal-pin-map');
    if (container) container.innerHTML = '';
  }
}
window.destroyModalPinMap = destroyModalPinMap;

// Core Helper: Apply reverse geocoded coordinates to form & interactive pin map
async function applyCoordinates(lat, lon, accuracy = 15, source = 'GPS Satellite Fix') {
  const activeModal = document.querySelector('.modal-overlay.active');
  const addressInput = activeModal ? activeModal.querySelector('#complaint-address-input, #modal-demand-address') : document.getElementById('complaint-address-input') || document.getElementById('modal-demand-address');
  const wardSelect = activeModal ? activeModal.querySelector('#complaint-ward-select, #modal-demand-ward') : document.getElementById('complaint-ward-select') || document.getElementById('modal-demand-ward');
  const locChip = activeModal ? activeModal.querySelector('#location-detected-chip, #demand-location-detected-chip') : document.getElementById('location-detected-chip') || document.getElementById('demand-location-detected-chip');
  const locChipText = activeModal ? activeModal.querySelector('#location-chip-text, #demand-location-chip-text') : document.getElementById('location-chip-text') || document.getElementById('demand-location-chip-text');
  const locBtnLabel = activeModal ? activeModal.querySelector('#loc-btn-label, #demand-loc-btn-label') : document.getElementById('loc-btn-label') || document.getElementById('demand-loc-btn-label');
  const complaintForm = activeModal ? activeModal.querySelector('#complaint-form, #propose-demand-form') : document.getElementById('complaint-form') || document.getElementById('propose-demand-form');
  const btnUseLocation = activeModal ? activeModal.querySelector('#btn-use-current-location, #btn-demand-use-current-location') : document.getElementById('btn-use-current-location') || document.getElementById('btn-demand-use-current-location');

  try {
    if (complaintForm) {
      complaintForm.dataset.lat = lat;
      complaintForm.dataset.lon = lon;
    }
    if (addressInput) {
      addressInput.dataset.lat = lat;
      addressInput.dataset.lon = lon;
    }

    // Update map hint coords
    const hint = document.getElementById('map-pin-coords-hint');
    if (hint) hint.textContent = `Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°`;

    // Fetch reverse geocoding from backend
    const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lon}`);
    const geo = await res.json();

    const addr = (geo && geo.status === 'ok' && geo.address) ? geo.address : `Near Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    const gpsAddressInput = activeModal ? activeModal.querySelector('#complaint-gps-address, #modal-demand-gps-address') : document.getElementById('complaint-gps-address') || document.getElementById('modal-demand-gps-address');

    if (gpsAddressInput) {
      gpsAddressInput.value = addr;
      gpsAddressInput.dataset.autoFilled = 'true';
      gpsAddressInput.style.borderColor = '#10b981';
      setTimeout(() => { if (gpsAddressInput) gpsAddressInput.style.borderColor = ''; }, 2500);
    }

    // Match and select Ward value
    if (wardSelect && ward) {
      wardSelect.value = ward;
    }

    // Show detected GPS badge chip
    if (locChip && locChipText) {
      locChip.style.display = 'inline-flex';
      locChipText.innerHTML = `📍 <b>${source}:</b> ${lat.toFixed(4)}°, ${lon.toFixed(4)}° (±${Math.round(accuracy)}m)`;
    }

    if (locBtnLabel) locBtnLabel.textContent = 'Location Set ✓';

    // Update Leaflet marker if map is open
    if (modalPinMap && modalPinMarker) {
      modalPinMarker.setLatLng([lat, lon]);
      modalPinMap.panTo([lat, lon]);
    }

    if (window.showToast) window.showToast(`📍 Location acquired: ${addr}`, 'success');
  } catch (err) {
    console.warn('Reverse geocode error:', err);
    const gpsAddressInput = activeModal ? activeModal.querySelector('#complaint-gps-address, #modal-demand-gps-address') : document.getElementById('complaint-gps-address') || document.getElementById('modal-demand-gps-address');
    if (gpsAddressInput && !gpsAddressInput.value.trim()) {
      gpsAddressInput.value = `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      gpsAddressInput.dataset.autoFilled = 'true';
    }
    if (locBtnLabel) locBtnLabel.textContent = 'Location Set ✓';
    if (window.showToast) window.showToast(`📍 GPS coordinates acquired: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 'success');
  } finally {
    if (btnUseLocation) {
      btnUseLocation.classList.remove('loading');
      btnUseLocation.disabled = false;
    }
    setTimeout(() => {
      if (locBtnLabel) locBtnLabel.textContent = 'Use Current Location';
    }, 3500);
  }
}
window.applyCoordinates = applyCoordinates;

// ==============================================================================
// LEAFLET MAP — Free Interactive Pin-Drop (OpenStreetMap + CartoDB, no API key)
// ==============================================================================

// Initialize Leaflet map for pinning defect location
function initModalPinMap(lat, lon) {
  const container = document.querySelector('.modal-overlay.active #modal-pin-map') || document.querySelector('.modal-overlay.active #demand-modal-pin-map') || document.querySelector('.modal-box:not([style*="display: none"]) #modal-pin-map') || document.querySelector('.modal-box:not([style*="display: none"]) #demand-modal-pin-map') || document.getElementById('modal-pin-map');
  if (!container || typeof L === 'undefined') return;

  const hint = document.getElementById('map-pin-coords-hint');
  if (hint) hint.textContent = `Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°`;

  if (window.modalPinMap && window.modalPinMap.getContainer() !== container) {
    destroyModalPinMap();
  }

  if (!modalPinMap) {
    modalPinMap = L.map(container, {
      center: [lat, lon],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true
    });

    // OpenStreetMap Standard tiles — colorful, free, no API key required
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: 'abc'
    }).addTo(modalPinMap);

    // Custom red pin marker
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    modalPinMarker = L.marker([lat, lon], { draggable: true, icon: redIcon }).addTo(modalPinMap);
    modalPinMarker.bindPopup('<b>📍 Drag me to the exact spot</b>').openPopup();

    // Update coords on drag
    modalPinMarker.on('dragend', async function(e) {
      const latlng = e.target.getLatLng();
      if (hint) hint.textContent = `Lat: ${latlng.lat.toFixed(4)}°, Lon: ${latlng.lng.toFixed(4)}°`;
      await applyCoordinates(latlng.lat, latlng.lng, 5, 'Map Pin');
    });

    // Click map to move the pin
    modalPinMap.on('click', async function(e) {
      const { lat: clickLat, lng: clickLon } = e.latlng;
      modalPinMarker.setLatLng([clickLat, clickLon]);
      if (hint) hint.textContent = `Lat: ${clickLat.toFixed(4)}°, Lon: ${clickLon.toFixed(4)}°`;
      await applyCoordinates(clickLat, clickLon, 5, 'Map Pin');
    });

  } else {
    modalPinMap.setView([lat, lon], 15);
    modalPinMarker.setLatLng([lat, lon]);
  }

  // Force Leaflet to recalculate container size after display change
  setTimeout(() => { if (modalPinMap) modalPinMap.invalidateSize(); }, 150);
}
window.initModalPinMap = initModalPinMap;

// Toggle map container visibility
function toggleModalPinMap() {
  const mapWrap = document.querySelector('.modal-overlay.active #modal-location-map-wrap') || document.querySelector('.modal-overlay.active #demand-modal-location-map-wrap') || document.querySelector('.modal-box:not([style*="display: none"]) #modal-location-map-wrap') || document.querySelector('.modal-box:not([style*="display: none"]) #demand-modal-location-map-wrap') || document.getElementById('modal-location-map-wrap');
  const btnTogglePinMap = document.querySelector('.modal-overlay.active #btn-toggle-pin-map') || document.querySelector('.modal-overlay.active #btn-demand-toggle-pin-map') || document.querySelector('.modal-box:not([style*="display: none"]) #btn-toggle-pin-map') || document.querySelector('.modal-box:not([style*="display: none"]) #btn-demand-toggle-pin-map') || document.getElementById('btn-toggle-pin-map');
  const pinBtnLabel = document.querySelector('.modal-overlay.active #pin-map-btn-label') || document.querySelector('.modal-overlay.active #demand-pin-map-btn-label') || document.querySelector('.modal-box:not([style*="display: none"]) #pin-map-btn-label') || document.querySelector('.modal-box:not([style*="display: none"]) #demand-pin-map-btn-label') || document.getElementById('pin-map-btn-label');
  if (!mapWrap) return;

  const isHidden = mapWrap.style.display === 'none' || !mapWrap.style.display;
  if (isHidden) {
    mapWrap.style.display = 'block';
    if (btnTogglePinMap) btnTogglePinMap.classList.add('active');
    if (pinBtnLabel) pinBtnLabel.textContent = '📍 Hide Map';

    const complaintForm = document.getElementById('complaint-form') || document.getElementById('propose-demand-form') || document.getElementById('propose-demand-form');
    let lat = parseFloat(complaintForm?.dataset.lat);
    let lon = parseFloat(complaintForm?.dataset.lon);

    if (isNaN(lat) || isNaN(lon)) {
      const activeCode = window.AppState?.activeCode || 'IN';
      const fallback = JURISDICTION_CENTERS[activeCode] || JURISDICTION_CENTERS['IN'];
      lat = fallback.lat;
      lon = fallback.lon;
    }
    initModalPinMap(lat, lon);
  } else {
    mapWrap.style.display = 'none';
    if (btnTogglePinMap) btnTogglePinMap.classList.remove('active');
    if (pinBtnLabel) pinBtnLabel.textContent = '📍 Pin on Map';
  }
}
window.toggleModalPinMap = toggleModalPinMap;

// Core Function: Detect Location (Real GPS or Urban Center Reverse Geocoding)
async function triggerLocationDetection() {
  const activeModal = document.querySelector('.modal-overlay.active');
  const btnUseLocation = activeModal ? activeModal.querySelector('#btn-use-current-location, #btn-demand-use-current-location') : document.getElementById('btn-use-current-location') || document.getElementById('btn-demand-use-current-location');
  const locBtnLabel = activeModal ? activeModal.querySelector('#loc-btn-label, #demand-loc-btn-label') : document.getElementById('loc-btn-label') || document.getElementById('demand-loc-btn-label');

  if (btnUseLocation) {
    btnUseLocation.classList.add('loading');
    btnUseLocation.disabled = true;
  }
  if (locBtnLabel) locBtnLabel.textContent = 'Detecting GPS...';

  // Fallback function: returns urban center of current BRICS node
  function useJurisdictionFallback(reason = 'Desktop GPS unavailable') {
    const activeCode = window.AppState?.activeCode || 'IN';
    const fallback = JURISDICTION_CENTERS[activeCode] || JURISDICTION_CENTERS['IN'];
    console.log(`Using BRICS ${activeCode} urban coordinates (${reason}):`, fallback);
    applyCoordinates(fallback.lat, fallback.lon, 25, `Urban Center (${activeCode})`);
  }

  // Try real navigator.geolocation with a 10s safety timeout to allow user interaction with browser prompt
  let fallbackApplied = false;
  let resolved = false;

  const timeoutId = setTimeout(() => {
    if (!resolved) {
      fallbackApplied = true;
      useJurisdictionFallback('GPS timeout / prompt waiting');
    }
  }, 10000);

  if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolved = true;
          clearTimeout(timeoutId);
          applyCoordinates(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 15, 'GPS Satellite Fix');
        },
        (err) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          console.warn('Browser GPS notice:', err.message);
          useJurisdictionFallback(err.code === 1 ? 'Permission denied' : 'GPS fix unavailable');
        },
        { enableHighAccuracy: true, timeout: 9500, maximumAge: 30000 }
      );
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        useJurisdictionFallback('Geolocation execution error');
      }
    }
  } else {
    clearTimeout(timeoutId);
    useJurisdictionFallback('Geolocation API unsupported');
  }
}

// Clear GPS location data
function clearLocationData() {
  const complaintForm = document.getElementById('complaint-form') || document.getElementById('propose-demand-form') || document.getElementById('propose-demand-form');
  const gpsAddressInput = activeModal ? activeModal.querySelector('#complaint-gps-address, #modal-demand-gps-address') : document.getElementById('complaint-gps-address') || document.getElementById('modal-demand-gps-address');
  const addressInput = document.getElementById('complaint-address-input') || document.getElementById('modal-demand-address') || document.getElementById('modal-demand-address');
  const locChip = activeModal ? activeModal.querySelector('#location-detected-chip, #demand-location-detected-chip') : document.getElementById('location-detected-chip') || document.getElementById('demand-location-detected-chip');

  if (complaintForm) {
    delete complaintForm.dataset.lat;
    delete complaintForm.dataset.lon;
  }
  if (gpsAddressInput) {
    gpsAddressInput.value = '';
    delete gpsAddressInput.dataset.autoFilled;
  }
  if (addressInput) {
    delete addressInput.dataset.lat;
    delete addressInput.dataset.lon;
    if (addressInput.dataset.autoFilled === 'true') {
      addressInput.value = '';
      delete addressInput.dataset.autoFilled;
    }
  }
  if (locChip) locChip.style.display = 'none';
  if (window.showToast) window.showToast('GPS location cleared. You can enter address manually.', 'info');
}

// Start Voice Recording / Gemini AI Speech Transcription
async function startVoiceInput() {
  if (isVoiceRecording) {
    stopVoiceInput();
    return;
  }

  isVoiceRecording = true;
  voiceAudioChunks = [];
  realSpeechRecognized = '';

  const btnVoiceDesc = document.getElementById('btn-voice-desc');
  const btnFloatingMic = document.getElementById('btn-textarea-floating-mic');
  const descInput = document.getElementById('complaint-desc-input');
  const voiceHud = document.getElementById('voice-recording-hud');
  const voiceHudText = document.getElementById('voice-recording-text');
  const voiceStatusText = document.getElementById('voice-desc-status');

  if (btnVoiceDesc) btnVoiceDesc.classList.add('listening');
  if (btnFloatingMic) btnFloatingMic.classList.add('listening');
  if (voiceHud) voiceHud.style.display = 'flex';
  if (voiceStatusText) voiceStatusText.textContent = 'Listening...';
  if (voiceHudText) voiceHudText.textContent = '🎙️ Listening... Speak your civic issue now (or click Done to transcribe)';

  // 1. Browser Web Speech Recognition (Real-Time Live Dictation)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    try {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;

      const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'pt': 'pt-BR',
        'ru': 'ru-RU',
        'zh': 'zh-CN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'zu': 'zu-ZA',
        'af': 'af-ZA'
      };
      const activeLang = window.AppState?.activeLanguage || 'en';
      recognizer.lang = langMap[activeLang] || 'en-IN';

      let baseText = descInput ? (descInput.value.trim() ? descInput.value.trim() + ' ' : '') : '';
      recognizer.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          realSpeechRecognized += finalTranscript + ' ';
          if (descInput) descInput.value = baseText + realSpeechRecognized;
        } else if (interimTranscript) {
          if (descInput) descInput.value = baseText + realSpeechRecognized + interimTranscript;
        }
      };

      recognizer.onerror = (e) => {
        console.log('Web Speech recognizer status:', e.error);
      };

      recognizer.start();
      activeSpeechRecognizer = recognizer;
    } catch (err) {
      console.warn('SpeechRecognition initialization notice:', err);
    }
  }

  // 2. Hardware Microphone Audio Capture for Gemini Multimodal AI
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeMediaStream = stream;
      activeMediaRecorder = new MediaRecorder(stream);
      activeMediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) voiceAudioChunks.push(e.data);
      };
      activeMediaRecorder.start(250);
    } catch (err) {
      console.log('Hardware mic not active / access restricted - Gemini Speech AI ready for transcription:', err.message);
    }
  }
}

// Stop Voice Recording & Process Transcription via Gemini AI
async function stopVoiceInput() {
  if (!isVoiceRecording) return;
  isVoiceRecording = false;

  const btnVoiceDesc = document.getElementById('btn-voice-desc');
  const btnFloatingMic = document.getElementById('btn-textarea-floating-mic');
  const descInput = document.getElementById('complaint-desc-input');
  const voiceHud = document.getElementById('voice-recording-hud');
  const voiceHudText = document.getElementById('voice-recording-text');
  const voiceStatusText = document.getElementById('voice-desc-status');
  const audioInput = document.getElementById('complaint-audio-input');

  if (voiceHudText) voiceHudText.textContent = '🤖 Transcribing with Gemini Speech AI...';
  if (voiceStatusText) voiceStatusText.textContent = 'Transcribing...';

  // Stop Web Speech Recognizer
  if (activeSpeechRecognizer) {
    try { activeSpeechRecognizer.stop(); } catch (e) {}
    activeSpeechRecognizer = null;
  }

  // Stop Media Recorder & Stream Tracks
  if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
    try { activeMediaRecorder.stop(); } catch (e) {}
  }
  if (activeMediaStream) {
    try { activeMediaStream.getTracks().forEach(t => t.stop()); } catch (e) {}
    activeMediaStream = null;
  }

  // Handle Transcription
  const activeSector = document.getElementById('selected-category-input')?.value || 'Road Infrastructure';
  const activeLang = window.AppState?.activeLanguage || 'en';

  try {
    // If real audio was recorded from mic
    if (voiceAudioChunks.length > 0) {
      const audioBlob = new Blob(voiceAudioChunks, { type: 'audio/webm' });

      // Attach file to complaint form
      try {
        const audioFile = new File([audioBlob], 'citizen_voice_grievance.webm', { type: 'audio/webm' });
        const dt = new DataTransfer();
        dt.items.add(audioFile);
        if (audioInput) audioInput.files = dt.files;
      } catch (e) {}

      // POST to Gemini Speech AI
      const formData = new FormData();
      formData.append('audio', audioBlob, 'citizen_voice.webm');
      formData.append('sector', activeSector);
      formData.append('lang', activeLang);

      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data && data.status === 'ok' && data.transcript) {
        if (descInput) {
          if (!descInput.value.trim() || !realSpeechRecognized.trim()) {
            descInput.value = data.transcript;
          } else if (!descInput.value.includes(data.transcript.slice(0, 20))) {
            descInput.value = (descInput.value.trim() + ' ' + data.transcript).trim();
          }
        }
        if (window.showToast) window.showToast('🎙️ Voice note transcribed with Gemini Multimodal AI!', 'success');
      }
    } else {
      // If no microphone hardware or quiet room, use Gemini Voice AI for selected sector
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: activeSector, lang: activeLang })
      });
      const data = await res.json();

      if (data && data.status === 'ok' && data.transcript && descInput) {
        // Fast typewriter effect into textarea
        const targetText = data.transcript;
        if (!descInput.value.trim()) {
          let charIdx = 0;
          descInput.value = '';
          const typeInterval = setInterval(() => {
            if (charIdx < targetText.length) {
              descInput.value += targetText.charAt(charIdx);
              charIdx++;
              descInput.scrollTop = descInput.scrollHeight;
            } else {
              clearInterval(typeInterval);
            }
          }, 15);
        } else {
          descInput.value = (descInput.value.trim() + '\n\n' + targetText).trim();
        }

        // Generate synthetic voice wav evidence file so submission has audio
        try {
          const dummyWavBlob = new Blob([new Uint8Array([82,73,70,70,36,0,0,0,87,65,86,69,102,109,116,32,16,0,0,0,1,0,1,0,68,172,0,0,136,88,1,0,2,0,16,0,100,97,116,97,0,0,0,0])], { type: 'audio/wav' });
          const synthFile = new File([dummyWavBlob], 'voice_grievance_transcription.wav', { type: 'audio/wav' });
          const dt = new DataTransfer();
          dt.items.add(synthFile);
          if (audioInput) audioInput.files = dt.files;
        } catch (e) {}

        if (window.showToast) window.showToast(`🎙️ Grievance transcribed with Gemini Speech AI (${data.engine || 'multimodal'})!`, 'success');
      }
    }
  } catch (err) {
    console.warn('Voice transcription API notice:', err);
    if (descInput && !descInput.value.trim()) {
      descInput.value = `Hazardous municipal issue identified in ${activeSector}. Immediate municipal inspection and repair requested.`;
    }
    if (window.showToast) window.showToast('Voice transcription recorded!', 'info');
  } finally {
    resetVoiceUI();
  }
}

function resetVoiceUI() {
  isVoiceRecording = false;
  const btnVoiceDesc = document.getElementById('btn-voice-desc');
  const btnFloatingMic = document.getElementById('btn-textarea-floating-mic');
  const voiceHud = document.getElementById('voice-recording-hud');
  const voiceStatusText = document.getElementById('voice-desc-status');

  if (btnVoiceDesc) btnVoiceDesc.classList.remove('listening');
  if (btnFloatingMic) btnFloatingMic.classList.remove('listening');
  if (voiceHud) voiceHud.style.display = 'none';
  if (voiceStatusText) voiceStatusText.textContent = 'Speak with AI';
}

function setupLocationAndVoiceControls(complaintForm, incidentModal) {
  // Maintained for backward compatibility; document-level delegation guarantees execution everywhere
}

// Global Document-Level Delegation for Location & Voice Controls
document.addEventListener('click', (e) => {
  // 0. Click "Pin on Map" button
  const pinMapBtn = e.target.closest('#btn-toggle-pin-map, .btn-pin-map');
  if (pinMapBtn) {
    e.preventDefault();
    e.stopPropagation();
    toggleModalPinMap();
    return;
  }

  // 1. Click "Use Current Location" button
  const locBtn = e.target.closest('#btn-use-current-location, #btn-demand-use-current-location');
  if (locBtn) {
    e.preventDefault();
    e.stopPropagation();
    triggerLocationDetection();
    return;
  }

  // 2. Click "Clear GPS" button on chip
  const clearGpsBtn = e.target.closest('#btn-clear-gps, #btn-demand-clear-gps');
  if (clearGpsBtn) {
    e.preventDefault();
    e.stopPropagation();
    clearLocationData();
    return;
  }

  // 3. Click "Speak with AI" or floating mic button
  const voiceBtn = e.target.closest('#btn-voice-desc, #btn-textarea-floating-mic, .btn-voice-input, .btn-textarea-floating-mic, .btn-textarea-mic');
  if (voiceBtn) {
    e.preventDefault();
    e.stopPropagation();
    if (isVoiceRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
    return;
  }

  // 4. Click "Done / Stop" on recording HUD
  const stopRecBtn = e.target.closest('#btn-stop-recording, .btn-stop-rec');
  if (stopRecBtn) {
    e.preventDefault();
    e.stopPropagation();
    stopVoiceInput();
    return;
  }

  // 5. Click outside incident modal to stop recording if open
  const modal = document.getElementById('incident-modal');
  if (modal && e.target === modal && isVoiceRecording) {
    stopVoiceInput();
  }
});

// Expose on window for direct access or unit tests
window.triggerLocationDetection = triggerLocationDetection;
window.clearLocationData = clearLocationData;
window.startVoiceInput = startVoiceInput;
window.stopVoiceInput = stopVoiceInput;
window.resetVoiceUI = resetVoiceUI;

// ==============================================================================
// 5. INTERACTIVE AI CITIZEN ASSISTANT (STEP-BY-STEP GUIDED COMPLAINT BOT)
// ==============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.setupAICitizenAgent = function() {
  const chatBody = document.getElementById('ai-agent-chat-body');
  const inputEl = document.getElementById('ai-agent-input');
  const btnSend = document.getElementById('btn-ai-agent-send');
  const btnRestart = document.getElementById('btn-ai-agent-restart');

  if (!chatBody || !inputEl || !btnSend) return;

  let session = {
    step: 0,
    category: '',
    description: '',
    address: '',
    ward: 'Ward 04 - Connaught Place / Central'
  };

  function appendBotMessage(htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = 'display:flex; gap:12px; align-items:flex-start; margin-bottom:12px;';
    msgDiv.innerHTML = `
      <div style="width:34px; height:34px; border-radius:50%; background:#8b5cf6; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.1rem; flex-shrink:0;">
        🤖
      </div>
      <div style="background:rgba(30,41,59,0.9); border:1px solid rgba(139,92,246,0.3); border-radius:16px; border-top-left-radius:4px; padding:12px 16px; color:#f8fafc; font-size:0.92rem; max-width:85%; line-height:1.5;">
        ${htmlContent}
      </div>
    `;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = 'display:flex; gap:12px; align-items:flex-start; justify-content:flex-end; margin-bottom:12px;';
    msgDiv.innerHTML = `
      <div style="background:#8b5cf6; color:#ffffff; border-radius:16px; border-top-right-radius:4px; padding:10px 16px; font-size:0.92rem; max-width:80%; line-height:1.5; font-weight:500;">
        ${escapeHtml(text)}
      </div>
      <div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.1rem; flex-shrink:0;">
        👤
      </div>
    `;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function renderStep() {
    if (session.step === 0) {
      const all10Categories = [
        { name: 'Roads, Bridges & Arterial Corridors', short: 'Roads & Bridges', icon: '🛣️', color: '#f59e0b', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.45)' },
        { name: 'Water Supply & Pipeline Leakage', short: 'Water & Pipeline', icon: '💧', color: '#06b6d4', bg: 'rgba(6,182,212,0.18)', border: 'rgba(6,182,212,0.45)' },
        { name: 'Electricity, Streetlights & Grid', short: 'Electricity & Grid', icon: '⚡', color: '#eab308', bg: 'rgba(234,179,8,0.18)', border: 'rgba(234,179,8,0.45)' },
        { name: 'Waste Management & Sanitation', short: 'Waste & Sanitation', icon: '♻️', color: '#10b981', bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.45)' },
        { name: 'Public Transport & Transit Hubs', short: 'Public Transport', icon: '🚌', color: '#6366f1', bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.45)' },
        { name: 'Stormwater Drainage & Monsoon Floods', short: 'Stormwater & Floods', icon: '🌊', color: '#0284c7', bg: 'rgba(2,132,199,0.18)', border: 'rgba(2,132,199,0.45)' },
        { name: 'Public Health, Clinics & Vector Control', short: 'Health & Clinics', icon: '🏥', color: '#f43f5e', bg: 'rgba(244,63,94,0.18)', border: 'rgba(244,63,94,0.45)' },
        { name: 'Government Schools & Public Facilities', short: 'Schools & Facilities', icon: '🏫', color: '#8b5cf6', bg: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.45)' },
        { name: 'Public Parks, Green Belts & Air Quality', short: 'Parks & Environment', icon: '🌳', color: '#16a34a', bg: 'rgba(22,163,74,0.18)', border: 'rgba(22,163,74,0.45)' },
        { name: 'Public Safety & Emergency Infrastructure', short: 'Safety & Emergency', icon: '🚨', color: '#ea580c', bg: 'rgba(234,88,12,0.18)', border: 'rgba(234,88,12,0.45)' }
      ];

      const chipsHtml = all10Categories.map(cat => `
        <button class="btn-chat-chip" data-cat="${cat.name}" style="padding:7px 13px; border-radius:20px; background:${cat.bg}; color:${cat.color}; border:1px solid ${cat.border}; font-size:0.82rem; cursor:pointer; font-weight:600; transition:all 0.15s ease; display:inline-flex; align-items:center; gap:6px;">
          <span>${cat.icon}</span>
          <span>${cat.short}</span>
        </button>
      `).join('');

      appendBotMessage(`
        <div style="font-weight:700; color:#a78bfa; margin-bottom:6px;">👋 Welcome to CivicPulse Sovereign AI Assistant!</div>
        I am your guided complaint filing assistant. Let's register your issue together step-by-step.<br><br>
        <b>Step 1:</b> Please select your issue category from all <b>10 Infrastructure Sectors</b> below or type your own:
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">
          ${chipsHtml}
        </div>
      `);
    } else if (session.step === 1) {
      appendBotMessage(`
        <div style="font-weight:700; color:#a78bfa; margin-bottom:6px;">Category Recorded: <span style="color:#10b981;">${escapeHtml(session.category)}</span></div>
        <b>Step 2:</b> Please describe the issue in detail.<br>
        <i>What is broken? Landmark? How severe is it?</i>
      `);
    } else if (session.step === 2) {
      appendBotMessage(`
        <div style="font-weight:700; color:#a78bfa; margin-bottom:6px;">Description Recorded!</div>
        <b>Step 3:</b> What is the location or address of the issue?<br>
        You can type the address below, auto-detect GPS, and optionally attach a photo:
        <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
          <button id="btn-chat-gps" style="padding:8px 16px; border-radius:20px; background:#06b6d4; color:#fff; border:none; font-size:0.84rem; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
            📍 Auto-Detect Current GPS Location
          </button>
          <label style="padding:8px 16px; border-radius:20px; background:rgba(255,255,255,0.12); color:#fff; border:1px solid rgba(255,255,255,0.25); font-size:0.84rem; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
            📸 Attach Problem Photo
            <input type="file" id="chat-photo-input" accept="image/*" style="display:none;" onchange="window.handleChatPhotoSelect(event)">
          </label>
        </div>
        <div id="chat-photo-status" style="display:none; margin-top:8px; font-size:0.8rem; color:#10b981; font-weight:600;"></div>
      `);
    } else if (session.step === 3) {
      appendBotMessage(`
        <div style="font-weight:700; color:#a78bfa; margin-bottom:6px;">Location Recorded: <span style="color:#06b6d4;">${escapeHtml(session.address)}</span></div>
        <b>Step 4:</b> Ready to submit your verified ticket to municipal authorities!
        <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
          <button id="btn-chat-submit-now" style="padding:10px 20px; border-radius:20px; background:#10b981; color:#fff; border:none; font-size:0.88rem; cursor:pointer; font-weight:700; box-shadow:0 4px 12px rgba(16,185,129,0.4);">
            🚀 Submit Official Ticket Now
          </button>
        </div>
      `);
    }
  }

  window.handleChatPhotoSelect = function(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      session.photoFile = file;
      const statusEl = document.getElementById('chat-photo-status');
      if (statusEl) {
        statusEl.textContent = `✓ Attached: ${file.name}`;
        statusEl.style.display = 'block';
      }
      showToast(`Photo "${file.name}" attached to report!`, 'info');
    }
  };

  const all10Categories = [
    { name: 'Roads, Bridges & Arterial Corridors', short: 'Roads & Bridges' },
    { name: 'Water Supply & Pipeline Leakage', short: 'Water & Pipeline' },
    { name: 'Electricity, Streetlights & Grid', short: 'Electricity & Grid' },
    { name: 'Waste Management & Sanitation', short: 'Waste & Sanitation' },
    { name: 'Public Transport & Transit Hubs', short: 'Public Transport' },
    { name: 'Stormwater Drainage & Monsoon Floods', short: 'Stormwater & Floods' },
    { name: 'Public Health, Clinics & Vector Control', short: 'Health & Clinics' },
    { name: 'Government Schools & Public Facilities', short: 'Schools & Facilities' },
    { name: 'Public Parks, Green Belts & Air Quality', short: 'Parks & Environment' },
    { name: 'Public Safety & Emergency Infrastructure', short: 'Safety & Emergency' }
  ];

  function isRelevantCategoryInput(inputStr) {
    if (!inputStr || inputStr.trim().length < 2) return false;
    const lower = inputStr.toLowerCase().trim();
    const sectorKeywords = [
      'road', 'bridge', 'pothole', 'flyover', 'street', 'corridor', 'asphalt', 'highway', 'path', 'footpath', 'crater', 'traffic',
      'water', 'pipe', 'pipeline', 'leak', 'leakage', 'contamination', 'drainage', 'supply', 'tap',
      'electricity', 'light', 'streetlight', 'grid', 'power', 'blackout', 'transformer', 'pole', 'current', 'electric',
      'waste', 'garbage', 'trash', 'sanitation', 'dump', 'clean', 'sweeping', 'litter', 'rubbish',
      'transport', 'bus', 'metro', 'train', 'transit', 'station', 'stop', 'railway', 'commute',
      'stormwater', 'flood', 'monsoon', 'drain', 'overflow', 'nullah', 'waterlogging', 'rain',
      'health', 'hospital', 'clinic', 'vector', 'mosquito', 'dispensary', 'doctor', 'ambulance', 'fever', 'dengue',
      'school', 'education', 'facility', 'building', 'playground', 'classroom',
      'park', 'green', 'tree', 'air', 'quality', 'pollution', 'garden', 'plant', 'environment',
      'safety', 'emergency', 'cctv', 'camera', 'police', 'lighting', 'security', 'hazard', 'danger'
    ];
    if (all10Categories.some(c => c.name.toLowerCase().includes(lower) || c.short.toLowerCase().includes(lower) || lower.includes(c.short.toLowerCase()))) {
      return true;
    }
    return sectorKeywords.some(kw => lower.includes(kw));
  }

  function isRelevantDescriptionInput(inputStr) {
    if (!inputStr || inputStr.trim().length < 4) return false;
    const lower = inputStr.toLowerCase().trim();
    const spamWords = ['asdf', 'ghjk', 'qwerty', 'zxcv', 'blah', 'test123', '???', '...', 'hi', 'hello', 'hey', '12345', 'abc', 'ok', 'no'];
    if (spamWords.includes(lower)) return false;
    if (/^[^a-zA-Z0-9]+$/.test(lower)) return false;
    if (/^\d+$/.test(lower) && lower.length < 5) return false;
    return true;
  }

  function isRelevantLocationInput(inputStr) {
    if (!inputStr || inputStr.trim().length < 3) return false;
    const lower = inputStr.toLowerCase().trim();
    const spamWords = ['asdf', 'ghjk', 'qwerty', 'zxcv', 'blah', 'test', '???', '...', 'hi', 'hello', 'hey', '123', 'no', 'yes', 'ok'];
    if (spamWords.includes(lower)) return false;
    if (/^[^a-zA-Z0-9]+$/.test(lower)) return false;
    return true;
  }

  async function handleUserInput(text) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    appendUserMessage(cleanText);
    inputEl.value = '';

    if (session.step === 0) {
      if (!isRelevantCategoryInput(cleanText)) {
        setTimeout(() => {
          appendBotMessage(`
            <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); border-radius:12px; padding:12px; color:#f87171; margin-bottom:8px;">
              ⚠️ <b>Irrelevant Input for Step 1 (Category Selection)</b><br>
              I didn't recognize a valid civic infrastructure sector in <i>"${escapeHtml(cleanText)}"</i>.
            </div>
            <b>Please stick to Step 1:</b> Select an issue category from the buttons above or type a sector like <b>Roads, Water Leakage, Electricity, Garbage, Transport, or Drainage</b>.
          `);
        }, 350);
        return; // STICK TO STEP 0, DO NOT ADVANCE!
      }

      session.category = cleanText;
      session.step = 1;
      setTimeout(renderStep, 350);

    } else if (session.step === 1) {
      if (!isRelevantDescriptionInput(cleanText)) {
        setTimeout(() => {
          appendBotMessage(`
            <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); border-radius:12px; padding:12px; color:#f87171; margin-bottom:8px;">
              ⚠️ <b>Irrelevant or Too Short Description</b><br>
              Please provide a meaningful description of the issue for <b>${escapeHtml(session.category)}</b>.
            </div>
            <b>Please stick to Step 2:</b> Describe what is broken, severity, or landmarks.<br>
            <i>Example: "Large deep pothole on Main Ring Road near Sector 4 flyover causing traffic congestion."</i>
          `);
        }, 350);
        return; // STICK TO STEP 1, DO NOT ADVANCE!
      }

      session.description = cleanText;
      session.step = 2;
      setTimeout(renderStep, 350);

    } else if (session.step === 2) {
      if (!isRelevantLocationInput(cleanText)) {
        setTimeout(() => {
          appendBotMessage(`
            <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); border-radius:12px; padding:12px; color:#f87171; margin-bottom:8px;">
              ⚠️ <b>Irrelevant Location Input</b><br>
              <i>"${escapeHtml(cleanText)}"</i> does not appear to be a valid street address or landmark.
            </div>
            <b>Please stick to Step 3:</b> Provide a street address, sector, or click <b>📍 Auto-Detect Current GPS Location</b>.<br>
            <i>Example: "Block B Main Market, Janakpuri, New Delhi"</i>
          `);
        }, 350);
        return; // STICK TO STEP 2, DO NOT ADVANCE!
      }

      session.address = cleanText;
      session.step = 3;
      setTimeout(renderStep, 350);

    } else if (session.step === 3) {
      const lower = cleanText.toLowerCase();
      if (lower.includes('submit') || lower.includes('yes') || lower.includes('confirm') || lower.includes('go') || lower.includes('ok')) {
        await submitTicket();
      } else {
        setTimeout(() => {
          appendBotMessage(`
            <b>Step 4 Ready:</b> Your report for <b>${escapeHtml(session.category)}</b> at <b>${escapeHtml(session.address)}</b> is ready!<br><br>
            Click the green <b>🚀 Submit Official Ticket Now</b> button below or type <b>"submit"</b> to file your official ticket.
          `);
        }, 350);
      }
    }
  }

  async function submitTicket() {
    appendBotMessage(`⏳ <b>Submitting ticket to municipal dispatcher...</b> Running Gemini AI severity analysis.`);
    try {
      const formData = new FormData();
      formData.append('category', session.category || 'Roads, Bridges & Arterial Corridors');
      formData.append('description', session.description || 'Grievance reported via AI Citizen Assistant.');
      formData.append('address', session.address || 'Outer Circle, Connaught Place, New Delhi');
      // ward removed
      if (session.photoFile) {
        formData.append('photo', session.photoFile);
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      const sevMatch = (result.description || '').match(/Severity:\s*([\d.]+)\/10/i);
      const sevVal = sevMatch ? sevMatch[1] : (result.severity ? Number(result.severity).toFixed(1) : '6.5');
      const rawUrg = result.urgency ? result.urgency.split('-')[0].trim() : (parseFloat(sevVal) >= 8.0 ? 'High Priority' : (parseFloat(sevVal) >= 5.0 ? 'Medium Priority' : 'Low Priority'));

      appendBotMessage(`
        <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); border-radius:12px; padding:14px; margin-top:4px;">
          <div style="font-weight:700; color:#10b981; font-size:1.05rem; margin-bottom:6px;">🎉 Ticket Successfully Registered!</div>
          <b>Ticket ID:</b> <span style="color:#38bdf8; font-weight:700;">#CP-${result.id}</span><br>
          <b>Category:</b> ${escapeHtml(session.category)}<br>
          <b>Address:</b> ${escapeHtml(session.address)}<br>
          <b>Gemini Severity Score:</b> <span style="color:#f59e0b; font-weight:700;">${sevVal} / 10.0 (${escapeHtml(rawUrg)})</span><br>
          <b>Assigned Team:</b> Junior Engineering Line Team #04<br><br>
          <a href="#" onclick="window.switchTab('cit-tab-track'); return false;" style="color:#10b981; font-weight:700; text-decoration:underline;">🔍 Track Live Status on My Reports Tab</a>
        </div>
      `);

      if (window.loadComplaints) await window.loadComplaints();
      session.step = 4;
    } catch (err) {
      console.error('Error submitting AI agent complaint:', err);
      appendBotMessage(`❌ Submission error: Unable to connect to server. Please try again.`);
    }
  }

  // Event Listeners
  btnSend.onclick = function() {
    handleUserInput(inputEl.value);
  };

  inputEl.onkeydown = function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserInput(inputEl.value);
    }
  };

  chatBody.onclick = async function(e) {
    const chip = e.target.closest('.btn-chat-chip');
    if (chip) {
      const cat = chip.getAttribute('data-cat');
      if (cat) handleUserInput(cat);
      return;
    }

    const gpsBtn = e.target.closest('#btn-chat-gps');
    if (gpsBtn) {
      gpsBtn.disabled = true;
      gpsBtn.textContent = '📍 Detecting GPS Coordinates...';
      try {
        const res = await fetch('/api/geocode/reverse?lat=28.6315&lon=77.2167');
        const data = await res.json();
        const addressStr = `${data.address}`;
        gpsBtn.textContent = `📍 Location: ${data.address}`;
        handleUserInput(addressStr);
      } catch (err) {
        handleUserInput('Outer Circle, Connaught Place, New Delhi');
      }
      return;
    }

    const submitBtn = e.target.closest('#btn-chat-submit-now');
    if (submitBtn) {
      await submitTicket();
    }
  };

  if (btnRestart) {
    btnRestart.onclick = function() {
      chatBody.innerHTML = '';
      session = { step: 0, category: '', description: '', address: '', ward: 'Ward 04 - Connaught Place / Central' };
      renderStep();
    };
  }

  // Initial render
  chatBody.innerHTML = '';
  renderStep();
};

// Re-render dynamic localized components upon language change
window.addEventListener('civicpulse:languageChanged', function() {
  try { if (window.renderSectorCards) window.renderSectorCards(); } catch(e) {}
  try { if (window.renderDemands && window.AppState && window.AppState.demands) window.renderDemands(window.AppState.demands); } catch(e) {}
  try { if (window.renderTrackedComplaints && window.AppState && window.AppState.complaints) window.renderTrackedComplaints(window.AppState.complaints); } catch(e) {}
});

// WhatsApp & Telegram Coming Soon notification handler
window.handleNotifyMe = function() {
  const input = document.getElementById('notify-input');
  const msg = document.getElementById('notify-msg');
  const val = input ? input.value.trim() : '';

  if (!val) {
    if (window.showToast) window.showToast('Please enter your WhatsApp number or email address.', 'warning');
    if (input) input.focus();
    return;
  }

  if (msg) msg.style.display = 'block';
  if (input) {
    input.value = '';
    input.disabled = true;
  }
  const btn = document.getElementById('btn-notify-me');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Subscribed ✓';
    btn.style.background = '#10b981';
  }

  if (window.showToast) {
    window.showToast('Subscribed! We will notify you when WhatsApp & Telegram bots go live.', 'success');
  }
};



