/* =========================================================
   STACKLY — APP SHELL SCRIPT
   Auth (login/signup) + Dashboard (admin/user) logic.
   No alert()/confirm() anywhere — all feedback is inline UI.
   ========================================================= */

/* ---------- fake-backend: users live in localStorage ---------- */
const STK_USERS_KEY = 'stackly_users';
const STK_SESSION_KEY = 'stackly_session';

function stkSeedUsers() {
  const existing = localStorage.getItem(STK_USERS_KEY);
  if (existing) return;
  const seed = [
    { name: 'Aarav Mehta', email: 'admin@stackly.example', password: 'Admin@123', role: 'admin' },
    { name: 'Sanya Iyer', email: 'user@stackly.example', password: 'User@123', role: 'user' }
  ];
  localStorage.setItem(STK_USERS_KEY, JSON.stringify(seed));
}

function stkGetUsers() {
  stkSeedUsers();
  try { return JSON.parse(localStorage.getItem(STK_USERS_KEY)) || []; }
  catch (e) { return []; }
}

function stkSaveUsers(users) {
  localStorage.setItem(STK_USERS_KEY, JSON.stringify(users));
}

function stkSetSession(user) {
  sessionStorage.setItem(STK_SESSION_KEY, JSON.stringify({
    name: user.name, email: user.email, role: user.role
  }));
}

function stkGetSession() {
  try { return JSON.parse(sessionStorage.getItem(STK_SESSION_KEY)); }
  catch (e) { return null; }
}

function stkLogout() {
  sessionStorage.removeItem(STK_SESSION_KEY);
  window.location.href = 'login.html';
}

/* ---------- small field-error helper (never uses alert) ---------- */
function stkSetFieldError(fieldEl, message) {
  fieldEl.classList.remove('au-error');
  void fieldEl.offsetWidth; /* restart shake animation if error fires twice in a row */
  fieldEl.classList.add('au-error');
  const msgSpan = fieldEl.querySelector('.au-error-msg span');
  if (msgSpan) msgSpan.textContent = message;
}
function stkClearFieldError(fieldEl) {
  fieldEl.classList.remove('au-error');
}

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     CUSTOM CURSOR — runs on every page that loads app.js
     (login, signup, both dashboards). style.css hides the
     native cursor globally, so without this the pointer is
     invisible on these pages while it moves.
     ========================================================= */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (cursorDot || cursorRing) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
    });
    (function animateCursorRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
      requestAnimationFrame(animateCursorRing);
    })();
    const hoverSelector = 'a, button, input, textarea, select, .dash-list-row, .dash-email-row, .auth-role button, .dash-hour-chip';
    /* delegate from the document so elements rendered later (inbox rows, filtered
       lists) automatically get the hover-ring effect without re-binding listeners */
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverSelector)) cursorRing && cursorRing.classList.add('hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverSelector) && !e.relatedTarget?.closest(hoverSelector)) {
        cursorRing && cursorRing.classList.remove('hover');
      }
    });
  }

  /* =========================================================
     LOGIN PAGE
     ========================================================= */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const roleToggle = document.getElementById('loginRole');
    let selectedRole = 'admin';

    roleToggle?.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRole = btn.dataset.role;
        roleToggle.dataset.role = selectedRole;
        roleToggle.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    const emailField = document.getElementById('loginEmailField');
    const passField = document.getElementById('loginPassField');
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');

    document.getElementById('loginTogglePass')?.addEventListener('click', function () {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      this.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });

    [emailField, passField].forEach(f => {
      f?.querySelector('input').addEventListener('input', () => stkClearFieldError(f));
    });

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const email = emailInput.value.trim();
      const password = passInput.value;

      stkClearFieldError(emailField);
      stkClearFieldError(passField);

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        stkSetFieldError(emailField, 'Enter a valid email address');
        valid = false;
      }
      if (!password) {
        stkSetFieldError(passField, 'Password is required');
        valid = false;
      }
      if (!valid) return;

      const users = stkGetUsers();
      const match = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!match || match.password !== password) {
        stkSetFieldError(passField, 'Email or password is incorrect');
        return;
      }

      const submitBtn = document.getElementById('loginSubmit');
      submitBtn.classList.add('au-loading');

      /* The Admin/User tab picked on this screen decides which dashboard to
         open — not whatever role the account was originally signed up with. */
      stkSetSession({ name: match.name, email: match.email, role: selectedRole });
      setTimeout(() => {
        window.location.href = selectedRole === 'admin' ? 'dashboard-admin.html' : 'dashboard-user.html';
      }, 550);
    });
  }

  /* =========================================================
     SIGNUP PAGE
     ========================================================= */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    const roleToggle = document.getElementById('signupRole');
    let selectedRole = 'user';

    roleToggle?.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRole = btn.dataset.role;
        roleToggle.dataset.role = selectedRole;
        roleToggle.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    const nameField = document.getElementById('signupNameField');
    const emailField = document.getElementById('signupEmailField');
    const passField = document.getElementById('signupPassField');
    const confirmField = document.getElementById('signupConfirmField');
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passInput = document.getElementById('signupPassword');
    const confirmInput = document.getElementById('signupConfirm');

    document.getElementById('signupTogglePass')?.addEventListener('click', function () {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      this.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });

    /* live password strength meter */
    const strengthBars = document.querySelectorAll('#signupStrength span');
    const strengthLabel = document.getElementById('signupStrengthLabel');
    passInput?.addEventListener('input', () => {
      const v = passInput.value;
      let score = 0;
      if (v.length >= 6) score++;
      if (v.length >= 10) score++;
      if (/[A-Z]/.test(v) && /[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const colors = ['#e0645f', '#e0645f', '#E8A33D', '#5fd88a'];
      const labels = ['Too weak', 'Weak', 'Good', 'Strong'];
      strengthBars.forEach((bar, i) => {
        bar.style.background = (v && i < score) ? colors[Math.min(score, 4) - 1] : 'rgba(244,239,230,0.12)';
      });
      strengthLabel.textContent = v ? (labels[Math.min(Math.max(score, 1), 4) - 1] || '') : '';
    });

    [nameField, emailField, passField, confirmField].forEach(f => {
      f?.querySelector('input').addEventListener('input', () => stkClearFieldError(f));
    });

    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passInput.value;
      const confirm = confirmInput.value;

      [nameField, emailField, passField, confirmField].forEach(stkClearFieldError);

      if (name.length < 2) { stkSetFieldError(nameField, 'Enter your full name'); valid = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        stkSetFieldError(emailField, 'Enter a valid email address'); valid = false;
      }
      if (password.length < 6) { stkSetFieldError(passField, 'Use at least 6 characters'); valid = false; }
      if (confirm !== password || !confirm) { stkSetFieldError(confirmField, 'Passwords do not match'); valid = false; }
      if (!valid) return;

      const users = stkGetUsers();

      const submitBtn = document.getElementById('signupSubmit');
      submitBtn.classList.add('au-loading');

      users.push({ name, email, password, role: selectedRole });
      stkSaveUsers(users);

      setTimeout(() => {
        document.getElementById('signupCard').classList.add('au-submitted');
        setTimeout(() => { window.location.href = 'login.html'; }, 1600);
      }, 500);
    });
  }

  /* =========================================================
     DASHBOARD SHELL (shared by admin + user)
     ========================================================= */
  const dashBody = document.body.classList.contains('dash-body');
  if (dashBody) {
    const requiredRole = document.body.dataset.role;
    const session = stkGetSession();
    if (!session || session.role !== requiredRole) {
      window.location.href = 'login.html';
      return;
    }

    /* populate identity */
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
    document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = session.email);
    document.querySelectorAll('[data-user-first]').forEach(el => el.textContent = session.name.split(' ')[0]);
    document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = session.name.charAt(0).toUpperCase());
    document.querySelectorAll('[data-user-name-input]').forEach(el => el.value = session.name);
    document.querySelectorAll('[data-user-email-input]').forEach(el => el.value = session.email);

    /* logout */
    document.querySelectorAll('[data-logout]').forEach(btn => btn.addEventListener('click', stkLogout));

    /* settings "save" — inline confirmation, never an alert */
    document.querySelectorAll('.dash-save-btn').forEach(btn => {
      const original = btn.textContent;
      btn.addEventListener('click', () => {
        btn.textContent = 'Saved ✓';
        btn.style.filter = 'brightness(1.1)';
        setTimeout(() => { btn.textContent = original; btn.style.filter = ''; }, 1800);
      });
    });

    /* generic status filter tabs for the Bookings / Fleet lists —
       filters .dash-list-row[data-status] elements inside the target list */
    document.querySelectorAll('[data-filter-tabs]').forEach(tabGroup => {
      const list = document.getElementById(tabGroup.dataset.filterTabs);
      if (!list) return;
      tabGroup.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          tabGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.dataset.filter;
          list.querySelectorAll('.dash-list-row').forEach(row => {
            const show = filter === 'all' || row.dataset.status === filter;
            row.classList.toggle('dash-row-hidden', !show);
          });
        });
      });
    });

    /* sidebar off-canvas (mobile) */
    const sidebar = document.getElementById('dashSidebar');
    const hamburger = document.getElementById('dashHamburger');
    const overlay = document.getElementById('dashOverlay');
    function closeSidebar() { sidebar.classList.remove('open'); hamburger.classList.remove('open'); overlay.classList.remove('show'); }
    function toggleSidebar() {
      const open = sidebar.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
    }
    hamburger?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', closeSidebar);

    /* nav: sliding indicator + panel switching */
    const navLinks = Array.from(document.querySelectorAll('.dash-nav a'));
    const indicator = document.getElementById('dashNavIndicator');
    const panels = Array.from(document.querySelectorAll('.dash-panel'));
    const soonPanel = document.getElementById('dashSoonPanel');
    const soonTitle = document.getElementById('dashSoonTitle');

    function moveIndicator(link) {
      if (!indicator || !link) return;
      indicator.style.transform = `translateY(${link.offsetTop}px)`;
    }
    function showPanel(key, label) {
      const target = document.getElementById('panel-' + key);
      panels.forEach(p => p.classList.toggle('active', p === target));
      if (!target && soonPanel) {
        soonPanel.classList.add('active');
        if (soonTitle) soonTitle.textContent = label;
      } else if (soonPanel) {
        soonPanel.classList.remove('active');
      }
    }
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        moveIndicator(link);
        showPanel(link.dataset.section, link.dataset.label || link.textContent.trim());
        closeSidebar();
      });
    });
    const initialActive = navLinks.find(l => l.classList.contains('active')) || navLinks[0];
    if (initialActive) { requestAnimationFrame(() => moveIndicator(initialActive)); }
    window.addEventListener('resize', () => moveIndicator(document.querySelector('.dash-nav a.active')));

    /* stat card count-up + bar fill */
    document.querySelectorAll('.dash-stat-card').forEach(card => {
      const numEl = card.querySelector('h3');
      const target = parseFloat(numEl.dataset.count || numEl.textContent);
      const prefix = numEl.dataset.prefix || '';
      const suffix = numEl.dataset.suffix || '';
      const decimals = numEl.dataset.decimals ? parseInt(numEl.dataset.decimals) : 0;
      let startTime = null;
      const duration = 1200;
      function tick(ts) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = target * eased;
        numEl.textContent = prefix + val.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      setTimeout(() => requestAnimationFrame(tick), 200);
      const bar = card.querySelector('.dash-stat-bar span');
      if (bar) setTimeout(() => { bar.style.width = (bar.dataset.pct || 60) + '%'; }, 300);
    });
    document.querySelectorAll('.dash-mini-progress .bar span').forEach(bar => {
      setTimeout(() => { bar.style.width = (bar.dataset.pct || 50) + '%'; }, 300);
    });

    /* ---------- dynamic email inbox ---------- */
    const emailListEl = document.getElementById('dashEmailList');
    if (emailListEl && window.STK_EMAILS) {
      let emails = window.STK_EMAILS.map((e, i) => ({ ...e, id: i }));
      let activeTab = 'all';
      let searchTerm = '';

      function escapeHtml(str) {
        return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
      }

      function renderEmails() {
        let list = emails.filter(e => {
          if (activeTab === 'unread' && !e.unread) return false;
          if (activeTab === 'flagged' && !e.flagged) return false;
          if (searchTerm) {
            const hay = (e.sender + ' ' + e.subject + ' ' + e.snippet).toLowerCase();
            if (!hay.includes(searchTerm)) return false;
          }
          return true;
        });

        if (!list.length) {
          emailListEl.innerHTML = '<div class="dash-email-empty"><i class="fa-regular fa-envelope-open"></i><p>No messages match here.</p></div>';
          return;
        }

        emailListEl.innerHTML = list.map((e, i) => `
          <div class="dash-email-row${e.unread ? ' unread' : ''}" data-id="${e.id}" style="animation-delay:${(i * 0.05).toFixed(2)}s">
            <div class="dash-email-avatar">${escapeHtml(e.sender.charAt(0))}</div>
            <div class="dash-email-body">
              <div class="dash-email-top">
                <strong>${escapeHtml(e.sender)}</strong>
                ${e.unread ? '<span class="dash-unread-dot"></span>' : ''}
                <span class="dash-email-tag">${escapeHtml(e.tag)}</span>
                <span class="dash-email-time">${escapeHtml(e.time)}</span>
              </div>
              <div class="dash-email-subject">${escapeHtml(e.subject)}</div>
              <div class="dash-email-snippet">${escapeHtml(e.snippet)}</div>
              <div class="dash-email-full">${escapeHtml(e.body)}</div>
            </div>
            <i class="fa-solid fa-chevron-right dash-email-chevron"></i>
          </div>
        `).join('');

        emailListEl.querySelectorAll('.dash-email-row').forEach(row => {
          row.addEventListener('click', () => {
            const id = parseInt(row.dataset.id);
            const wasOpen = row.classList.contains('open');
            emailListEl.querySelectorAll('.dash-email-row.open').forEach(r => r.classList.remove('open'));
            if (!wasOpen) {
              row.classList.add('open');
              const found = emails.find(e => e.id === id);
              if (found && found.unread) {
                found.unread = false;
                row.classList.remove('unread');
                row.querySelector('.dash-unread-dot')?.remove();
                updateUnreadBadge();
              }
            }
          });
        });
      }

      function updateUnreadBadge() {
        const count = emails.filter(e => e.unread).length;
        document.querySelectorAll('[data-unread-count]').forEach(el => {
          el.textContent = count;
          el.style.display = count ? 'inline-flex' : 'none';
        });
      }

      /* skeleton loading, then real render — premium loading feel */
      emailListEl.innerHTML = Array.from({ length: 4 }).map(() => '<div class="dash-skel-row"></div>').join('');
      setTimeout(() => { renderEmails(); updateUnreadBadge(); }, 550);

      document.querySelectorAll('.dash-inbox-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.dash-inbox-tabs button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeTab = btn.dataset.tab;
          renderEmails();
        });
      });
      document.getElementById('dashInboxSearch')?.addEventListener('input', e => {
        searchTerm = e.target.value.trim().toLowerCase();
        renderEmails();
      });
    }
  }
});