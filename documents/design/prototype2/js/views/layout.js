    /*═══════════════════════════════════════════════════════════════
      RENDER — sidebar / topbar
    ═══════════════════════════════════════════════════════════════*/
    function renderSidebar() {
      const newCount = ALERTS_DATA.filter(a => a.status === 'new').length;
      const nav = [
        {
          section: 'Workspace', items: [
            { icon: 'topic', label: 'Topics', count: TOPICS.length, route: 'topics' },
            { icon: 'analytics', label: 'Analytics', route: 'analytics' },
            { icon: 'reports', label: 'Reports', route: 'reports' },
            { icon: 'team', label: 'Team', route: 'team' },
          ]
        },
        {
          section: 'Alerts', items: [
            {
              icon: 'alerts', label: 'Alerts', count: newCount, route: 'alerts', children: [
                { label: 'Inbox', route: 'inbox', count: newCount },
                { label: 'Alert Rules', route: 'rules', count: RULES.length },
              ]
            },
          ]
        },
        { section: 'Topics', items: TOPICS.map(t => ({ icon: 'hash', label: t.name, route: `topic-${t.id}` })) },
      ];

      const html = nav.map(sec => `
    <div class="nav-section">
      <div class="nav-section-label"><span>${sec.section}</span><button class="add-btn" title="Add">${svg('plus', 12)}</button></div>
      ${sec.items.map(it => {
        const isAlertsParent = it.route === 'alerts';
        const expanded = isAlertsParent;
        const activeParent = (state.route.name === 'inbox' || state.route.name === 'rules' || state.route.name === 'rule-editor' || state.route.name === 'alert-detail') && it.route === 'alerts';
        return `
          <div class="nav-item ${activeParent ? 'active' : ''}" data-route="${it.route}">
            <span class="nav-icon">${svg(it.icon, 15)}</span>
            <span class="nav-item-label">${it.label}</span>
            ${it.count != null ? `<span class="nav-count">${it.count}</span>` : ''}
          </div>
          ${expanded && it.children ? `<div class="nav-children">
            ${it.children.map(c => `
              <div class="nav-child ${state.route.name === c.route || (c.route === 'inbox' && state.route.name === 'alert-detail') || (c.route === 'rules' && state.route.name === 'rule-editor') ? 'active' : ''}" data-route="${c.route}">
                <span>${c.label}</span>
                ${c.count != null ? `<span class="nav-count">${c.count}</span>` : ''}
              </div>
            `).join('')}
          </div>` : ''}
        `;
      }).join('')}
    </div>
  `).join('');
      $('#nav-scroll').innerHTML = html;
      $('#nav-scroll').querySelectorAll('[data-route]').forEach(el => {
        el.onclick = () => navigate(el.dataset.route);
      });
    }

    function renderTopbar() {
      const trail = [];
      const r = state.route.name;
      if (r === 'inbox') trail.push(['Alerts', 'alerts'], ['Inbox', 'inbox', true]);
      else if (r === 'rules') trail.push(['Alerts', 'alerts'], ['Alert Rules', 'rules', true]);
      else if (r === 'rule-editor') trail.push(['Alerts', 'alerts'], ['Alert Rules', 'rules'], [state.ruleEditor?.ruleId ? RULE(state.ruleEditor.ruleId)?.name : 'New rule', 'rule-editor', true]);
      else if (r === 'alert-detail') {
        const a = ALERTS_DATA.find(x => x.id === state.selectedAlertId);
        trail.push(['Alerts', 'alerts'], ['Inbox', 'inbox'], [a ? RULE(a.ruleId)?.name : 'Alert', 'alert-detail', true]);
      } else if (r === 'topics') trail.push(['Topics', 'topics', true]);
      else if (r === 'analytics') trail.push(['Analytics', 'analytics', true]);
      else if (r === 'reports') trail.push(['Reports', 'reports', true]);
      else if (r === 'team') trail.push(['Team', 'team', true]);
      else if (r.startsWith('topic-')) {
        const t = TOPIC(r.slice(6));
        trail.push(['Topics', 'topics'], [t?.name || 'Topic', r, true]);
      }

      const html = trail.map((c, i) => `
    ${i > 0 ? `<span class="crumb-sep">${svg('chevronRight', 11)}</span>` : ''}
    <span class="crumb ${c[2] ? 'current' : ''}" data-route="${c[1]}">${c[0]}</span>
  `).join('');
      $('#crumbs').innerHTML = html;
      $('#crumbs').querySelectorAll('[data-route]').forEach(el => {
        if (!el.classList.contains('current')) el.onclick = () => navigate(el.dataset.route);
      });

      // bell badge
      const unread = ALERTS_DATA.filter(a => !a.read).length;
      const hasCritical = ALERTS_DATA.some(a => a.severity === 'critical' && a.status === 'new' && !a.read);
      const badge = $('#bell-badge'); const icon = $('#topbar .bell-icon');
      if (unread > 0) {
        badge.style.display = 'flex';
        badge.textContent = hasCritical ? '!' : (unread > 9 ? '9+' : unread);
        badge.classList.toggle('critical', hasCritical);
        icon.classList.toggle('critical', hasCritical);
      } else {
        badge.style.display = 'none';
        icon.classList.remove('critical');
      }
    }

    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const el = (tag, attrs = {}, ...children) => {
      const e = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => { if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k.toLowerCase()] = v; else e.setAttribute(k, v); });
      children.flat().forEach(c => { if (c == null) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
      return e;
    };

    function navigate(route, params = {}) {
      if (route === 'rule-editor-new') {
        state.ruleEditor = { ruleId: null, draft: blankRuleDraft(), mode: 'page', step: 'preset' };
        state.route = { name: 'rule-editor', params };
      } else if (route.startsWith('rule-editor-')) {
        const rid = route.replace('rule-editor-', '');
        state.ruleEditor = { ruleId: rid, draft: ruleToDraft(RULE(rid)), mode: 'page', step: 'form' };
        state.route = { name: 'rule-editor', params: { ruleId: rid } };
      } else if (route.startsWith('topic-') || ['topics', 'analytics', 'reports', 'team', 'rules', 'inbox', 'alerts'].includes(route)) {
        const r = (route === 'alerts') ? 'inbox' : route;
        state.route = { name: r, params };
        state.selectedAlertId = null;
      }
      renderAll();
    }

    function renderAll() {
      renderSidebar();
      renderTopbar();
      renderView();
      renderNotif();
      renderDebug();
    }

    /*═══════════════════════════════════════════════════════════════
      VIEW RENDERER (route → view fn)
    ═══════════════════════════════════════════════════════════════*/
    function renderView() {
      const v = $('#view'); v.innerHTML = '';
      const r = state.route.name;
      if (r === 'inbox' || r === 'alert-detail') v.appendChild(viewInbox());
      else if (r === 'rules') v.appendChild(viewRules());
      else if (r === 'rule-editor') v.appendChild(viewRuleEditor());
      else if (r === 'topics' || r.startsWith('topic-')) v.appendChild(viewPlaceholder('Topics', 'Mention streams, filters, and saved searches live here.'));
      else if (r === 'analytics') v.appendChild(viewPlaceholder('Analytics', 'Topic-level dashboards and trend reports.'));
      else if (r === 'reports') v.appendChild(viewPlaceholder('Reports', 'Scheduled and ad-hoc reports.'));
      else if (r === 'team') v.appendChild(viewPlaceholder('Team', 'Workspace members and roles.'));
    }

    function viewPlaceholder(title, body) {
      const wrap = el('div', { class: 'list-pane', style: 'flex:1' });
      wrap.innerHTML = `
    <div class="list-header"><div class="list-title-row"><div class="list-title">${title}</div></div></div>
    <div class="empty" style="margin:auto">
      <div class="empty-icon">${svg('layers', 22)}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-body">${body} This area is intentionally minimal — the prototype focuses on the Alerts experience.</div>
      <button class="btn btn-secondary btn-sm" onclick="navigate('inbox')">${svg('arrowRight', 13)} Go to Alerts</button>
    </div>`;
      return wrap;
    }

