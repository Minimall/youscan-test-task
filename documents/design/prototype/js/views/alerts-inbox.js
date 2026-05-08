    /*═══════════════════════════════════════════════════════════════
      VIEW: Alerts inbox (+ detail pane when selected)
    ═══════════════════════════════════════════════════════════════*/
    function viewInbox() {
      const wrap = document.createDocumentFragment();
      // List pane
      const listPane = el('div', { class: 'list-pane' });

      // Filter the alerts
      const f = state.inboxFilter;
      let filtered = ALERTS_DATA.filter(a => f.status === 'muted' ? a.status === 'muted' : (a.status === f.status && a.status !== 'muted'));
      if (f.severity) filtered = filtered.filter(a => a.severity === f.severity);
      if (f.topicId) filtered = filtered.filter(a => a.topicId === f.topicId);
      if (f.unreadOnly) filtered = filtered.filter(a => !a.read);
      if (f.platform) filtered = filtered.filter(a => {
        const r = RULE(a.ruleId);
        return _rPlatforms(r).includes(f.platform);
      });
      if (f.tier) filtered = filtered.filter(a => {
        const r = RULE(a.ruleId);
        return _rTiers(r).includes(f.tier);
      });
      if (f.search.trim()) {
        const q = f.search.trim().toLowerCase();
        filtered = filtered.filter(a => {
          const r = RULE(a.ruleId), t = TOPIC(a.topicId);
          return (r?.name || '').toLowerCase().includes(q) || (t?.name || '').toLowerCase().includes(q);
        });
      }
      // Sort: severity desc, then time desc
      const sevRank = { critical: 3, important: 2, info: 1 };
      filtered.sort((a, b) => (sevRank[b.severity] - sevRank[a.severity]) || (b.firedAt - a.firedAt));
      state._filteredAlerts = filtered;

      const counts = {
        new: ALERTS_DATA.filter(a => a.status === 'new').length,
        acknowledged: ALERTS_DATA.filter(a => a.status === 'acknowledged').length,
        muted: ALERTS_DATA.filter(a => a.status === 'muted').length,
        dismissed: ALERTS_DATA.filter(a => a.status === 'dismissed').length,
      };

      const newUnread = ALERTS_DATA.filter(a => a.status === 'new' && !a.read).length;
      const sevLabels = { critical: 'Critical', important: 'Important', info: 'Info' };

      const header = el('div', { class: 'inbox-header' });
      header.innerHTML = `
    <div class="inbox-header-top">
      <span class="inbox-title">Inbox</span>
      <span class="inbox-unread-badge${newUnread === 0 ? ' zero' : ''}" id="inbox-unread-badge">${newUnread}</span>
      <div class="inbox-header-actions">
        ${f.status === 'new' && counts.new > 0 ? `<button class="inbox-mark-read" id="mark-all-read">Mark all read</button>` : ''}
        <button class="icon-btn" id="refresh-btn" title="Refresh" data-tip="Refresh">${svg('refresh', 13)}</button>
      </div>
    </div>
    <div class="inbox-seg-row">
      <div class="inbox-seg ${f.status === 'new' ? 'active' : ''}" data-status="new">
        New<span class="inbox-seg-count">${counts.new}</span>
      </div>
      <div class="inbox-seg ${f.status === 'acknowledged' ? 'active' : ''}" data-status="acknowledged">
        Acknowledged<span class="inbox-seg-count">${counts.acknowledged}</span>
      </div>
      <div class="inbox-seg ${f.status === 'muted' ? 'active' : ''}" data-status="muted">
        Muted<span class="inbox-seg-count">${counts.muted}</span>
      </div>
      <div class="inbox-seg ${f.status === 'dismissed' ? 'active' : ''}" data-status="dismissed">
        Dismissed<span class="inbox-seg-count">${counts.dismissed}</span>
      </div>
      <div class="inbox-seg-spacer"></div>
      <div class="inbox-search-wrap">
        <div class="inbox-search-field${f.search ? ' open' : ''}" id="inbox-search-field">
          <input type="text" placeholder="Search…" id="inbox-search" value="${f.search}" autocomplete="off" />
        </div>
        <button class="inbox-search-btn${f.search ? ' active' : ''}" id="inbox-search-toggle" title="Search" data-tip="Search" data-tip-pos="right">${svg('search', 13)}</button>
      </div>
    </div>
    <div class="inbox-filter-row">
      ${['critical', 'important', 'info'].map(s => `
        <span class="inbox-sev-chip sev-${s} ${f.severity === s ? 'active' : ''}" data-sev="${s}">
          <span class="inbox-sev-dot"></span>${sevLabels[s]}
        </span>
      `).join('')}
      <span class="inbox-filter-div"></span>
      <span class="inbox-sev-chip ${f.unreadOnly ? 'active' : ''}" onclick="state.inboxFilter.unreadOnly=!state.inboxFilter.unreadOnly;renderView()" style="gap:5px">
        ${svg('alerts', 10)} Unread
      </span>
      <span class="inbox-filter-div"></span>
      <span class="inbox-sev-chip ${f.platform === 'Twitter/X' ? 'active' : ''}" onclick="state.inboxFilter.platform=state.inboxFilter.platform==='Twitter/X'?null:'Twitter/X';renderView()" style="gap:5px">
        ${svg('twitter', 10)} X
      </span>
      <span class="inbox-sev-chip ${f.platform === 'Instagram' ? 'active' : ''}" onclick="state.inboxFilter.platform=state.inboxFilter.platform==='Instagram'?null:'Instagram';renderView()" style="gap:5px">
        ${svg('ig', 10)} Instagram
      </span>
      <span class="inbox-sev-chip ${f.platform === 'Facebook' ? 'active' : ''}" onclick="state.inboxFilter.platform=state.inboxFilter.platform==='Facebook'?null:'Facebook';renderView()" style="gap:5px">
        ${svg('fb', 10)} Facebook
      </span>
      <span class="inbox-filter-div"></span>
      <span class="inbox-sev-chip ${f.tier === 'high' ? 'active' : ''}" onclick="state.inboxFilter.tier=state.inboxFilter.tier==='high'?null:'high';renderView()" style="gap:5px">
        ${svg('team', 10)} High tier
      </span>
      ${f.topicId ? `<span class="inbox-topic-chip" data-topic-clear>${svg('close', 10)} ${TOPIC(f.topicId)?.name}</span>` : ''}
    </div>`;
      listPane.appendChild(header);

      const body = el('div', { class: state._noListAnim ? 'list-body no-anim' : 'list-body' });
      if (filtered.length === 0) {
        const emptyTitles = { new: 'No new alerts', acknowledged: 'Nothing acknowledged', muted: 'No muted alerts', dismissed: 'Nothing dismissed' };
        body.innerHTML = `<div class="empty"><div class="empty-icon">${svg('inbox', 22)}</div>
      <div class="empty-title">${emptyTitles[f.status] || 'Nothing here'}</div>
      <div class="empty-body">${f.status === 'new' ? 'Your rules are running. New alerts will appear here.' : f.status === 'muted' ? 'Alerts you mute will appear here.' : 'Items in this tab will show as you triage.'}</div>
      ${f.status === 'new' ? `<button class="btn btn-secondary btn-sm" onclick="navigate('rules')">View Alert Rules</button>` : ''}
    </div>`;
      } else {
        let lastDay = null;
        filtered.forEach(a => {
          const d = dayLabel(a.firedAt);
          if (d !== lastDay) { lastDay = d; body.appendChild(el('div', { class: 'list-section' }, d)); }
          body.appendChild(alertRow(a));
        });
      }
      listPane.appendChild(body);

      // Bind events
      setTimeout(() => {
        header.querySelectorAll('.inbox-seg[data-status]').forEach(t => t.onclick = () => { state.inboxFilter.status = t.dataset.status; renderView(); });
        header.querySelectorAll('[data-sev]').forEach(p => p.onclick = () => {
          state.inboxFilter.severity = state.inboxFilter.severity === p.dataset.sev ? null : p.dataset.sev;
          renderView();
        });
        const tc = header.querySelector('[data-topic-clear]'); if (tc) tc.onclick = () => { state.inboxFilter.topicId = null; renderView(); };
        const searchField = header.querySelector('#inbox-search-field');
        const searchToggle = header.querySelector('#inbox-search-toggle');
        const search = header.querySelector('#inbox-search');
        searchToggle.onclick = () => {
          const open = searchField.classList.toggle('open');
          searchToggle.classList.toggle('active', open);
          if (open) { setTimeout(() => search?.focus(), 150); }
          else { state.inboxFilter.search = ''; renderView(); }
        };
        let timer; search.oninput = () => { clearTimeout(timer); timer = setTimeout(() => { state.inboxFilter.search = search.value; renderView(); }, 180); };
        search.onkeydown = e => { if (e.key === 'Escape') { state.inboxFilter.search = ''; renderView(); } };
        header.querySelector('#refresh-btn').onclick = () => {
          const btn = header.querySelector('#refresh-btn');
          btn.innerHTML = `<div class="spinner"></div>`;
          setTimeout(() => { btn.innerHTML = svg('refresh', 13); toast('Inbox up to date'); }, 600);
        };
        const mar = header.querySelector('#mark-all-read');
        if (mar) mar.onclick = () => {
          ALERTS_DATA.filter(a => a.status === 'new').forEach(a => { a.read = true; });
          renderAll();
          toast('All alerts marked as read');
        };
      }, 0);

      const container = el('div', { style: 'flex:1;display:flex;overflow:hidden;width:100%' });
      container.appendChild(listPane);

      // Detail pane if alert selected
      if (state.selectedAlertId) {
        const a = ALERTS_DATA.find(x => x.id === state.selectedAlertId);
        if (a) container.appendChild(state._alertLoading ? detailPaneSkeleton() : detailPane(a));
      }

      wrap.appendChild(container);
      return container;
    }

    function _rPlatforms(r) {
      if (r?.conditions?.platforms?.length) return r.conditions.platforms;
      if (r?.conditions?.platform && r.conditions.platform !== 'any') return [r.conditions.platform];
      return [];
    }
    function _rTiers(r) {
      if (r?.conditions?.tiers?.length) return r.conditions.tiers;
      if (r?.conditions?.authorTier && r.conditions.authorTier !== 'any') {
        return r.conditions.authorTier === 'medium-or-higher' ? ['medium', 'high'] : [r.conditions.authorTier];
      }
      return [];
    }
    function _platIcon(p) {
      const k = p === 'Twitter/X' ? 'twitter' : p === 'Instagram' ? 'ig' : p === 'Facebook' ? 'fb' : p === 'Reddit' ? 'reddit' : p === 'LinkedIn' ? 'linkedin' : p === 'YouTube' ? 'youtube' : p === 'TikTok' ? 'tiktok' : 'globe';
      return svg(k, 11);
    }
    function _tierLabel(ts) {
      if (!ts.length) return '';
      const rank = { high: 3, medium: 2, low: 1 };
      const sorted = [...ts].sort((a, b) => rank[b] - rank[a]);
      if (sorted.length === 3) return 'All tiers';
      if (sorted.length === 2 && sorted.includes('high') && sorted.includes('medium')) return 'Med+ tier';
      return sorted[0][0].toUpperCase() + sorted[0].slice(1) + ' tier';
    }

    function alertRow(a) {
      const r = RULE(a.ruleId), t = TOPIC(a.topicId);
      const isSel = a.id === state.selectedAlertId;
      const row = el('div', { class: `alert-row ${isSel ? 'selected' : ''} ${a.read ? 'read' : ''}`, 'data-id': a.id });
      const timeStr = timeAgo(a.firedAt);
      const isMuted = a.status === 'muted';
      const isAcked = a.status === 'acknowledged';
      const platforms = _rPlatforms(r);
      const tiers = _rTiers(r);
      const tierLabel = _tierLabel(tiers);
      row.innerHTML = `
    <div class="alert-bar bar-${a.severity}"></div>
    <div class="alert-main">
      <div class="alert-title-row">
        <span class="alert-new-dot"></span>
        <span class="alert-title">${r?.name || 'Unknown rule'}</span>
        <span class="alert-time-badge">${timeStr.replace(' ago','').replace('Yesterday','Yest.')}</span>
      </div>
      <div class="alert-meta">
        <span class="sev ${a.severity}"><span class="sev-dot"></span>${a.severity}</span>
        <span class="dot-sep">•</span>
        <span>${t?.name || '—'}</span>
        ${platforms.length ? `<span class="dot-sep">•</span><span class="alert-meta-plats" style="display:inline-flex;align-items:center;gap:3px;color:var(--text-3)">${platforms.map(_platIcon).join('')}</span>` : ''}
        ${tierLabel ? `<span class="dot-sep">•</span><span class="alert-tier-chip">${tierLabel}</span>` : ''}
        <span class="dot-sep">•</span>
        <span class="meta-summary">${a.matchCount} mentions matched</span>
      </div>
    </div>
    <div class="alert-actions">
      ${!isAcked && !isMuted ? `<button class="row-action row-action-ack" data-act="ack" title="Acknowledge" data-tip="Acknowledge">${svg('check', 15)}</button>` : ''}
      ${isMuted ? `<button class="row-action row-action-unmute" data-act="unmute" title="Unmute" data-tip="Unmute">${svg('mute', 15)}</button>` : `<button class="row-action row-action-mute" data-act="mute" title="Mute rule" data-tip="Mute rule">${svg('mute', 15)}</button>`}
      <button class="row-action row-action-dismiss" data-act="dismiss" title="Dismiss" data-tip="Dismiss" data-tip-pos="right">${svg('close', 15)}</button>
    </div>`;
      row.onclick = (e) => {
        if (e.target.closest('[data-act]')) return;
        state.selectedAlertId = a.id;
        a.read = true;
        state.route.name = 'alert-detail';
        state._alertLoading = true;
        renderAll();
        setTimeout(() => { state._alertLoading = false; renderView(); }, 120);
      };
      row.querySelector('[data-act="ack"]')?.addEventListener('click', (e) => { e.stopPropagation(); a.status = 'acknowledged'; a.read = true; renderAll(); toast('Alert acknowledged'); });
      row.querySelector('[data-act="mute"]')?.addEventListener('click', (e) => { e.stopPropagation(); muteAlert(a.id); });
      row.querySelector('[data-act="unmute"]')?.addEventListener('click', (e) => { e.stopPropagation(); a.status = 'new'; renderAll(); toast('Alert unmuted'); });
      row.querySelector('[data-act="dismiss"]').onclick = (e) => { e.stopPropagation(); dismissAlert(a.id); };
      return row;
    }

    /*═══════════════════════════════════════════════════════════════
      DETAIL PANE
    ═══════════════════════════════════════════════════════════════*/
    function detailPaneSkeleton() {
      const pane = el('div', { class: 'detail-pane' });
      pane.innerHTML = `
    <div class="detail-header">
      <div class="detail-top">
        <div class="skel-row">
          <span class="skel" style="width:58px;height:18px;border-radius:9px"></span>
          <span class="skel" style="width:42px;height:18px;border-radius:9px;margin-left:6px"></span>
          <span class="skel" style="width:110px;height:13px;border-radius:4px;margin-left:10px"></span>
        </div>
        <span class="skel" style="width:28px;height:28px;border-radius:5px;flex-shrink:0"></span>
      </div>
      <div class="skel" style="width:68%;height:20px;margin-top:12px"></div>
      <div class="skel" style="width:42%;height:13px;margin-top:8px;border-radius:4px"></div>
    </div>
    <div class="detail-actions" style="gap:8px">
      <span class="skel" style="width:120px;height:30px;border-radius:5px"></span>
      <span class="skel" style="width:80px;height:30px;border-radius:5px"></span>
      <span class="skel" style="width:72px;height:30px;border-radius:5px"></span>
      <span style="flex:1"></span>
      <span class="skel" style="width:90px;height:30px;border-radius:5px"></span>
    </div>
    <div class="detail-body" style="gap:14px">
      <div class="detail-section"><span class="skel" style="height:58px;display:block;border-radius:8px"></span></div>
      <div class="detail-section"><span class="skel" style="height:14px;width:120px;display:block;margin-bottom:10px"></span><span class="skel" style="height:28px;width:85%;display:block"></span></div>
      <div class="detail-section">
        <span class="skel" style="height:14px;width:100px;display:block;margin-bottom:10px"></span>
        <span class="skel" style="height:88px;display:block;border-radius:8px;margin-bottom:8px"></span>
        <span class="skel" style="height:88px;display:block;border-radius:8px"></span>
      </div>
    </div>`;
      return pane;
    }

    function detailPane(a) {
      const r = RULE(a.ruleId), t = TOPIC(a.topicId);
      const mentions = MENTION_BANK[a.mentionsKey] || [];
      const pane = el('div', { class: 'detail-pane' });
      const watchers = t?.watchers || [];
      const avatarColors = ['#7c3aed','#0891b2','#15803d','#b45309','#dc2626','#db2777','#0369a1','#65a30d'];
      const recipientPills = watchers.map((name, i) => {
        const initials = name.split(' ').map(w => w[0]).join('').slice(0,2);
        const col = avatarColors[i % avatarColors.length];
        const showEmail = a.severity === 'critical' || i < 2;
        return `<span class="recipient-pill">
          <span class="rp-avatar" style="background:${col}">${initials}</span>
          <span style="font-weight:500">${name.split(' ')[0]}</span>
          <span class="rp-channels">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" title="In-product"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C9.64 5.36 8 7.93 8 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            ${showEmail?`<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" title="Email"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`:''}
          </span>
        </span>`;
      }).join('');

      const condTags = a.matched.map(m => {
        const [k, v] = m.split(':').map(s => s.trim());
        return `<span class="cond-tag"><span class="cond-tag-key">${k}:</span><span class="cond-tag-val">${v||''}</span></span>`;
      }).join('');

      const statusLabels = { new: 'Active', acknowledged: 'Acknowledged', muted: 'Muted', dismissed: 'Dismissed' };
      const statusIcons = { new: `<span class="status-chip-dot"></span>`, acknowledged: svg('check', 10), muted: svg('mute', 10), dismissed: svg('close', 10) };
      const isAck = a.status === 'acknowledged';
      const isMuted = a.status === 'muted';
      const isDismissed = a.status === 'dismissed';

      pane.innerHTML = `
    <div class="detail-header">
      <div class="detail-top">
        <div class="detail-meta">
          <span class="sev ${a.severity}"><span class="sev-dot"></span>${a.severity}</span>
          ${a.status !== 'new' ? `<span class="status-chip ${a.status}">${statusIcons[a.status] || ''} ${statusLabels[a.status] || a.status}</span>` : ''}
          <span class="dot-sep">•</span>
          <span style="color:var(--text-3)">Fired ${clockTime(a.firedAt)} · ${timeAgo(a.firedAt)}</span>
        </div>
        <button class="icon-btn" id="close-detail" title="Close" data-tip="Close" data-tip-pos="right">${svg('close', 14)}</button>
      </div>
      <div class="detail-title">${r?.name || ''}</div>
      <div class="detail-sublink">
        <span>Rule: <a href="#" data-edit-rule>${r?.name}</a></span>
        <span class="dot-sep">•</span>
        <span>Topic: <a href="#" data-topic="${t?.id}">${t?.name}</a></span>
      </div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-secondary btn-sm" id="ack-btn" style="${isAck ? 'color:var(--success);border-color:var(--success);background:var(--success-soft)' : ''}">${svg('check',13)} ${isAck ? 'Acknowledged' : 'Acknowledge'}</button>
      <button class="btn btn-secondary btn-sm${isMuted ? ' active' : ''}" id="mute-btn" style="${isMuted ? 'color:var(--accent);border-color:var(--accent-border)' : ''}">${svg('mute',13)} ${isMuted ? 'Unmute' : 'Mute'}</button>
      <button class="btn btn-ghost btn-sm" id="dismiss-btn">${isDismissed ? 'Restore' : 'Dismiss'}</button>
      <div style="flex:1"></div>
      <button class="btn btn-secondary btn-sm" id="edit-rule-btn">${svg('edit',13)} Edit rule</button>
    </div>
    <div class="detail-body">
      <div class="detail-section">
        <div class="condition-banner ${a.severity}">
          <span class="condition-banner-icon">${svg('alertTri', 16)}</span>
          <div>${conditionSentence(a, r)}</div>
        </div>
      </div>
      <div class="detail-section">
        <div class="section-label">Matched conditions</div>
        <div class="conditions-inline">${condTags}</div>
      </div>
      <div class="detail-section">
        <div class="section-label" style="display:flex;align-items:center;justify-content:space-between">
          <span>Sample mentions <span style="color:var(--text-3);font-weight:400">(${a.matchCount})</span></span>
          <a href="#" style="font-size:11px;text-transform:none;letter-spacing:0;font-weight:500">View all ${svg('ext',10)}</a>
        </div>
        ${mentions.slice(0, Math.min(mentions.length, 5)).map(m => mentionCard(m)).join('')}
        ${a.matchCount > 5 ? `<button class="btn btn-ghost btn-sm" style="width:100%;margin-top:6px;justify-content:center" onclick="toast('Loading more mentions…')">Load ${a.matchCount - Math.min(mentions.length, 5)} more <span style="transform:rotate(90deg);display:inline-flex">${svg('chevronRight', 11)}</span></button>` : ''}
      </div>
      <div class="detail-section">
        <div class="section-label" style="margin-bottom:8px">Recipients</div>
        <div class="recipient-pills">
          ${recipientPills}
        </div>
      </div>
    </div>
    <div class="detail-footer"></div>`;

      setTimeout(() => {
        pane.querySelector('#close-detail').onclick = () => {
          state.selectedAlertId = null;
          state.route.name = 'inbox';
          renderAll();
        };
        pane.querySelector('#ack-btn').onclick = () => {
          if (a.status === 'acknowledged') {
            a.status = 'new';
            toast('Alert moved back to inbox');
          } else {
            a.status = 'acknowledged'; a.read = true;
            toast('Alert acknowledged');
          }
          renderAll();
        };
        pane.querySelector('#mute-btn').onclick = () => {
          if (a.status === 'muted') {
            a.status = 'new';
            toast('Alert unmuted');
            renderAll();
          } else {
            muteAlert(a.id);
          }
        };
        pane.querySelector('#dismiss-btn').onclick = () => {
          if (a.status === 'dismissed') {
            a.status = 'new';
            toast('Alert restored to inbox');
            renderAll();
          } else {
            dismissAlert(a.id);
          }
        };
        const editBtn = pane.querySelector('#edit-rule-btn');
        const editLink = pane.querySelector('[data-edit-rule]');
        [editBtn, editLink].forEach(b => { if (b) b.onclick = (e) => { e.preventDefault(); openRuleEditorSidebar(a.ruleId); }; });
      }, 0);
      return pane;
    }

    function conditionSentence(a, r) {
      if (a.severity === 'critical') return `${a.matchCount} ${r.conditions.sentiment !== 'any' ? r.conditions.sentiment + ' ' : ''}mentions in ${r.threshold.window} ${r.threshold.unit} exceeded your threshold of ${r.threshold.count}`;
      if (a.severity === 'important') return `${a.matchCount} matched mention${a.matchCount > 1 ? 's' : ''} from ${r.conditions.authorTier === 'high' ? 'verified high-tier authors' : 'authors above your tier filter'}`;
      return `${a.matchCount} matched mentions in the last ${r.threshold.window} ${r.threshold.unit}`;
    }

    function mentionCard(m) {
      const a = AUTHOR_BY_HANDLE(m.author);
      const text = m.text.replace(/<m>/g, '<mark>').replace(/<\/m>/g, '</mark>');
      const platIcon = a.platform === 'Twitter/X' ? svg('twitter', 11) : a.platform === 'Instagram' ? svg('ig', 11) : a.platform === 'Facebook' ? svg('fb', 11) : svg('globe', 11);
      const fmtNum = n => n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'') + 'K' : String(n);
      const rt = m.engagement.rt || 0;
      const lk = Math.round((m.engagement.lk || 0) * 1000);
      const rep = m.engagement.rep || 0;
      const views = Math.round(lk * 6.8);
      const bkm = Math.round(lk * 0.05);
      const loc = a.role.includes('UA') || a.role.includes('Ukraine') ? 'Ukraine' : 'United States';
      return `
    <div class="mention-card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div class="mention-avatar" style="background:${a.avatarColor};flex-shrink:0">${a.initials}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;min-width:0">
            <span class="mention-author">${a.name}</span>
            <span style="font-size:11px;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.handle}</span>
          </div>
          <div class="mention-platform">
            ${platIcon}
            <span style="color:var(--text-3)">May 6</span>
            <span class="dot-sep">·</span>
            ${svg('globe',10)} <span style="color:var(--text-3)">${loc}</span>
          </div>
        </div>
      </div>
      <div class="mention-text" style="-webkit-line-clamp:3;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden">${text}</div>
      <div class="mention-foot" style="margin-top:7px">
        <span class="mention-stat">${svg('heart',11)} ${fmtNum(lk)}</span>
        <span class="mention-stat">${svg('retweet',11)} ${fmtNum(rt)}</span>
        <span class="mention-stat">${svg('reply',11)} ${fmtNum(rep)}</span>
        <span class="mention-stat">${svg('eye',11)} ${fmtNum(views)}</span>
        ${bkm>100?`<span class="mention-stat">${svg('bookmark',11)} ${fmtNum(bkm)}</span>`:''}
        <span style="margin-left:auto;font-size:10.5px;color:var(--text-3)">${svg('team',10)} ${fmtNum(a.followers)}</span>
      </div>
    </div>`;
    }

    /*═══════════════════════════════════════════════════════════════
      ALERT ACTIONS
    ═══════════════════════════════════════════════════════════════*/
    function muteAlert(id) {
      const a = ALERTS_DATA.find(x => x.id === id); if (!a) return;
      const r = RULE(a.ruleId);
      // animate row out
      const row = $$(`.alert-row[data-id="${id}"]`)[0];
      if (row) row.classList.add('removing');
      setTimeout(() => {
        a.status = 'muted';
        renderAll();
        toast(`Rule "${r?.name}" muted`, {
          action: 'Undo', timeout: 8000,
          onAction: () => { a.status = 'new'; renderAll(); }
        });
      }, 220);
    }
    function dismissAlert(id) {
      const a = ALERTS_DATA.find(x => x.id === id); if (!a) return;
      const row = $$(`.alert-row[data-id="${id}"]`)[0];
      if (row) row.classList.add('removing');
      const prevStatus = a.status;
      setTimeout(() => {
        a.status = 'dismissed';
        if (state.selectedAlertId === id) { state.selectedAlertId = null; state.route.name = 'inbox'; }
        renderAll();
        toast('Alert dismissed', { action: 'Undo', onAction: () => { a.status = prevStatus; renderAll(); } });
      }, 220);
    }

