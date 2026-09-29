/**
 * CIVICPULSE-BRICS: INTERNATIONALIZATION ENGINE (Google Translate Only)
 * Full-page translation powered by Google Neural Machine Translation (GNMT).
 * Supports 23 BRICS & Indian sovereign languages.
 */

// Language code map: internal code -> Google Translate language code
var GOOGLE_LANG_MAP = {
  'en': 'en', 'hi': 'hi', 'pt': 'pt', 'ru': 'ru', 'zh': 'zh-CN',
  'ar': 'ar', 'id': 'id', 'fa': 'fa', 'am': 'am', 'xh': 'xh',
  'zu': 'zu', 'af': 'af', 'ta': 'ta', 'te': 'te', 'kn': 'kn',
  'ml': 'ml', 'bn': 'bn', 'mr': 'mr', 'gu': 'gu', 'pa': 'pa',
  'or': 'or', 'as': 'as', 'ur': 'ur'
};

// Stub: getTranslation / i18n / t - passthrough so existing JS callers don't break
window.getTranslation = function(keyOrText, fallback) {
  return (fallback !== undefined && fallback !== null) ? fallback : (keyOrText || '');
};
window.i18n = window.getTranslation;
window.t   = window.getTranslation;

// Stub: translateDOM - no-op, Google Translate owns the DOM
window.translateDOM = function() {};

// Ensure the hidden Google Translate container element exists in DOM
function ensureGoogleTranslateContainer() {
  if (!document.getElementById('google_translate_element')) {
    var el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
    (document.body || document.documentElement).appendChild(el);
  }
}

// Inject the Google Translate script exactly once
var _gtScriptInjected = false;
function injectGoogleTranslateScript() {
  if (_gtScriptInjected) return;
  // Guard: don't inject if already present in HTML
  if (document.querySelector('script[src*="translate.google.com/translate_a/element"]')) {
    _gtScriptInjected = true;
    return;
  }
  _gtScriptInjected = true;
  var s = document.createElement('script');
  s.id  = 'google-translate-script';
  s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  s.async = true;
  document.head.appendChild(s);
}

// Google Translate widget initialization callback (called by Google's script)
var _gtInitialized = false;
window.googleTranslateElementInit = function() {
  if (_gtInitialized) return; // prevent double init
  _gtInitialized = true;
  try {
    ensureGoogleTranslateContainer();
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: Object.values(GOOGLE_LANG_MAP).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    }
  } catch (err) {
    console.warn('[i18n] Google Translate init warning:', err);
  }
  // Apply saved language after widget is ready
  setTimeout(function() {
    var saved = localStorage.getItem('civicpulse_lang') || 'en';
    if (saved !== 'en') _applyGoogleTranslate(saved);
  }, 600);
};

// Apply Google Translate for a given language code
function _applyGoogleTranslate(lang) {
  var gLang = GOOGLE_LANG_MAP[lang] || lang;
  var host  = window.location.hostname;

  if (gLang === 'en') {
    // Clear translation cookies to restore English
    var exp = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; ' + exp;
    if (host && host.indexOf('.') !== -1) {
      document.cookie = 'googtrans=; ' + exp + ' domain=' + host + ';';
      document.cookie = 'googtrans=; ' + exp + ' domain=.' + host + ';';
    }
    document.cookie = 'googtrans=/en/en; path=/;';
  } else {
    document.cookie = 'googtrans=/en/' + gLang + '; path=/;';
    if (host && host.indexOf('.') !== -1) {
      document.cookie = 'googtrans=/en/' + gLang + '; path=/; domain=' + host + ';';
      document.cookie = 'googtrans=/en/' + gLang + '; path=/; domain=.' + host + ';';
    }
  }

  // Drive the Google Translate combo-select with retry polling
  function tryCombo(n) {
    var combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = gLang;
      combo.dispatchEvent(new Event('change'));
    } else if (n > 0) {
      setTimeout(function() { tryCombo(n - 1); }, 200);
    } else if (gLang !== 'en') {
      // Last resort: reload - browser reads the googtrans cookie
      window.location.reload();
    }
  }
  tryCombo(25);
}

// Public alias
window.triggerGoogleTranslate = _applyGoogleTranslate;

// setLanguage: called when user selects a language from the dropdown
window.setLanguage = function(lang) {
  if (!lang) lang = 'en';

  localStorage.setItem('civicpulse_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir',
    (lang === 'ar' || lang === 'fa' || lang === 'ur') ? 'rtl' : 'ltr'
  );

  // Sync all language dropdowns to the new value
  document.querySelectorAll('#lang-selector, #login-lang-select, .lang-select').forEach(function(sel) {
    if (sel && sel.value !== lang) sel.value = lang;
  });

  if (window.AppState) window.AppState.activeLanguage = lang;

  _applyGoogleTranslate(lang);

  // Re-render dynamic JS components
  try { if (window.renderSectorCards) window.renderSectorCards(); } catch(e) {}
  try { if (window.renderDemands && window.AppState && window.AppState.demands) window.renderDemands(window.AppState.demands); } catch(e) {}
  try { if (window.renderTrackedComplaints && window.AppState && window.AppState.complaints) window.renderTrackedComplaints(window.AppState.complaints); } catch(e) {}
  try { if (window.refreshCityOfficialDashboard) window.refreshCityOfficialDashboard(); } catch(e) {}
  try { if (window.loadCityComplaints) window.loadCityComplaints(); } catch(e) {}
  try { if (window.loadPeerProposals) window.loadPeerProposals(); } catch(e) {}
  try { if (window.refreshCentralDashboard) window.refreshCentralDashboard(); } catch(e) {}
  try { if (window.loadCentralOfficersOverview) window.loadCentralOfficersOverview(); } catch(e) {}
  try { if (window.loadCentralProposals) window.loadCentralProposals(); } catch(e) {}
  try { if (window.loadCentralMegaPlans) window.loadCentralMegaPlans(); } catch(e) {}
  try { if (window.loadBricsIncomingRequests) window.loadBricsIncomingRequests(); } catch(e) {}
  try { if (window.renderMegaPlans && window.AppState && window.AppState.megaPlans) window.renderMegaPlans(); } catch(e) {}
  try { if (window.renderBudgetTable && window.AppState && window.AppState.budgetAlignment) window.renderBudgetTable(); } catch(e) {}

  window.dispatchEvent(new CustomEvent('civicpulse:languageChanged', { detail: { lang: lang } }));
};

// initLanguage: runs on page load
window.initLanguage = function() {
  ensureGoogleTranslateContainer();
  injectGoogleTranslateScript();

  // Determine active language: saved > browser default > 'en'
  var lang = localStorage.getItem('civicpulse_lang');
  if (!lang) {
    var bl = (navigator.language || navigator.userLanguage || 'en').toLowerCase().split('-')[0];
    lang = GOOGLE_LANG_MAP[bl] ? bl : 'en';
  }

  // Set html[lang] and html[dir] immediately
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir',
    (lang === 'ar' || lang === 'fa' || lang === 'ur') ? 'rtl' : 'ltr'
  );

  function syncSelectors() {
    document.querySelectorAll('#lang-selector, #login-lang-select, .lang-select').forEach(function(sel) {
      if (sel && sel.value !== lang) sel.value = lang;
    });
  }

  function attachListeners() {
    document.querySelectorAll('#lang-selector, #login-lang-select, .lang-select').forEach(function(sel) {
      if (sel && !sel.__civicLangBound) {
        sel.__civicLangBound = true;
        sel.addEventListener('change', function(e) {
          if (e.target.value) window.setLanguage(e.target.value);
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { syncSelectors(); attachListeners(); });
  } else {
    syncSelectors();
    attachListeners();
  }

  // Delegated listener as safety net for late-injected selectors
  document.addEventListener('change', function(e) {
    if (!e.target) return;
    if (e.target.id === 'lang-selector' ||
        e.target.id === 'login-lang-select' ||
        (e.target.classList && e.target.classList.contains('lang-select'))) {
      if (e.target.value) window.setLanguage(e.target.value);
    }
  });
};

// Auto-boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initLanguage);
} else {
  window.initLanguage();
}
