    /*═══════════════════════════════════════════════════════════════
      DEBUG / DEMO PANEL
    ═══════════════════════════════════════════════════════════════*/
    const DEMO = {
      injectCritical() {
        const newAlert = {
          id: 'a' + Date.now(), ruleId: 'r1', topicId: 't1', severity: 'critical',
          firedAt: NOW - 1 * MIN, status: 'new', read: false,
          matched: ['Sentiment: negative', 'Platform: Twitter/X', 'Volume: >3 / hour'],
          matchCount: 5 + Math.floor(Math.random() * 5), mentionsKey: 'crisis'
        };
        ALERTS_DATA.unshift(newAlert);
        state.inboxFilter.status = 'new';
        if (state.route.name !== 'inbox' && state.route.name !== 'alert-detail') navigate('inbox');
        else renderAll();
        setTimeout(() => {
          const r = $$(`.alert-row[data-id="${newAlert.id}"]`)[0];
          if (r) r.classList.add('entering');
        }, 30);
        toast('Critical alert fired · Brand Reputation Crisis', { kind: 'critical', timeout: 6000 });
      },
      injectImportant() {
        const newAlert = {
          id: 'a' + Date.now(), ruleId: 'r2', topicId: 't2', severity: 'important',
          firedAt: NOW - 1 * MIN, status: 'new', read: false,
          matched: ['Verified journalists: 2', 'Window: 30 min'],
          matchCount: 2 + Math.floor(Math.random() * 3), mentionsKey: 'journalist'
        };
        ALERTS_DATA.unshift(newAlert);
        if (state.route.name === 'inbox' || state.route.name === 'alert-detail') renderAll();
        else { state.route.name = 'inbox'; renderAll(); }
        setTimeout(() => {
          const r = $$(`.alert-row[data-id="${newAlert.id}"]`)[0];
          if (r) r.classList.add('entering');
        }, 30);
        toast('Important alert fired · Journalist mention spike');
      },
      injectInfo() {
        const newAlert = {
          id: 'a' + Date.now(), ruleId: 'r6', topicId: 't4', severity: 'info',
          firedAt: NOW - 1 * MIN, status: 'new', read: false,
          matched: ['Keyword: #NikeHoliday'],
          matchCount: 5 + Math.floor(Math.random() * 8), mentionsKey: 'campaign'
        };
        ALERTS_DATA.unshift(newAlert);
        renderAll();
        toast('Info alert fired');
      },
      triggerToast() { toast('Sample toast notification', { action: 'Undo', onAction: () => { } }); },
      goWarning() {
        state.ruleEditor = { ruleId: null, draft: { ...blankRuleDraft(), name: 'High-volume test', threshold: { count: 1, window: 1, unit: 'hour' }, conditions: { sentiment: 'any', platform: 'any', authorTier: 'any', keywords: '' } }, mode: 'page', step: 'form' };
        state.route = { name: 'rule-editor', params: {} };
        renderAll();
      },
      goEditFromAlert() {
        const a = ALERTS_DATA.find(x => x.severity === 'critical' && x.status === 'new') || ALERTS_DATA[0];
        state.selectedAlertId = a.id; a.read = true;
        state.route.name = 'alert-detail';
        renderAll();
        setTimeout(() => {
          const pane = $('.detail-pane');
          if (pane) openEditFromAlert(a, pane);
        }, 100);
      },
      scenarioCalm() {
        ALERTS_DATA.forEach(a => { a.status = 'acknowledged'; a.read = true; });
        state.route.name = 'inbox';
        state.inboxFilter.status = 'acknowledged';
        renderAll();
        toast('Scenario: Calm · 0 unread alerts');
      },
      scenarioActive() {
        ALERTS_DATA.length = 0;
        [
          ['r1', 't1', 'critical', 'crisis', 16 * MIN, 5],
          ['r2', 't2', 'important', 'journalist', 2 * HOUR + 28 * MIN, 3],
          ['r4', 't2', 'important', 'influencer', 3 * HOUR + 12 * MIN, 1],
          ['r6', 't4', 'info', 'campaign', 4 * HOUR, 8],
          ['r3', 't1', 'info', 'drift', 1 * DAY + 6 * HOUR, 12],
        ].forEach(([rid, tid, sev, mk, ago, n], i) => {
          const r = RULE(rid);
          ALERTS_DATA.push({ id: 'sa' + i, ruleId: rid, topicId: tid, severity: sev, firedAt: NOW - ago, status: 'new', read: i > 2, matched: [`Sentiment: ${r.conditions.sentiment}`, `Platform: ${r.conditions.platform}`], matchCount: n, mentionsKey: mk });
        });
        state.inboxFilter.status = 'new';
        state.route.name = 'inbox';
        renderAll();
        toast('Scenario: Active · 3 unread, 1 critical');
      },
      scenarioCrisis() {
        document.getElementById('app').classList.add('crisis-mode');
        [1, 2, 3, 4, 5, 6].forEach((_, i) => setTimeout(() => {
          const newAlert = {
            id: 'crisis' + i, ruleId: 'r1', topicId: 't1', severity: i < 3 ? 'critical' : 'important',
            firedAt: NOW - (i + 1) * MIN, status: 'new', read: false,
            matched: ['Sentiment: negative', 'Platform: Twitter/X'],
            matchCount: 4 + Math.floor(Math.random() * 8), mentionsKey: 'crisis'
          };
          ALERTS_DATA.unshift(newAlert);
          renderAll();
        }, i * 180));
        setTimeout(() => toast('Scenario: Crisis active · multiple critical alerts firing'), 300);
      },
      scenarioEmpty() {
        ALERTS_DATA.length = 0;
        state.route.name = 'inbox';
        state.selectedAlertId = null;
        renderAll();
        toast('Scenario: Empty inbox');
      },
      reset() {
        location.reload();
      },
      toggleDark() { toggleDark(); },
      toggleMobile() {
        document.body.classList.toggle('mobile-preview');
        const has = document.body.classList.contains('mobile-preview');
        if (has) {
          document.body.style.cssText = 'max-width:420px;margin:0 auto;border-left:1px solid var(--border);border-right:1px solid var(--border);box-shadow:0 0 0 100vmax #1c1c1a;clip-path:inset(0)';
        } else {
          document.body.style.cssText = '';
        }
        renderAll();
      },
    };

    function renderDebug() {
      const fab = $('#debug-fab'), panel = $('#debug-panel');
      fab.classList.toggle('hidden', state.debugOpen);
      panel.classList.toggle('open', state.debugOpen);
      if (!state.debugOpen) return;

      const isDark = document.documentElement.classList.contains('dark');
      panel.innerHTML = `
    <div class="debug-header">
      <div class="debug-title"><span class="pulse"></span>Demo controls</div>
      <button class="debug-close" id="debug-close">${svg('close', 13)}</button>
    </div>
    <div class="debug-body">
      <div class="debug-section">
        <div class="debug-section-label">Trigger events</div>
        <div class="debug-grid">
          <button class="debug-btn" data-d="injectCritical"><span class="dbtn-icon" style="color:#ef4444">${svg('flame', 12)}</span>Critical alert</button>
          <button class="debug-btn" data-d="injectImportant"><span class="dbtn-icon" style="color:#f59e0b">${svg('alertTri', 12)}</span>Important</button>
          <button class="debug-btn" data-d="injectInfo"><span class="dbtn-icon" style="color:#6b7280">${svg('alerts', 12)}</span>Info alert</button>
          <button class="debug-btn" data-d="triggerToast"><span class="dbtn-icon">${svg('check', 12)}</span>Show toast</button>
        </div>
      </div>
      <div class="debug-section">
        <div class="debug-section-label">Scenarios</div>
        <div class="debug-grid">
          <button class="debug-btn" data-d="scenarioCalm">${svg('check', 12)} Calm day</button>
          <button class="debug-btn" data-d="scenarioActive">${svg('alerts', 12)} Active</button>
          <button class="debug-btn" data-d="scenarioCrisis">${svg('flame', 12)} Crisis mode</button>
          <button class="debug-btn" data-d="scenarioEmpty">${svg('inbox', 12)} Empty inbox</button>
        </div>
      </div>
      <div class="debug-section">
        <div class="debug-section-label">Quick jumps</div>
        <div class="debug-grid">
          <button class="debug-btn" data-d="goEditFromAlert" data-arg="">${svg('edit', 12)} Edit-from-alert</button>
          <button class="debug-btn" data-d="goWarning">${svg('alertTri', 12)} Forecast warn</button>
          <button class="debug-btn debug-btn-full" onclick="openNotif()">${svg('alerts', 12)} Open notification center</button>
          <button class="debug-btn debug-btn-full" onclick="openCmdK()">${svg('search', 12)} Open command palette ⌘K</button>
        </div>
      </div>
      <div class="debug-section">
        <div class="debug-section-label">View</div>
        <div class="debug-toggle ${isDark ? 'on' : ''}" id="dark-toggle">
          <span>${svg('moon', 12)} Dark mode</span>
          <span class="debug-toggle-switch"></span>
        </div>
      </div>
      <div class="debug-section">
        <div class="debug-section-label">State</div>
        <div class="debug-stats">
          <div class="debug-stat"><span>Alerts (total)</span><span class="debug-stat-val">${ALERTS_DATA.length}</span></div>
          <div class="debug-stat"><span>New unread</span><span class="debug-stat-val">${ALERTS_DATA.filter(a => !a.read && a.status === 'new').length}</span></div>
          <div class="debug-stat"><span>Rules</span><span class="debug-stat-val">${RULES.length}</span></div>
          <div class="debug-stat"><span>Route</span><span class="debug-stat-val">${state.route.name}</span></div>
        </div>
      </div>
      <div class="debug-section">
        <button class="debug-btn debug-btn-full danger" data-d="reset">${svg('refresh', 12)} Reset prototype</button>
      </div>
    </div>`;
      panel.querySelector('#debug-close').onclick = () => { state.debugOpen = false; renderDebug(); };
      panel.querySelectorAll('[data-d]').forEach(b => {
        b.onclick = () => DEMO[b.dataset.d]?.();
      });
      panel.querySelector('#dark-toggle').onclick = toggleDark;
    }

