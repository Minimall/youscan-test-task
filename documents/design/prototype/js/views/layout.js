    /*═══════════════════════════════════════════════════════════════
      RENDER — sidebar / topbar
    ═══════════════════════════════════════════════════════════════*/
    function renderSidebar() {
      const r = state.route.name;
      const newCount = ALERTS_DATA.filter(a => a.status === 'new').length;
      const critCount = ALERTS_DATA.filter(a => a.severity === 'critical' && a.status === 'new').length;
      const isAlertsRoute = ['inbox','rules','rule-editor','alert-detail'].includes(r);
      const isMentions = !isAlertsRoute && (r === 'starred');
      const isExplore = !isAlertsRoute && (r === 'topics' || r === 'analytics');

      const badgePill = (count) => count > 0
        ? `<span class="nav-item-badge${critCount > 0 && count === newCount ? ' critical' : ''}">${count > 9 ? '9+' : count}</span>`
        : '';

      $('#nav-scroll').innerHTML = `
        <div class="nav-col-items" style="padding-bottom:4px">
          <div class="nav-col-item ${isExplore?'active':''} ${isAlertsRoute?'nav-col-item--muted':''}" ${isAlertsRoute?'':' data-route="topics"'}>
            ${svg('compass', 14)} Explore
          </div>
        </div>
        <div class="nav-subgroup">
          <div class="nav-subgroup-label">Mentions</div>
          <div class="nav-col-items">
            <div class="nav-col-item ${isMentions?'active':''} ${isAlertsRoute?'nav-col-item--muted':''}" ${isAlertsRoute?'':' data-route="inbox"'}>
              ${svg('inbox', 14)} All ${badgePill(newCount)}
            </div>
            <div class="nav-col-item ${r==='starred'?'active':''}" data-route="">
              ${svg('star', 14)} Starred
            </div>
            <div class="nav-col-item" data-route="">
              ${svg('ellipsis', 14)} More
              <span class="nav-chevron">${svg('chevronRight', 10)}</span>
            </div>
          </div>
        </div>
        <div class="nav-subgroup">
          <div class="nav-subgroup-label">Insights</div>
          <div class="nav-col-items">
            <div class="nav-col-item ${r==='analytics'?'active':''}" data-route="analytics">
              ${svg('analytics', 14)} General
            </div>
            <div class="nav-col-item" data-route="">
              ${svg('chat', 14)} Conversation
            </div>
            <div class="nav-col-item" data-route="">
              ${svg('image', 14)} Visual
            </div>
            <div class="nav-col-item" data-route="">
              ${svg('team', 14)} Audience
            </div>
          </div>
        </div>`;
      $('#nav-scroll').querySelectorAll('[data-route]').forEach(el => {
        if (el.dataset.route) el.onclick = () => navigate(el.dataset.route);
      });

      // Dock
      const dockEntries = [
        { icon: 'download', label: 'Exports', route: 'reports', active: r === 'reports' },
        { icon: 'alerts', label: 'Alerts', route: 'inbox', badge: newCount, active: isAlertsRoute },
        { icon: 'reports', label: 'Reports', route: 'reports', active: false },
        { icon: 'rules', label: 'Settings', route: '', active: false, isSettings: true },
      ];
      let dockHTML = '';
      dockEntries.forEach(d => {
        const badgeHTML = d.badge > 0
          ? `<span class="nav-item-badge${critCount > 0 ? ' critical' : ''}" style="margin-left:auto">${d.badge > 9 ? '9+' : d.badge}</span>`
          : '';
        dockHTML += `<div class="dock-btn ${d.active?'active':''}" data-route="${d.route}" title="${d.label}">
          ${svg(d.icon, 15)} <span>${d.label}</span>${badgeHTML}
        </div>`;
        if (d.isSettings && isAlertsRoute) {
          dockHTML += `<div class="dock-sub-item ${r==='rules'||r==='rule-editor'?'active':''}" data-route="rules">
            ${svg('zap', 13)} Alert Rules
          </div>`;
        }
      });
      $('#sidebar-dock').innerHTML = dockHTML;
      $('#sidebar-dock').querySelectorAll('[data-route]').forEach(el => {
        if (el.dataset.route) el.onclick = () => navigate(el.dataset.route);
      });
    }

    function renderTopbar() {
      const r = state.route.name;
      const isAlerts = ['inbox','rules','rule-editor','alert-detail'].includes(r);
      const isTopics = r==='topics'||r.startsWith('topic-');
      const isAnalytics = r==='analytics';

      // Left nav buttons
      const navBtns = [
        { label: 'Topics', active: isTopics, route: 'topics' },
        { label: 'Dashboards', active: isAnalytics, route: 'analytics' },
        { label: 'Search', active: false, route: '' },
        { label: 'Addons', active: false, route: '' },
      ];
      $('#topbar-left').innerHTML = navBtns.map(b =>
        `<div class="topbar-nav-btn ${b.active?'active':''}" ${b.route?`data-route="${b.route}"`:''}>${b.label}</div>`
      ).join('');
      $('#topbar-left').querySelectorAll('[data-route]').forEach(el => {
        if (el.dataset.route) el.onclick = () => navigate(el.dataset.route);
      });

      // Alerts inbox pill (dynamic)
      const alertNew = ALERTS_DATA.filter(a => a.status === 'new').length;
      const alertCrit = ALERTS_DATA.filter(a => a.severity === 'critical' && a.status === 'new').length;
      const alertsPill = $('#alerts-inbox-pill');
      if (alertsPill) {
        alertsPill.style.display = alertNew > 0 ? '' : 'none';
        alertsPill.textContent = alertNew > 9 ? '9+' : alertNew;
        alertsPill.classList.toggle('critical', alertCrit > 0);
      }

      // Notifications bell — static mock (2 product notifications)
      // notif-pill stays static as set in HTML

      // Active state for alerts inbox button
      const alertsBtn = $('#alerts-inbox-btn');
      if (alertsBtn) alertsBtn.classList.toggle('active', isAlerts);
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
        state.ruleEditor = { ruleId: null, draft: blankRuleDraft(), mode: 'sidebar', step: 'preset' };
        openRuleEditorSidebar();
        return;
      } else if (route.startsWith('rule-editor-')) {
        const rid = route.replace('rule-editor-', '');
        state.ruleEditor = { ruleId: rid, draft: ruleToDraft(RULE(rid)), mode: 'sidebar', step: 'form' };
        openRuleEditorSidebar();
        return;
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

