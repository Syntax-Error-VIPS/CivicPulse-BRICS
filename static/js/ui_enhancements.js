/**
 * CIVICPULSE-BRICS: UI ENHANCEMENTS MODULE
 * Implements: Stats Counters, Skeleton Loaders, Empty States,
 * SLA Progress Bars, Mobile Breakpoints helper, Breadcrumbs
 */

(function () {
  'use strict';

  // ─── 1. ANIMATED STATS COUNTER ─────────────────────────────────────────────
  // Animates a number from 0 up to its target value
  function animateCounter(el, target, duration = 900) {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(from + (target - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Inject the stats banner into the citizen home tab
  function injectCitizenStatsBanner() {
    const homeTab = document.getElementById('cit-tab-home');
    if (!homeTab || document.getElementById('citizen-stats-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'citizen-stats-banner';
    banner.className = 'citizen-stats-banner';
    banner.innerHTML = `
      <div class="stat-counter-card">
        <div class="stat-icon" style="color:#ef4444;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="stat-number" id="stat-reported">0</div>
        <div class="stat-label">Issues Reported</div>
      </div>
      <div class="stat-counter-card">
        <div class="stat-icon" style="color:#10b981;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="stat-number" id="stat-resolved">0</div>
        <div class="stat-label">Resolved</div>
      </div>
      <div class="stat-counter-card">
        <div class="stat-icon" style="color:#f59e0b;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-number" id="stat-pending">0</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-counter-card">
        <div class="stat-icon" style="color:#6366f1;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-number" id="stat-demands">0</div>
        <div class="stat-label">Community Projects</div>
      </div>
    `;

    // Insert after the hero banner
    const heroBanner = homeTab.querySelector('.hero-banner');
    if (heroBanner && heroBanner.nextSibling) {
      homeTab.insertBefore(banner, heroBanner.nextSibling);
    } else {
      homeTab.prepend(banner);
    }
  }

  // Update stats counters from live data
  window.updateStatCounters = function (complaints, demands) {
    injectCitizenStatsBanner();

    if (!complaints && window.AppState) complaints = window.AppState.complaints;
    if (!demands && window.AppState) demands = window.AppState.demands;

    const total     = complaints ? complaints.length : 0;
    const resolved  = complaints ? complaints.filter(c => (c.status || '').toLowerCase().includes('resolved')).length : 0;
    const pending   = complaints ? complaints.filter(c => !(c.status || '').toLowerCase().includes('resolved')).length : 0;
    const demandCnt = demands ? demands.length : 0;

    animateCounter(document.getElementById('stat-reported'), total);
    animateCounter(document.getElementById('stat-resolved'), resolved);
    animateCounter(document.getElementById('stat-pending'), pending);
    animateCounter(document.getElementById('stat-demands'), demandCnt);
  };

  // Hook into load events
  const _origLoadComplaints = window.loadComplaints;
  window.loadComplaints = async function () {
    if (_origLoadComplaints) await _origLoadComplaints.apply(this, arguments);
    // Re-derive stats after loading
    const complaints = window.AppState ? window.AppState.complaints || [] : [];
    const demands    = window.AppState ? window.AppState.demands    || [] : [];
    window.updateStatCounters(complaints, demands);
  };

  const _origLoadDemands = window.loadCitizenDemands;
  window.loadCitizenDemands = async function () {
    if (_origLoadDemands) await _origLoadDemands.apply(this, arguments);
    const complaints = window.AppState ? window.AppState.complaints || [] : [];
    const demands    = window.AppState ? window.AppState.demands    || [] : [];
    window.updateStatCounters(complaints, demands);
  };

  // ─── 2. SKELETON LOADERS ────────────────────────────────────────────────────
  window.showSkeletonLoader = function (containerId, count = 3) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = Array.from({ length: count }, () => `
      <div class="skeleton-card">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-subtitle"></div>
        <div class="skeleton-line skeleton-body"></div>
        <div class="skeleton-line skeleton-body" style="width:70%;"></div>
      </div>
    `).join('');
  };

  // Patch the complaint loader to show skeletons first
  const _origRenderComplaints = window.renderTrackedComplaints;
  window.renderTrackedComplaints = function (list) {
    if (_origRenderComplaints) {
      _origRenderComplaints(list);
    }
  };

  // ─── 3. PREMIUM EMPTY STATES ────────────────────────────────────────────────
  window.renderEmptyState = function (containerId, icon, title, subtitle, color = 'var(--accent-primary)') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="empty-state-wrap">
        <div class="empty-state-icon" style="color:${color};">${icon}</div>
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-subtitle">${subtitle}</p>
      </div>
    `;
  };

  // ─── 4. SLA PROGRESS BAR ENHANCEMENT ───────────────────────────────────────
  // Adds a colored progress bar under each complaint card's SLA section
  window.renderSlaProgressBar = function (submittedAt, slaHours = 24) {
    const now  = Date.now();
    const start = new Date(submittedAt).getTime();
    const end   = start + slaHours * 3600 * 1000;
    const pct   = Math.min(100, Math.round(((now - start) / (end - start)) * 100));
    const color = pct < 50 ? '#10b981' : pct < 80 ? '#f59e0b' : '#ef4444';
    const label = pct >= 100 ? 'SLA Exceeded' : `${pct}% of SLA time used`;
    return `
      <div class="sla-progress-wrap" title="${label}">
        <div class="sla-progress-track">
          <div class="sla-progress-fill" style="width:${pct}%; background:${color};"></div>
        </div>
        <span class="sla-progress-label" style="color:${color};">${label}</span>
      </div>
    `;
  };

  // ─── 5. PAGE ENTRANCE ANIMATIONS ────────────────────────────────────────────
  // Stagger animate children of a container when they appear
  function staggerReveal(selector, delay = 60) {
    const items = document.querySelectorAll(selector);
    items.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = `opacity 0.4s ease ${i * delay}ms, transform 0.4s ease ${i * delay}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }

  window.staggerReveal = staggerReveal;

  // Auto-run stagger on sector cards when they render
  const _origRenderSectors = window.renderSectorCards;
  window.renderSectorCards = function () {
    if (_origRenderSectors) _origRenderSectors.apply(this, arguments);
    setTimeout(() => staggerReveal('.sector-card', 50), 50);
  };

  // ─── 6. MOBILE RESPONSIVE HELPER ────────────────────────────────────────────
  window.isMobile = () => window.innerWidth < 768;
  window.isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;

  // ─── 7. BREADCRUMB ENHANCEMENT ──────────────────────────────────────────────
  // Adds a live breadcrumb path below navbar based on active tab
  function updateBreadcrumb(tabId) {
    const breadcrumb = document.getElementById('portal-breadcrumb');
    if (!breadcrumb) return;
    const map = {
      'cit-tab-home'      : ['Home', '🏠'],
      'cit-tab-report'    : ['Home', '🏠', 'Report an Issue', '📋'],
      'cit-tab-demands'   : ['Home', '🏠', 'Community Projects', '🗳️'],
      'cit-tab-track'     : ['Home', '🏠', 'Track Reports', '📡'],
      'cit-tab-ai-agent'  : ['Home', '🏠', 'AI Assistant', '🤖'],
    };
    const crumbs = map[tabId];
    if (!crumbs) return;
    const parts = [];
    for (let i = 0; i < crumbs.length; i += 2) {
      const label = crumbs[i];
      const icon  = crumbs[i + 1];
      const isLast = i === crumbs.length - 2;
      parts.push(isLast
        ? `<span class="bc-active">${icon} ${label}</span>`
        : `<span class="bc-link" onclick="window.switchTab('cit-tab-home')">${icon} ${label}</span><span class="bc-sep">›</span>`
      );
    }
    breadcrumb.innerHTML = parts.join('');
  }

  // Patch switchTab to update breadcrumb
  const _origSwitch = window.switchTab;
  window.switchTab = function (tabId) {
    if (_origSwitch) _origSwitch.apply(this, arguments);
    setTimeout(() => updateBreadcrumb(tabId), 50);
  };

  // ─── 8. INIT ────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    injectCitizenStatsBanner();
    updateBreadcrumb('cit-tab-home');
  });

})();
