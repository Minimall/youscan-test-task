    /*═══════════════════════════════════════════════════════════════
      NOTIFICATION CENTER (Alerts sidebar)
    ═══════════════════════════════════════════════════════════════*/
    function renderNotif() {
      const root = $('#notif-center');
      const f = state.notifFilter;
      const items = ALERTS_DATA.filter(a => f === 'all' || (f === 'alerts' && true) || (f === 'unread' && !a.read));
      const sorted = [...items].sort((a, b) => b.firedAt - a.firedAt);
      const groups = {};
      sorted.forEach(a => {
        const d = dayLabel(a.firedAt);
        (groups[d] = groups[d] || []).push(a);
      });

      const notifRows = Object.entries(groups).map(([day, list]) => {
        const rowsHTML = list.map(a => {
          const r = RULE(a.ruleId), t = TOPIC(a.topicId);
          const p = r?.conditions?.platform;
          const platIcon = p === 'Twitter/X' ? svg('twitter', 11) : p === 'Instagram' ? svg('ig', 11) : p === 'Facebook' ? svg('fb', 11) : svg('globe', 11);
          return `
            <div class="notif-row ${a.read ? 'read' : 'unread'}" data-id="${a.id}">
              <div class="notif-row-bar bar-${a.severity}"></div>
              <div class="notif-row-body">
                <div class="notif-row-top">
                  <span class="sev ${a.severity}" style="font-size:9.5px;padding:1px 6px"><span class="sev-dot"></span>${a.severity}</span>
                  <span class="notif-row-name">${r?.name || ''}</span>
                  <span class="notif-row-time">${timeAgo(a.firedAt)}</span>
                  <div class="notif-row-actions">
                    <button class="nc-action-btn" data-act="ack" title="Acknowledge" data-tip="Acknowledge">${svg('check', 12)}</button>
                    <button class="nc-action-btn" data-act="open" title="Open alert" data-tip="Open alert">${svg('ext', 12)}</button>
                    <button class="nc-action-btn" data-act="dismiss" title="Dismiss" data-tip="Dismiss" data-tip-pos="right">${svg('close', 12)}</button>
                  </div>
                </div>
                <div class="notif-row-summary">${platIcon} <span>${a.matchCount} mentions · ${t?.name}</span></div>
              </div>
            </div>`;
        }).join('');
        return `<div class="notif-day-label">${day}</div>${rowsHTML}`;
      }).join('');

      root.innerHTML = `
    <div class="notif-head">
      <div class="notif-title">Alerts inbox</div>
      <button class="btn btn-ghost btn-sm" id="mark-all-read">Mark all read</button>
      <button class="icon-btn" id="close-notif" title="Close" data-tip="Close" data-tip-pos="right">${svg('close', 14)}</button>
    </div>
    <div class="notif-tabs">
      ${[['all', 'All', ALERTS_DATA.length], ['unread', 'Unread', ALERTS_DATA.filter(a => !a.read).length]].map(([k, l, c]) => `
        <div class="notif-tab ${f === k ? 'active' : ''}" data-f="${k}">${l} <span class="tab-count">${c}</span></div>
      `).join('')}
    </div>
    <div class="notif-body">
      ${Object.keys(groups).length === 0 ? `
        <div class="empty"><div class="empty-icon">${svg('inbox', 22)}</div>
          <div class="empty-title">All caught up</div>
          <div class="empty-body">No alerts to show.</div>
        </div>` : notifRows}
    </div>
    <div class="notif-foot"><a href="#" id="open-inbox-link">View full Alerts inbox ${svg('arrowRight', 11)}</a></div>`;

      root.classList.toggle('open', state.notifOpen);
      $('#backdrop').classList.toggle('show', state.notifOpen || state.cmdkOpen);

      // events
      setTimeout(() => {
        root.querySelector('#close-notif').onclick = closeNotif;
        root.querySelector('#mark-all-read').onclick = () => { ALERTS_DATA.forEach(a => a.read = true); renderAll(); toast('All marked as read'); };
        root.querySelectorAll('.notif-tab').forEach(t => t.onclick = () => { state.notifFilter = t.dataset.f; renderNotif(); });
        root.querySelectorAll('.notif-row').forEach(row => {
          const id = row.dataset.id;
          row.onclick = (e) => {
            if (e.target.closest('[data-act]')) return;
            ALERTS_DATA.find(a => a.id === id).read = true;
            state.selectedAlertId = id;
            state.route.name = 'alert-detail';
            closeNotif();
            renderAll();
          };
          row.querySelector('[data-act="ack"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const a = ALERTS_DATA.find(x => x.id === id);
            if (a) { a.status = 'acknowledged'; a.read = true; }
            renderAll(); renderNotif(); toast('Alert acknowledged');
          });
          row.querySelector('[data-act="open"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            ALERTS_DATA.find(a => a.id === id).read = true;
            state.selectedAlertId = id;
            state.route.name = 'alert-detail';
            closeNotif(); renderAll();
          });
          row.querySelector('[data-act="dismiss"]')?.addEventListener('click', (e) => { e.stopPropagation(); dismissAlert(id); renderNotif(); });
        });
        root.querySelector('#open-inbox-link').onclick = (e) => { e.preventDefault(); closeNotif(); navigate('inbox'); };
      }, 0);
    }
    function openNotif() { state.notifOpen = true; renderNotif(); }
    function closeNotif() { state.notifOpen = false; renderNotif(); }
