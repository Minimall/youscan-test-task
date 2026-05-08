    /*═══════════════════════════════════════════════════════════════
      EDIT-FROM-ALERT (slide-in editor panel over detail)
    ═══════════════════════════════════════════════════════════════*/
    function openEditFromAlert(a, parentPane) {
      const r = RULE(a.ruleId);
      state.ruleEditor = { ruleId: r.id, draft: ruleToDraft(r), mode: 'panel', step: 'form' };

      // Widen the detail pane so alert content stays visible alongside the editor
      parentPane.classList.add('with-editor');
      parentPane.style.position = 'relative';
      const existing = parentPane.querySelector('.editor-panel');
      if (existing) existing.remove();

      const panel = el('div', { class: 'editor-panel' });
      panel.innerHTML = ruleEditorPanelHTML();
      parentPane.appendChild(panel);
      requestAnimationFrame(() => panel.classList.add('open'));

      bindRuleEditor(panel, true, () => {
        panel.classList.remove('open');
        setTimeout(() => {
          panel.remove();
          parentPane.classList.remove('with-editor');
        }, 200);
        state.ruleEditor = null;
      });
    }

    /*═══════════════════════════════════════════════════════════════
      VIEW: Rule editor (full-page)
    ═══════════════════════════════════════════════════════════════*/
    function blankRuleDraft() {
      return {
        name: '', topicId: 't1', severity: 'info',
        conditions: { sentiment: 'any', platform: 'any', authorTier: 'any', keywords: '' },
        threshold: { count: 5, window: 1, unit: 'hour' }, recipients: 'topic-watchers'
      };
    }
    function ruleToDraft(r) { return JSON.parse(JSON.stringify(r)); }
    function presetDraft(p) {
      const presets = {
        pr: {
          name: 'Brand Reputation Crisis', severity: 'critical',
          conditions: { sentiment: 'negative', platform: 'Twitter/X', authorTier: 'medium-or-higher', keywords: '' },
          threshold: { count: 3, window: 1, unit: 'hour' }, topicId: 't1', recipients: 'topic-watchers'
        },
        smm: {
          name: 'Engagement Spike', severity: 'important',
          conditions: { sentiment: 'any', platform: 'Instagram', authorTier: 'any', keywords: '' },
          threshold: { count: 50, window: 1, unit: 'hour' }, topicId: 't2', recipients: 'topic-watchers'
        },
        bm: {
          name: 'Share-of-Voice Trend', severity: 'info',
          conditions: { sentiment: 'any', platform: 'any', authorTier: 'any', keywords: 'Adidas' },
          threshold: { count: 25, window: 1, unit: 'day' }, topicId: 't3', recipients: 'topic-watchers'
        },
        custom: blankRuleDraft(),
      };
      return presets[p];
    }

    function viewRuleEditor() {
      if (!state.ruleEditor) state.ruleEditor = { ruleId: null, draft: blankRuleDraft(), mode: 'page', step: 'preset' };
      const ed = state.ruleEditor;
      const wrap = el('div', { style: 'flex:1;display:flex;flex-direction:column;overflow:hidden' });
      // Top action bar (page mode only)
      const bar = el('div', { class: 'list-header', style: 'padding:12px 24px;flex-direction:row;align-items:center;gap:12px' });
      bar.innerHTML = `
    <div style="flex:1;display:flex;align-items:center;gap:10px">
      <span class="list-title" style="font-size:15px">${ed.ruleId ? RULE(ed.ruleId).name : (ed.draft.name || 'New rule')}</span>
    </div>
    <button class="btn btn-ghost btn-sm" id="cancel-rule">${svg('close', 13)} Cancel</button>
    <button class="btn btn-primary btn-sm" id="save-rule">${svg('check', 13)} Save rule</button>`;
      wrap.appendChild(bar);

      if (ed.step === 'preset') {
        const presetView = el('div', { class: 'tbl-wrap', style: 'background:var(--bg-card)' });
        presetView.innerHTML = `
      <div style="max-width:780px">
        <div style="font-size:18px;font-weight:600;margin-bottom:6px">Choose a starting configuration</div>
        <div style="font-size:13px;color:var(--text-2);margin-bottom:24px">All fields are editable after — presets are just sensible defaults for your role.</div>
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
        wrap.appendChild(presetView);
        setTimeout(() => {
          presetView.querySelectorAll('[data-preset]').forEach(c => c.onclick = () => {
            state.ruleEditor.draft = presetDraft(c.dataset.preset);
            state.ruleEditor.step = 'form';
            renderView();
          });
        }, 0);
      } else {
        // Two-column form + chart
        const form = el('div', { class: 'rule-editor' });
        form.innerHTML = ruleEditorBodyHTML();
        wrap.appendChild(form);
        setTimeout(() => {
          bindRuleEditor(form, false, null);
        }, 0);
      }

      // Bind top bar
      setTimeout(() => {
        bar.querySelector('#cancel-rule').onclick = () => navigate('rules');
        bar.querySelector('#save-rule').onclick = () => saveRule();
      }, 0);

      return wrap;
    }

    function ruleEditorBodyHTML() {
      return `
    <div class="rule-form">${ruleFormFieldsHTML()}</div>
    <div class="rule-chart-side">${ruleForecastHTML()}</div>`;
    }
    function ruleEditorPanelHTML() {
      return `
    <div class="editor-panel-head">
      <div>
        <div class="ep-context">${svg('edit', 11)} Editing rule</div>
        <div class="ep-title">${state.ruleEditor.draft.name || 'New rule'}</div>
      </div>
      <button class="icon-btn" data-act="close-editor">${svg('close', 14)}</button>
    </div>
    <div class="editor-panel-body">
      <div style="display:flex;flex-direction:column">
        ${ruleFormFieldsHTML(true)}
        <div class="editor-divider"></div>
        ${ruleForecastHTML(true)}
      </div>
    </div>
    <div class="editor-panel-foot">
      <button class="btn btn-primary btn-sm" data-act="save-editor">${svg('check', 13)} Save changes</button>
      <button class="btn btn-ghost btn-sm" data-act="close-editor">Cancel</button>
    </div>`;
    }

    function ruleFormFieldsHTML(compact = false) {
      const d = state.ruleEditor.draft;
      return `
    ${!compact ? `
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
        ${svg('chevronRight', 11)}
      </div>
    </div>` : ''}
    <div class="field">
      <label class="field-label">Conditions</label>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="field-row">
          <span class="field-text">Sentiment is</span>
          <div class="inline-select"><select data-f="conditions.sentiment">
            ${['any', 'negative', 'positive', 'neutral'].map(v => `<option value="${v}" ${d.conditions.sentiment === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select></div>
        </div>
        <div class="field-row">
          <span class="field-text">Platform is</span>
          <div class="inline-select"><select data-f="conditions.platform">
            ${['any', 'Twitter/X', 'Instagram', 'Facebook', 'Reddit', 'LinkedIn', 'News'].map(v => `<option value="${v}" ${d.conditions.platform === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select></div>
        </div>
        <div class="field-row">
          <span class="field-text">Author tier is</span>
          <div class="inline-select"><select data-f="conditions.authorTier">
            ${[['any', 'any'], ['low', 'low'], ['medium-or-higher', 'medium or higher'], ['high', 'high only']].map(([v, l]) => `<option value="${v}" ${d.conditions.authorTier === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select></div>
        </div>
        <div class="field-row">
          <span class="field-text">Keywords contain</span>
          <input class="field-input" style="max-width:240px;width:auto;flex:1;min-width:140px" data-f="conditions.keywords" value="${d.conditions.keywords || ''}" placeholder="optional, comma-separated" />
        </div>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Threshold</label>
      <div class="field-row">
        <span class="field-text">Trigger when more than</span>
        <input class="field-input inline-input" data-f="threshold.count" type="number" min="1" value="${d.threshold.count}" />
        <span style="display:inline-flex;align-items:center;gap:7px;flex-shrink:0">
          <span class="field-text">mentions in</span>
          <input class="field-input inline-input" data-f="threshold.window" type="number" min="1" value="${d.threshold.window}" style="width:48px" />
          <div class="inline-select"><select data-f="threshold.unit">
            ${['minutes', 'hour', 'hours', 'day', 'days'].map(v => `<option value="${v}" ${d.threshold.unit === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select></div>
        </span>
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
      <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-2)">
        <span>${(TOPIC(d.topicId)?.watchers || []).length} topic watcher${(TOPIC(d.topicId)?.watchers || []).length === 1 ? '' : 's'} notified by default</span>
        <button class="btn btn-ghost btn-sm" style="font-size:11.5px">Override ${svg('chevronRight', 10)}</button>
      </div>
    </div>
    <div class="summary-box" id="rule-summary-box">
      <div class="summary-label">Rule summary</div>
      <div class="summary-text" id="rule-summary-text">${ruleSummary(d)}</div>
    </div>`;
    }

    function ruleSummary(d) {
      const cs = [];
      if (d.conditions.sentiment !== 'any') cs.push(`<em>${d.conditions.sentiment}</em>`);
      cs.push('mentions');
      if (d.conditions.platform !== 'any') cs.push(`on <em>${d.conditions.platform}</em>`);
      if (d.conditions.authorTier !== 'any') cs.push(`from <em>${d.conditions.authorTier.replace(/-/g, ' ')}</em> authors`);
      if (d.conditions.keywords) cs.push(`mentioning <em>${d.conditions.keywords}</em>`);
      const t = TOPIC(d.topicId)?.name || 'this topic';
      return `Fire when ${cs.join(' ')} on <em>${t}</em> exceed <em>${d.threshold.count} per ${d.threshold.window} ${d.threshold.unit}</em>. Severity: <em>${d.severity}</em>.`;
    }

    function ruleForecastHTML(compact = false) {
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
      <div class="fc-meta">~${perDay} / day<br/>Updated ${compact ? 'just now' : 'live as you edit'}</div>
    </div>
    ${tooLoose ? `
      <div class="warn-strip">
        <span class="warn-strip-icon">${svg('alertTri', 14)}</span>
        <div><strong>High fire rate.</strong> This configuration would fire ~${Math.round(perDay)} times per day. Consider raising the threshold or narrowing the filter.</div>
      </div>`: ''}
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

    function bindRuleEditor(scope, isPanel, onClose) {
      const update = (path, val) => {
        const parts = path.split('.');
        let obj = state.ruleEditor.draft;
        for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
        obj[parts[parts.length - 1]] = val;
        refreshSummaryAndForecast(scope);
      };
      scope.querySelectorAll('[data-f]').forEach(inp => {
        if (inp.tagName === 'SELECT') inp.onchange = () => update(inp.dataset.f, inp.value);
        else inp.oninput = () => {
          const v = inp.type === 'number' ? +inp.value : inp.value;
          update(inp.dataset.f, v);
        };
      });
      scope.querySelectorAll('[data-sev-set]').forEach(p => {
        p.onclick = () => {
          state.ruleEditor.draft.severity = p.dataset.sevSet;
          // re-render this section
          if (isPanel) {
            scope.querySelector('.editor-panel-body > div').innerHTML = ruleFormFieldsHTML(true) + '<div class="editor-divider"></div>' + ruleForecastHTML(true);
            bindRuleEditor(scope, true, onClose);
          } else {
            scope.querySelector('.rule-form').innerHTML = ruleFormFieldsHTML();
            scope.querySelector('.rule-chart-side').innerHTML = ruleForecastHTML();
            bindRuleEditor(scope, false, onClose);
          }
        };
      });
      // Forecast bars
      scope.querySelectorAll('.fc-bar').forEach(bar => {
        bar.onclick = () => {
          scope.querySelectorAll('.fc-bar').forEach(b => b.classList.remove('active'));
          bar.classList.add('active');
          const box = scope.querySelector('#samples-box');
          box.style.display = 'block';
          box.querySelector('.samples-day').textContent = bar.dataset.day;
          box.querySelector('.samples-sub').textContent = `${bar.dataset.count} fire${bar.dataset.count === '1' ? '' : 's'}`;
          const draft = state.ruleEditor.draft;
          const samples = draft.conditions.sentiment === 'negative' ? MENTION_BANK.crisis : draft.conditions.platform === 'Instagram' ? MENTION_BANK.influencer : draft.conditions.keywords ? MENTION_BANK.campaign : MENTION_BANK.crisis;
          const n = Math.min(+bar.dataset.count || 1, 2);
          box.querySelector('.samples-content').innerHTML = samples.slice(0, Math.max(1, n)).map(m => mentionCard(m)).join('') || '<div style="font-size:12px;color:var(--text-3);padding:8px 0">No mentions matched on this day.</div>';
          // Show tooltip
          const existing = scope.querySelector('.fc-tip'); if (existing) existing.remove();
          const rect = bar.getBoundingClientRect(), parentRect = scope.querySelector('.fc-chart').getBoundingClientRect();
          const tip = el('div', { class: 'fc-tip' }, bar.dataset.count + (bar.dataset.count === '1' ? ' fire' : ' fires'));
          tip.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
          tip.style.top = (rect.top - parentRect.top) + 'px';
          scope.querySelector('.fc-chart').appendChild(tip);
        };
      });
      // Close panel button
      if (isPanel && onClose) {
        scope.querySelectorAll('[data-act="close-editor"]').forEach(b => b.onclick = onClose);
        scope.querySelectorAll('[data-act="save-editor"]').forEach(b => b.onclick = () => {
          saveRule();
          onClose();
        });
      }
    }

    let _forecastDebounce;
    function refreshSummaryAndForecast(scope) {
      const d = state.ruleEditor.draft;
      // Summary updates instantly
      const sb = scope.querySelector('#rule-summary-text');
      if (sb) { sb.innerHTML = ruleSummary(d); sb.parentElement.classList.add('flash'); setTimeout(() => sb.parentElement.classList.remove('flash'), 800); }
      // Forecast updates debounced — and we only swap the chart container, not the form
      clearTimeout(_forecastDebounce);
      _forecastDebounce = setTimeout(() => {
        const isPanel = scope.classList.contains('editor-panel');
        if (isPanel) {
          // In panel mode, the chart lives below the form inside .editor-panel-body > div
          const container = scope.querySelector('.editor-panel-body > div');
          // Find divider; everything after it is forecast
          const divider = container.querySelector('.editor-divider');
          if (divider) {
            // Remove all siblings after divider
            while (divider.nextSibling) container.removeChild(divider.nextSibling);
            const tmp = document.createElement('div');
            tmp.innerHTML = ruleForecastHTML(true);
            while (tmp.firstChild) container.appendChild(tmp.firstChild);
          }
        } else {
          const chartTarget = scope.querySelector('.rule-chart-side');
          chartTarget.innerHTML = ruleForecastHTML();
        }
        // Rebind only the bar click handlers
        bindForecastBars(scope);
      }, 200);
    }

    function bindForecastBars(scope) {
      scope.querySelectorAll('.fc-bar').forEach(bar => {
        bar.onclick = () => {
          scope.querySelectorAll('.fc-bar').forEach(b => b.classList.remove('active'));
          bar.classList.add('active');
          const box = scope.querySelector('#samples-box');
          if (!box) return;
          box.style.display = 'block';
          box.querySelector('.samples-day').textContent = bar.dataset.day;
          box.querySelector('.samples-sub').textContent = `${bar.dataset.count} fire${bar.dataset.count === '1' ? '' : 's'}`;
          const draft = state.ruleEditor.draft;
          const samples = draft.conditions.sentiment === 'negative' ? MENTION_BANK.crisis : draft.conditions.platform === 'Instagram' ? MENTION_BANK.influencer : draft.conditions.keywords ? MENTION_BANK.campaign : MENTION_BANK.crisis;
          const n = Math.min(+bar.dataset.count || 1, 2);
          box.querySelector('.samples-content').innerHTML = samples.slice(0, Math.max(1, n)).map(m => mentionCard(m)).join('') || '<div style="font-size:12px;color:var(--text-3);padding:8px 0">No mentions matched on this day.</div>';
          // Tooltip
          const existing = scope.querySelector('.fc-tip'); if (existing) existing.remove();
          const rect = bar.getBoundingClientRect(), parentRect = scope.querySelector('.fc-chart').getBoundingClientRect();
          const tip = document.createElement('div'); tip.className = 'fc-tip'; tip.textContent = bar.dataset.count + (bar.dataset.count === '1' ? ' fire' : ' fires');
          tip.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
          tip.style.top = (rect.top - parentRect.top) + 'px';
          scope.querySelector('.fc-chart').appendChild(tip);
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
      state.ruleEditor = null;
      navigate('rules');
    }

