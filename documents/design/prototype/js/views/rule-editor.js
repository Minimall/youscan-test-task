    /*═══════════════════════════════════════════════════════════════
      RULE EDITOR SIDEBAR
    ═══════════════════════════════════════════════════════════════*/
    function openRuleEditorSidebar(ruleId) {
      // If ruleId provided, set up edit state; otherwise use existing state.ruleEditor
      if (ruleId !== undefined) {
        const r = RULE(ruleId);
        state.ruleEditor = { ruleId: r.id, draft: ruleToDraft(r), mode: 'sidebar', step: 'form' };
      }
      if (!state.ruleEditor) {
        state.ruleEditor = { ruleId: null, draft: blankRuleDraft(), mode: 'sidebar', step: 'preset' };
      }
      state.ruleEditor.mode = 'sidebar';

      const sidebar = $('#rule-editor-sidebar');
      _renderRuleEditorSidebar(sidebar);
      sidebar.classList.add('open');
      $('#backdrop').classList.add('active');
    }

    function closeRuleEditorSidebar() {
      const sidebar = $('#rule-editor-sidebar');
      sidebar.classList.remove('open');
      state.ruleEditor = null;
      // Only remove backdrop if notif is also closed
      if (!state.notifOpen && !state.cmdkOpen) $('#backdrop').classList.remove('active');
    }

    function _renderRuleEditorSidebar(sidebar) {
      const ed = state.ruleEditor;
      const isNew = !ed.ruleId;
      const ruleName = ed.draft.name || (isNew ? 'New rule' : RULE(ed.ruleId)?.name || 'Edit rule');
      const context = isNew ? 'New rule' : 'Editing rule';

      if (ed.step === 'preset') {
        sidebar.innerHTML = `
          <div class="resi-head">
            <div class="resi-meta">
              <div class="resi-context">${svg('rules', 11)} ${context}</div>
            </div>
            <div class="resi-actions">
              <button class="btn btn-ghost btn-sm" id="resi-cancel">Cancel</button>
            </div>
          </div>
          <div class="resi-preset-body">
            <div style="font-size:17px;font-weight:600;margin-bottom:5px">Choose a starting configuration</div>
            <div style="font-size:13px;color:var(--text-2);margin-bottom:20px">All fields are editable after — presets are just sensible defaults for your role.</div>
            <div class="preset-grid">
              ${[
                { k: 'pr', i: 'flame', n: 'PR Specialist', d: 'Crisis signals, journalist mentions, reputation alerts' },
                { k: 'smm', i: 'bolt', n: 'SMM', d: 'Engagement spikes, viral content, sentiment shifts' },
                { k: 'bm', i: 'analytics', n: 'Brand Manager', d: 'Share of voice, trend detection, competitor signals' },
                { k: 'custom', i: 'rules', n: 'Custom', d: 'Start from scratch with full control' }
              ].map(p => `
                <div class="preset-card" data-preset="${p.k}">
                  <div class="preset-icon">${svg(p.i, 16)}</div>
                  <div class="preset-name">${p.n}</div>
                  <div class="preset-desc">${p.d}</div>
                </div>`).join('')}
            </div>
          </div>`;
        sidebar.querySelector('#resi-cancel').onclick = closeRuleEditorSidebar;
        sidebar.querySelectorAll('[data-preset]').forEach(c => c.onclick = () => {
          state.ruleEditor.draft = presetDraft(c.dataset.preset);
          state.ruleEditor.step = 'form';
          _renderRuleEditorSidebar(sidebar);
        });
      } else {
        sidebar.innerHTML = `
          <div class="resi-head">
            <div class="resi-meta">
              <div class="resi-context">${svg('edit', 11)} ${context}</div>
              <div class="resi-title">${ruleName}</div>
            </div>
            <div class="resi-actions">
              <button class="btn btn-ghost btn-sm" id="resi-cancel">Cancel</button>
              <button class="btn btn-primary btn-sm" id="resi-save">${svg('check', 13)} Save rule</button>
            </div>
          </div>
          <div class="resi-body">
            <div class="rule-editor">
              <div class="rule-form">${ruleFormFieldsHTML()}</div>
              <div class="rule-chart-side">${ruleSummaryHTML()}${ruleForecastHTML()}</div>
            </div>
          </div>`;
        sidebar.querySelector('#resi-cancel').onclick = closeRuleEditorSidebar;
        sidebar.querySelector('#resi-save').onclick = () => saveRule();
        _bindRuleEditorForm(sidebar);
      }
    }

    function _bindRuleEditorForm(scope) {
      const update = (path, val) => {
        const parts = path.split('.');
        let obj = state.ruleEditor.draft;
        for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
        obj[parts[parts.length - 1]] = val;
        refreshSummaryAndForecast(scope);
      };
      scope.querySelectorAll('[data-f]').forEach(inp => {
        if (inp.tagName === 'SELECT') inp.onchange = () => update(inp.dataset.f, inp.value);
        else if (inp.type === 'number') inp.oninput = () => update(inp.dataset.f, Math.max(1, +inp.value || 1));
        else inp.oninput = () => update(inp.dataset.f, inp.value);
      });
      // Stepper buttons
      scope.querySelectorAll('.stepper').forEach(stepper => {
        const input = stepper.querySelector('.stepper-val');
        const dec = stepper.querySelector('.stepper-dec');
        const inc = stepper.querySelector('.stepper-inc');
        if (!input) return;
        if (dec) dec.onclick = () => {
          input.value = Math.max(+(input.min) || 1, (+input.value || 1) - 1);
          input.dispatchEvent(new Event('input'));
        };
        if (inc) inc.onclick = () => {
          input.value = Math.max(1, (+input.value || 1) + 1);
          input.dispatchEvent(new Event('input'));
        };
      });
      // Name field → update resi-title
      const nameInput = scope.querySelector('[data-f="name"]');
      if (nameInput) nameInput.oninput = (ev) => {
        update('name', ev.target.value);
        const title = scope.querySelector('.resi-title');
        if (title) title.textContent = ev.target.value || 'New rule';
      };
      // Severity pills
      scope.querySelectorAll('[data-sev-set]').forEach(p => {
        p.onclick = () => {
          state.ruleEditor.draft.severity = p.dataset.sevSet;
          scope.querySelector('.rule-form').innerHTML = ruleFormFieldsHTML();
          scope.querySelector('.rule-chart-side').innerHTML = ruleSummaryHTML() + ruleForecastHTML();
          _bindRuleEditorForm(scope);
        };
      });
      // Multi-select chip toggles (platform, tier)
      scope.querySelectorAll('[data-ms]').forEach(chip => {
        chip.onclick = () => {
          const field = chip.dataset.ms;
          const val = chip.dataset.val;
          const arr = state.ruleEditor.draft.conditions[field];
          const idx = arr.indexOf(val);
          if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
          scope.querySelector('.rule-form').innerHTML = ruleFormFieldsHTML();
          scope.querySelector('.rule-chart-side').innerHTML = ruleSummaryHTML() + ruleForecastHTML();
          _bindRuleEditorForm(scope);
        };
      });
      scope.querySelectorAll('[data-ms-any]').forEach(chip => {
        chip.onclick = () => {
          state.ruleEditor.draft.conditions[chip.dataset.msAny] = [];
          scope.querySelector('.rule-form').innerHTML = ruleFormFieldsHTML();
          scope.querySelector('.rule-chart-side').innerHTML = ruleSummaryHTML() + ruleForecastHTML();
          _bindRuleEditorForm(scope);
        };
      });
      bindForecastBars(scope);
    }

    /*═══════════════════════════════════════════════════════════════
      VIEW: Rule editor (kept for backward compat — now opens sidebar)
    ═══════════════════════════════════════════════════════════════*/
    function viewRuleEditor() {
      // Redirect to sidebar; render the previous route instead
      const wrap = el('div', { style: 'flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-3)' });
      return wrap;
    }

    /*═══════════════════════════════════════════════════════════════
      EDIT-FROM-ALERT (now uses the sidebar)
    ═══════════════════════════════════════════════════════════════*/
    function openEditFromAlert(a) {
      openRuleEditorSidebar(a.ruleId);
    }

    /*═══════════════════════════════════════════════════════════════
      HELPERS
    ═══════════════════════════════════════════════════════════════*/
    function blankRuleDraft() {
      return {
        name: '', topicId: 't1', severity: 'info',
        conditions: { sentiment: 'any', platforms: [], tiers: [], keywords: '' },
        threshold: { count: 5, window: 1, unit: 'hour' }, recipients: 'topic-watchers'
      };
    }
    function ruleToDraft(r) {
      const d = JSON.parse(JSON.stringify(r));
      if (!d.conditions.platforms) {
        d.conditions.platforms = (!d.conditions.platform || d.conditions.platform === 'any') ? [] : [d.conditions.platform];
      }
      if (!d.conditions.tiers) {
        d.conditions.tiers = (!d.conditions.authorTier || d.conditions.authorTier === 'any') ? []
          : d.conditions.authorTier === 'medium-or-higher' ? ['medium', 'high']
          : [d.conditions.authorTier];
      }
      return d;
    }
    function presetDraft(p) {
      const presets = {
        pr: {
          name: 'Brand Reputation Crisis', severity: 'critical',
          conditions: { sentiment: 'negative', platforms: ['Twitter/X'], tiers: ['medium', 'high'], keywords: '' },
          threshold: { count: 3, window: 1, unit: 'hour' }, topicId: 't1', recipients: 'topic-watchers'
        },
        smm: {
          name: 'Engagement Spike', severity: 'important',
          conditions: { sentiment: 'any', platforms: ['Instagram'], tiers: [], keywords: '' },
          threshold: { count: 50, window: 1, unit: 'hour' }, topicId: 't2', recipients: 'topic-watchers'
        },
        bm: {
          name: 'Share-of-Voice Trend', severity: 'info',
          conditions: { sentiment: 'any', platforms: [], tiers: [], keywords: 'Adidas' },
          threshold: { count: 25, window: 1, unit: 'day' }, topicId: 't3', recipients: 'topic-watchers'
        },
        custom: blankRuleDraft(),
      };
      return presets[p];
    }

    function ruleFormFieldsHTML() {
      const d = state.ruleEditor.draft;
      const ps = d.conditions.platforms || [];
      const ts = d.conditions.tiers || [];
      const sentimentOptions = [['any', 'Any'], ['negative', 'Negative'], ['positive', 'Positive'], ['neutral', 'Neutral']];
      const platChips = [
        ['Twitter/X', svg('twitter', 11)], ['Instagram', svg('ig', 11)], ['Facebook', svg('fb', 11)],
        ['Reddit', svg('reddit', 11)], ['LinkedIn', svg('linkedin', 11)],
        ['YouTube', svg('youtube', 11)], ['TikTok', svg('tiktok', 11)], ['News sites', svg('globe', 11)],
      ];
      const tierChips = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']];

      return `
    <div class="field">
      <label class="field-label">Rule name</label>
      <input class="field-input" data-f="name" value="${d.name || ''}" placeholder="e.g. Brand Reputation Crisis" />
    </div>
    <div class="field">
      <label class="field-label">Topic</label>
      <div class="inline-select">
        <select data-f="topicId">
          ${TOPICS.map(t => `<option value="${t.id}" ${d.topicId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
        </select>
        <span class="select-chevron">${svg('chevronRight', 10)}</span>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Conditions</label>
      <div class="conditions-card">
        <div class="conditions-card-row">
          <span class="conditions-card-label">Sentiment</span>
          <div class="inline-select"><select data-f="conditions.sentiment">
            ${sentimentOptions.map(([v, l]) => `<option value="${v}" ${d.conditions.sentiment === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select><span class="select-chevron">${svg('chevronRight', 10)}</span></div>
        </div>
        <div class="conditions-card-row" style="align-items:flex-start;padding-top:11px;padding-bottom:11px">
          <span class="conditions-card-label" style="padding-top:3px">Platform</span>
          <div class="ms-chips">
            <span class="ms-chip ${ps.length === 0 ? 'active' : ''}" data-ms-any="platforms">All</span>
            ${platChips.map(([v, icon]) => `<span class="ms-chip ${ps.includes(v) ? 'active' : ''}" data-ms="platforms" data-val="${v}">${icon} ${v}</span>`).join('')}
          </div>
        </div>
        <div class="conditions-card-row" style="align-items:flex-start;padding-top:11px;padding-bottom:11px">
          <span class="conditions-card-label" style="padding-top:3px">Author tier</span>
          <div class="ms-chips">
            <span class="ms-chip ${ts.length === 0 ? 'active' : ''}" data-ms-any="tiers">Any</span>
            ${tierChips.map(([v, l]) => `<span class="ms-chip ${ts.includes(v) ? 'active' : ''}" data-ms="tiers" data-val="${v}">${l}</span>`).join('')}
          </div>
        </div>
        <div class="conditions-card-row">
          <span class="conditions-card-label">Keywords</span>
          <input class="field-input" style="max-width:280px;flex:1" data-f="conditions.keywords" value="${d.conditions.keywords || ''}" placeholder="comma-separated, optional" />
        </div>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Threshold</label>
      <div class="threshold-control">
        <div class="threshold-row">
          <span class="threshold-row-label">Mention count</span>
          <div class="stepper">
            <button class="stepper-btn stepper-dec" type="button">−</button>
            <input class="stepper-val" type="number" data-f="threshold.count" min="1" value="${d.threshold.count}" onfocus="this.select()" />
            <button class="stepper-btn stepper-inc" type="button">+</button>
          </div>
          <span class="threshold-hint">mentions</span>
        </div>
        <div class="threshold-row">
          <span class="threshold-row-label">Time window</span>
          <div class="stepper">
            <button class="stepper-btn stepper-dec" type="button">−</button>
            <input class="stepper-val" type="number" data-f="threshold.window" min="1" value="${d.threshold.window}" onfocus="this.select()" />
            <button class="stepper-btn stepper-inc" type="button">+</button>
          </div>
          <div class="inline-select" style="margin-left:4px"><select data-f="threshold.unit">
            ${[['minutes', 'minutes'], ['hour', 'hour'], ['day', 'day'], ['week', 'week']].map(([v, l]) => `<option value="${v}" ${d.threshold.unit === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select><span class="select-chevron">${svg('chevronRight', 10)}</span></div>
        </div>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Severity</label>
      <div class="field-row">
        ${['info', 'important', 'critical'].map(s => `
          <span class="filter-pill ${d.severity === s ? 'active' : ''}" data-sev-set="${s}">
            <span class="pill-dot" style="background:var(--${s})"></span>${s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        `).join('')}
      </div>
    </div>
    <div class="field">
      <label class="field-label">Recipients</label>
      <div class="recipient-pills" style="margin-bottom:4px">
        ${(TOPIC(d.topicId)?.watchers || []).map((name, i) => {
          const avatarColors = ['#7c3aed','#0891b2','#15803d','#b45309','#dc2626','#db2777','#0369a1','#65a30d'];
          const initials = name.split(' ').map(w => w[0]).join('').slice(0,2);
          const col = avatarColors[i % avatarColors.length];
          return `<span class="recipient-pill">
            <span class="rp-avatar" style="background:${col}">${initials}</span>
            <span style="font-weight:500">${name.split(' ')[0]}</span>
            <span class="rp-channels">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C9.64 5.36 8 7.93 8 11v5l-2 2v1h16v-1l-2-2z"/></svg>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </span>
            <button class="rp-remove" onclick="void 0" title="Remove">×</button>
          </span>`;
        }).join('')}
        <button class="recipient-add-btn" onclick="void 0">${svg('plus', 11)} Add</button>
      </div>
    </div>`;
    }

    function ruleSummaryHTML() {
      const d = state.ruleEditor.draft;
      return `
    <div class="summary-box" id="rule-summary-box" style="margin-bottom:16px">
      <div class="summary-label">Rule summary</div>
      <div class="summary-text" id="rule-summary-text">${ruleSummary(d)}</div>
    </div>`;
    }

    function ruleSummary(d) {
      const cs = [];
      if (d.conditions.sentiment !== 'any') cs.push(`<em>${d.conditions.sentiment}</em>`);
      cs.push('mentions');
      const platforms = d.conditions.platforms?.length ? d.conditions.platforms
        : (d.conditions.platform && d.conditions.platform !== 'any' ? [d.conditions.platform] : []);
      if (platforms.length) cs.push(`on <em>${platforms.join(', ')}</em>`);
      const tiers = d.conditions.tiers?.length ? d.conditions.tiers
        : (d.conditions.authorTier && d.conditions.authorTier !== 'any' ? [d.conditions.authorTier.replace(/-/g, ' ')] : []);
      if (tiers.length) cs.push(`from <em>${tiers.join(', ')} tier</em> authors`);
      if (d.conditions.keywords) cs.push(`mentioning <em>${d.conditions.keywords}</em>`);
      const t = TOPIC(d.topicId)?.name || 'this topic';
      return `Fire when ${cs.join(' ')} on <em>${t}</em> exceed <em>${d.threshold.count} per ${d.threshold.window} ${d.threshold.unit}</em>. Severity: <em>${d.severity}</em>.`;
    }

    function ruleForecastHTML() {
      const d = state.ruleEditor.draft;
      const fakeRule = { ...d, _tooLoose: d.threshold.count <= 1 && d.conditions.sentiment === 'any' && d.conditions.platform === 'any' };
      const data = generateForecast(fakeRule);
      const total = forecastTotal(data);
      const perDay = forecastPerDay(data);
      const tooLoose = total > 200;
      const max = Math.max(...data, 1);
      const dayLabels = [];
      for (let i = 29; i >= 0; i--) {
        const dt = new Date(NOW - i * DAY);
        dayLabels.push(dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      return `
    <div class="fc-head">
      <div class="fc-stat">
        <div class="fc-stat-num">${total}</div>
        <div class="fc-stat-label">Would have fired in last 30 days</div>
      </div>
      <div class="fc-meta">~${perDay} / day<br/>Updated live as you edit</div>
    </div>
    ${tooLoose ? `
      <div class="warn-strip">
        <span class="warn-strip-icon">${svg('alertTri', 14)}</span>
        <div><strong>High fire rate.</strong> This configuration would fire ~${Math.round(perDay)} times per day. Consider raising the threshold or narrowing the filter.</div>
      </div>` : ''}
    <div class="fc-chart" id="fc-chart">
      <div class="fc-bars" id="fc-bars">
        ${data.map((v, i) => {
        const h = v === 0 ? 2 : Math.max(3, (v / max) * 82);
        const cls = tooLoose ? 'fc-bar warn' : 'fc-bar';
        const z = v === 0 ? ' zero' : '';
        return `<div class="${cls}${z}" data-day="${dayLabels[i]}" data-count="${v}" style="height:${h}px"></div>`;
      }).join('')}
      </div>
      <div class="fc-baseline"></div>
      <div class="fc-axis"><span>${dayLabels[0]}</span><span>${dayLabels[10]}</span><span>${dayLabels[20]}</span><span>${dayLabels[29]}</span></div>
    </div>
    <div class="samples-box" id="samples-box" style="display:none">
      <div class="samples-head"><div><span class="samples-day"></span> <span class="samples-sub"></span></div></div>
      <div class="samples-content"></div>
    </div>
    <div style="font-size:11px;color:var(--text-3);margin-top:10px;line-height:1.5">Click any bar to see what would have fired that day. Forecast is based on the last 30 days of mention data.</div>`;
    }

    let _forecastDebounce;
    function refreshSummaryAndForecast(scope) {
      const d = state.ruleEditor.draft;
      // Summary updates instantly
      const sb = scope.querySelector('#rule-summary-text');
      if (sb) { sb.innerHTML = ruleSummary(d); sb.parentElement.classList.add('flash'); setTimeout(() => sb.parentElement.classList.remove('flash'), 800); }
      // Forecast updates debounced
      clearTimeout(_forecastDebounce);
      _forecastDebounce = setTimeout(() => {
        const chartTarget = scope.querySelector('.rule-chart-side');
        if (chartTarget) {
          chartTarget.innerHTML = ruleSummaryHTML() + ruleForecastHTML();
          bindForecastBars(scope);
        }
      }, 200);
    }

    function bindForecastBars(scope) {
      scope.querySelectorAll('.fc-bar').forEach(bar => {
        bar.onmouseenter = () => {
          const existing = scope.querySelector('.fc-tip'); if (existing) existing.remove();
          const fcChart = scope.querySelector('.fc-chart');
          if (!fcChart) return;
          const rect = bar.getBoundingClientRect(), parentRect = fcChart.getBoundingClientRect();
          const tip = document.createElement('div'); tip.className = 'fc-tip';
          tip.innerHTML = `<span class="fc-tip-date">${bar.dataset.day}</span>${bar.dataset.count} ${+bar.dataset.count===1?'fire':'fires'}`;
          tip.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
          tip.style.top = (rect.top - parentRect.top) + 'px';
          fcChart.appendChild(tip);
        };
        bar.onmouseleave = () => {
          if (!bar.classList.contains('active')) {
            const tip = scope.querySelector('.fc-tip'); if (tip) tip.remove();
          }
        };
        bar.onclick = () => {
          scope.querySelectorAll('.fc-bar').forEach(b => b.classList.remove('active'));
          bar.classList.add('active');
          const box = scope.querySelector('#samples-box');
          if (!box) return;
          box.style.display = 'block';
          box.querySelector('.samples-day').textContent = bar.dataset.day;
          box.querySelector('.samples-sub').textContent = `${bar.dataset.count} fire${bar.dataset.count === '1' ? '' : 's'}`;
          const draft = state.ruleEditor.draft;
          const _ps = draft.conditions.platforms?.length ? draft.conditions.platforms : (draft.conditions.platform ? [draft.conditions.platform] : []);
          const samples = draft.conditions.sentiment === 'negative' ? MENTION_BANK.crisis : _ps.includes('Instagram') ? MENTION_BANK.influencer : draft.conditions.keywords ? MENTION_BANK.campaign : MENTION_BANK.crisis;
          const n = Math.min(+bar.dataset.count || 1, 5);
          box.querySelector('.samples-content').innerHTML = samples.slice(0, Math.max(1, n)).map(m => mentionCard(m)).join('') || '<div style="font-size:12px;color:var(--text-3);padding:8px 0">No mentions matched on this day.</div>';
          const fcChart = scope.querySelector('.fc-chart');
          if (!fcChart) return;
          const existing = scope.querySelector('.fc-tip'); if (existing) existing.remove();
          const rect = bar.getBoundingClientRect(), parentRect = fcChart.getBoundingClientRect();
          const tip = document.createElement('div'); tip.className = 'fc-tip';
          tip.innerHTML = `<span class="fc-tip-date">${bar.dataset.day}</span>${bar.dataset.count} ${+bar.dataset.count===1?'fire':'fires'}`;
          tip.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
          tip.style.top = (rect.top - parentRect.top) + 'px';
          fcChart.appendChild(tip);
        };
      });
    }

    function saveRule() {
      const d = state.ruleEditor.draft;
      if (!d.name) { toast('Rule name is required', { kind: 'warn' }); return; }
      if (state.ruleEditor.ruleId) {
        Object.assign(RULE(state.ruleEditor.ruleId), d);
        toast(`Rule "${d.name}" updated`);
      } else {
        const newRule = { ...d, id: `r${Date.now()}`, fired7d: 0, fired30d: 0, muteRate: 0, lastFired: null, createdBy: 'Kateryna P.', createdAt: NOW };
        RULES.unshift(newRule);
        toast(`Rule "${d.name}" created`);
      }
      closeRuleEditorSidebar();
      navigate('rules');
    }
