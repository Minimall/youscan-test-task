    /*═══════════════════════════════════════════════════════════════
      VIEW: Alerts inbox (+ detail pane when selected)
    ═══════════════════════════════════════════════════════════════*/
    function viewInbox() {
      const wrap = document.createDocumentFragment();
      // List pane
      const listPane = el('div', { class: 'list-pane' });

      // Filter the alerts
      const f = state.inboxFilter;
      let filtered = ALERTS_DATA.filter(a => a.status === f.status);
      if (f.severity) filtered = filtered.filter(a => a.severity === f.severity);
      if (f.topicId) filtered = filtered.filter(a => a.topicId === f.topicId);
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

      const counts = {
        new: ALERTS_DATA.filter(a => a.status === 'new').length,
        acknowledged: ALERTS_DATA.filter(a => a.status === 'acknowledged').length,
        dismissed: ALERTS_DATA.filter(a => a.status === 'dismissed').length,
      };

      const header = el('div', { class: 'list-header' });
      header.innerHTML = `
    <div class="list-title-row">
      <div class="list-title">Inbox</div>
      <span class="list-count">${ALERTS_DATA.filter(a => a.status === 'new').length} unread</span>
      <div style="flex:1"></div>
      <button class="btn btn-ghost btn-sm" id="refresh-btn" title="Refresh">${svg('refresh', 13)}</button>
    </div>
    <div class="tabs">
      <div class="tab ${f.status === 'new' ? 'active' : ''}" data-status="new">New <span class="tab-count">${counts.new}</span></div>
      <div class="tab ${f.status === 'acknowledged' ? 'active' : ''}" data-status="acknowledged">Acknowledged <span class="tab-count">${counts.acknowledged}</span></div>
      <div class="tab ${f.status === 'dismissed' ? 'active' : ''}" data-status="dismissed">Dismissed <span class="tab-count">${counts.dismissed}</span></div>
    </div>
    <div class="list-toolbar">
      <div class="list-search">
        ${svg('search', 12)}
        <input type="text" placeholder="Search alerts…" id="inbox-search" value="${f.search}" />
      </div>
      <div class="filter-row">
        ${['critical', 'important', 'info'].map(s => `
          <span class="filter-pill ${f.severity === s ? 'active' : ''}" data-sev="${s}">
            <span class="pill-dot" style="background:var(--${s})"></span>${s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        `).join('')}
        ${f.topicId ? `<span class="filter-pill active" data-topic-clear>${TOPIC(f.topicId)?.name} <span class="pill-x">×</span></span>` : ''}
      </div>
    </div>`;
      listPane.appendChild(header);

      const body = el('div', { class: 'list-body' });
      if (filtered.length === 0) {
        body.innerHTML = `<div class="empty"><div class="empty-icon">${svg('inbox', 22)}</div>
      <div class="empty-title">${f.status === 'new' ? 'No new alerts' : f.status === 'acknowledged' ? 'Nothing acknowledged' : 'Nothing dismissed'}</div>
      <div class="empty-body">${f.status === 'new' ? 'Your rules are running. New alerts will appear here.' : 'Items in this tab will show as you triage.'}</div>
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
        header.querySelectorAll('.tab').forEach(t => t.onclick = () => { state.inboxFilter.status = t.dataset.status; renderView(); });
        header.querySelectorAll('[data-sev]').forEach(p => p.onclick = () => {
          state.inboxFilter.severity = state.inboxFilter.severity === p.dataset.sev ? null : p.dataset.sev;
          renderView();
        });
        const tc = header.querySelector('[data-topic-clear]'); if (tc) tc.onclick = () => { state.inboxFilter.topicId = null; renderView(); };
        const search = header.querySelector('#inbox-search');
        let timer; search.oninput = () => { clearTimeout(timer); timer = setTimeout(() => { state.inboxFilter.search = search.value; renderView(); search?.focus(); }, 180); };
        header.querySelector('#refresh-btn').onclick = () => {
          const btn = header.querySelector('#refresh-btn');
          btn.innerHTML = `<div class="spinner"></div>`;
          setTimeout(() => { btn.innerHTML = svg('refresh', 13); toast('Inbox up to date'); }, 600);
        };
      }, 0);

      const container = el('div', { style: 'flex:1;display:flex;overflow:hidden;width:100%' });
      container.appendChild(listPane);

      // Detail pane if alert selected
      if (state.selectedAlertId) {
        const a = ALERTS_DATA.find(x => x.id === state.selectedAlertId);
        if (a) container.appendChild(detailPane(a));
      }

      wrap.appendChild(container);
      return container;
    }

    function alertRow(a) {
      const r = RULE(a.ruleId), t = TOPIC(a.topicId);
      const isSel = a.id === state.selectedAlertId;
      const row = el('div', { class: `alert-row ${isSel ? 'selected' : ''} ${a.read ? 'read' : ''}`, 'data-id': a.id });
      row.innerHTML = `
    <div class="alert-bar bar-${a.severity}"></div>
    <div class="unread-indicator"></div>
    <div class="alert-main">
      <div class="alert-title-row">
        <span class="alert-title">${r?.name || 'Unknown rule'}</span>
        <span class="alert-time">${timeAgo(a.firedAt)}</span>
      </div>
      <div class="alert-meta">
        <span class="sev ${a.severity}"><span class="sev-dot"></span>${a.severity}</span>
        <span class="dot-sep">•</span>
        <span>${t?.name || '—'}</span>
        <span class="dot-sep">•</span>
        <span class="meta-summary">${a.matchCount} mentions matched</span>
      </div>
    </div>
    <div class="alert-actions">
      <button class="row-action" data-act="mute" title="Mute rule">${svg('mute', 14)}</button>
      <button class="row-action" data-act="dismiss" title="Dismiss">${svg('close', 14)}</button>
    </div>`;
      row.onclick = (e) => {
        if (e.target.closest('[data-act]')) return;
        state.selectedAlertId = a.id;
        a.read = true;
        state.route.name = 'alert-detail';
        renderAll();
      };
      row.querySelector('[data-act="mute"]').onclick = (e) => { e.stopPropagation(); muteAlert(a.id); };
      row.querySelector('[data-act="dismiss"]').onclick = (e) => { e.stopPropagation(); dismissAlert(a.id); };
      return row;
    }

    /*═══════════════════════════════════════════════════════════════
      DETAIL PANE
    ═══════════════════════════════════════════════════════════════*/
    function detailPane(a) {
      const r = RULE(a.ruleId), t = TOPIC(a.topicId);
      const mentions = MENTION_BANK[a.mentionsKey] || [];
      const pane = el('div', { class: 'detail-pane' });
      pane.innerHTML = `
    <div class="detail-header">
      <div class="detail-top">
        <div class="detail-meta">
          <span class="sev ${a.severity}"><span class="sev-dot"></span>${a.severity}</span>
          <span class="dot-sep">•</span>
          <span>Fired at ${clockTime(a.firedAt)} · ${timeAgo(a.firedAt)}</span>
        </div>
        <button class="icon-btn" id="close-detail" title="Close">${svg('close', 14)}</button>
      </div>
      <div class="detail-title">${r?.name || ''}</div>
      <div class="detail-sublink">
        <span>Rule: <a href="#" data-edit-rule>${r?.name}</a></span>
        <span class="dot-sep">•</span>
        <span>Topic: <a href="#" data-topic="${t?.id}">${t?.name}</a></span>
      </div>
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
        <div class="chips">${a.matched.map(m => {
        const [k, v] = m.split(':').map(s => s.trim());
        return `<span class="chip"><span class="chip-key">${k}:</span>${v || ''}</span>`;
      }).join('')}</div>
      </div>
      <div class="detail-section">
        <div class="section-label" style="display:flex;align-items:center;justify-content:space-between">
          <span>Sample mentions <span style="color:var(--text-3);font-weight:400">(${a.matchCount})</span></span>
          <a href="#" style="font-size:11px;text-transform:none;letter-spacing:0;font-weight:500">View all ${svg('ext', 10)}</a>
        </div>
        ${mentions.slice(0, a.severity === 'critical' ? 3 : 2).map(m => mentionCard(m)).join('')}
      </div>
      <div class="detail-section">
        <div class="section-label">Recipients</div>
        <div style="font-size:12px;color:var(--text-2)">${(t?.watchers || []).slice(0, 3).join(', ')}${(t?.watchers || []).length > 3 ? ` +${t.watchers.length - 3} more` : ''} · notified by in-product${a.severity === 'critical' ? ' + email' : ''}</div>
      </div>
    </div>
    <div class="detail-footer">
      <button class="btn btn-primary btn-sm" id="ack-btn" ${a.status === 'acknowledged' ? 'disabled' : ''}>${svg('check', 13)} ${a.status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}</button>
      <button class="btn btn-secondary btn-sm" id="mute-btn">${svg('mute', 13)} Mute</button>
      <button class="btn btn-ghost btn-sm" id="dismiss-btn">Dismiss</button>
      <div style="flex:1"></div>
      <button class="btn btn-secondary btn-sm" id="edit-rule-btn">${svg('edit', 13)} Edit rule</button>
    </div>`;

      setTimeout(() => {
        pane.querySelector('#close-detail').onclick = () => {
          state.selectedAlertId = null;
          state.route.name = 'inbox';
          renderAll();
        };
        pane.querySelector('#ack-btn').onclick = () => {
          a.status = 'acknowledged'; a.read = true;
          toast('Alert acknowledged');
          renderAll();
        };
        pane.querySelector('#mute-btn').onclick = () => muteAlert(a.id);
        pane.querySelector('#dismiss-btn').onclick = () => dismissAlert(a.id);
        const editBtn = pane.querySelector('#edit-rule-btn');
        const editLink = pane.querySelector('[data-edit-rule]');
        [editBtn, editLink].forEach(b => { if (b) b.onclick = (e) => { e.preventDefault(); openEditFromAlert(a, pane); }; });
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
      return `
    <div class="mention-card">
      <div class="mention-head">
        <div class="mention-avatar" style="background:linear-gradient(135deg,${a.avatarColor},${a.avatarColor}cc)">${a.initials}</div>
        <div style="flex:1;min-width:0">
          <div class="mention-author">${a.name} <span style="color:var(--text-3);font-weight:400">${a.handle}</span></div>
          <div class="mention-platform">
            ${a.platform === 'Twitter/X' ? svg('twitter', 11) : a.platform === 'Instagram' ? svg('ig', 11) : a.platform === 'Facebook' ? svg('fb', 11) : svg('globe', 11)}
            ${a.platform} · ${a.role}${a.verified ? ` <span class="verified-badge" title="Verified">${svg('check', 10)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="mention-text">${text}</div>
      <div class="mention-foot">
        <span class="mention-stat">${(m.engagement.rt || 0).toLocaleString()} retweets</span>
        <span class="dot-sep">•</span>
        <span class="mention-stat">${(m.engagement.lk * 1000).toLocaleString().replace(/,000$/, 'k').replace(/(\d+)000$/, '$1k')} likes</span>
        <span class="dot-sep">•</span>
        <span class="mention-stat">${m.engagement.rep} replies</span>
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
        a.status = 'dismissed';
        a._wasMuted = true;
        if (state.selectedAlertId === id) { state.selectedAlertId = null; state.route.name = 'inbox'; }
        renderAll();
        toast(`Rule "${r?.name}" muted for this alert`, {
          action: 'Undo', timeout: 8000,
          onAction: () => { a.status = 'new'; delete a._wasMuted; renderAll(); }
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

