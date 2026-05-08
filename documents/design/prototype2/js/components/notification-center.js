    /*═══════════════════════════════════════════════════════════════
      NOTIFICATION CENTER
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

      root.innerHTML = `
    <div class="notif-head">
      <div class="notif-title">Notifications</div>
      <button class="btn btn-ghost btn-sm" id="mark-all-read">Mark all read</button>
      <button class="icon-btn" id="close-notif">${svg('close', 14)}</button>
    </div>
    <div class="notif-tabs">
      ${[['all', 'All', ALERTS_DATA.length], ['unread', 'Unread', ALERTS_DATA.filter(a => !a.read).length], ['alerts', 'Alerts', ALERTS_DATA.length]].map(([k, l, c]) => `
        <div class="notif-tab ${f === k ? 'active' : ''}" data-f="${k}">${l} <span class="tab-count">${c}</span></div>
      `).join('')}
    </div>
    <div class="notif-body">
      ${Object.keys(groups).length === 0 ? `
        <div class="empty"><div class="empty-icon">${svg('inbox', 22)}</div>
          <div class="empty-title">All caught up</div>
          <div class="empty-body">You have no unread notifications.</div>
        </div>` :
          Object.entries(groups).map(([day, list]) => `
          <div class="notif-day-label">${day}</div>
          ${list.map(a => {
            const r = RULE(a.ruleId), t = TOPIC(a.topicId);
            return `
            <div class="notif-row ${a.read ? 'read' : 'unread'}" data-id="${a.id}">
              <div class="notif-row-bar bar-${a.severity}"></div>
              <div class="notif-row-body">
                <div class="notif-row-top">
                  <span class="sev ${a.severity}" style="font-size:9.5px;padding:1px 6px"><span class="sev-dot"></span>${a.severity}</span>
                  <span class="notif-row-name">${r?.name || ''}</span>
                  <span class="notif-row-time">${timeAgo(a.firedAt)}</span>
                </div>
                <div class="notif-row-summary">${a.matchCount} mentions · ${t?.name}</div>
                <div class="notif-row-actions">
                  <button class="btn btn-ghost btn-sm" data-act="open">${svg('arrowRight', 12)} Open</button>
                  <button class="btn btn-ghost btn-sm" data-act="dismiss">Dismiss</button>
                  <button class="btn btn-ghost btn-sm" data-act="mute">Mute rule</button>
                </div>
              </div>
            </div>`;
          }).join('')}
        `).join('')}
    </div>
    <div class="notif-foot"><a href="#" id="open-inbox-link">View all in Alerts inbox ${svg('arrowRight', 11)}</a></div>`;

      root.classList.toggle('open', state.notifOpen);
      $('#backdrop').classList.toggle('show', state.notifOpen || state.cmdkOpen);

      // events
      setTimeout(() => {
        root.querySelector('#close-notif').onclick = closeNotif;
        root.querySelector('#mark-all-read').onclick = () => { ALERTS_DATA.forEach(a => a.read = true); renderAll(); toast('All notifications marked as read'); };
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
          row.querySelector('[data-act="open"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            ALERTS_DATA.find(a => a.id === id).read = true;
            state.selectedAlertId = id;
            state.route.name = 'alert-detail';
            closeNotif(); renderAll();
          });
          row.querySelector('[data-act="dismiss"]')?.addEventListener('click', (e) => { e.stopPropagation(); dismissAlert(id); renderNotif(); });
          row.querySelector('[data-act="mute"]')?.addEventListener('click', (e) => { e.stopPropagation(); muteAlert(id); renderNotif(); });
        });
        root.querySelector('#open-inbox-link').onclick = (e) => { e.preventDefault(); closeNotif(); navigate('inbox'); };
      }, 0);
    }
    function openNotif() { state.notifOpen = true; renderNotif(); }
    function closeNotif() { state.notifOpen = false; renderNotif(); }

