    /*═══════════════════════════════════════════════════════════════
      COMMAND PALETTE (Cmd+K)
    ═══════════════════════════════════════════════════════════════*/
    function renderCmdK() {
      const root = $('#cmdk');
      root.innerHTML = `
    <div class="cmdk-input-wrap">
      ${svg('search', 14)}
      <input class="cmdk-input" id="cmdk-input" placeholder="Search alerts, rules, topics, or run a command…" autofocus />
      <kbd style="font-family:inherit;font-size:10px;padding:1px 5px;background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text-3)">esc</kbd>
    </div>
    <div class="cmdk-list" id="cmdk-list"></div>`;
      root.classList.toggle('open', state.cmdkOpen);
      $('#backdrop').classList.toggle('show', state.notifOpen || state.cmdkOpen);
      if (state.cmdkOpen) {
        const input = root.querySelector('#cmdk-input');
        setTimeout(() => input.focus(), 30);
        input.oninput = () => renderCmdKList(input.value);
        renderCmdKList('');
      }
    }
    function renderCmdKList(q) {
      const list = $('#cmdk-list');
      const ql = q.toLowerCase().trim();
      const items = [];

      // Navigation commands
      const navs = [
        { icon: 'inbox', label: 'Go to Inbox', shortcut: 'G I', action: () => { closeCmdK(); navigate('inbox'); } },
        { icon: 'rules', label: 'Go to Alert Rules', shortcut: 'G R', action: () => { closeCmdK(); navigate('rules'); } },
        { icon: 'plus', label: 'New rule', shortcut: 'N', action: () => { closeCmdK(); navigate('rule-editor-new'); } },
        { icon: 'topic', label: 'Go to Topics', action: () => { closeCmdK(); navigate('topics'); } },
        { icon: 'analytics', label: 'Go to Analytics', action: () => { closeCmdK(); navigate('analytics'); } },
        { icon: 'moon', label: 'Toggle dark mode', shortcut: '⇧D', action: () => { closeCmdK(); toggleDark(); } },
      ].filter(i => !ql || i.label.toLowerCase().includes(ql));

      if (navs.length) {
        items.push(`<div class="cmdk-section">Commands</div>`);
        navs.forEach((n, i) => items.push(`
      <div class="cmdk-item" data-idx="${items.length - 1}">
        <span class="cmdk-item-icon">${svg(n.icon, 13)}</span>
        <span>${n.label}</span>
        ${n.shortcut ? `<span class="cmdk-item-shortcut">${n.shortcut}</span>` : ''}
      </div>`));
      }

      // Alerts
      const matchingAlerts = ALERTS_DATA.filter(a => {
        if (!ql) return false;
        return RULE(a.ruleId)?.name.toLowerCase().includes(ql) || TOPIC(a.topicId)?.name.toLowerCase().includes(ql);
      }).slice(0, 3);
      if (matchingAlerts.length) {
        items.push(`<div class="cmdk-section">Alerts</div>`);
        matchingAlerts.forEach(a => items.push(`
      <div class="cmdk-item" data-alert="${a.id}">
        <span class="cmdk-item-icon">${svg('alerts', 13)}</span>
        <span>${RULE(a.ruleId)?.name} <span style="color:var(--text-3)">· ${TOPIC(a.topicId)?.name}</span></span>
        <span class="cmdk-item-shortcut">${timeAgo(a.firedAt)}</span>
      </div>`));
      }

      // Rules
      const matchingRules = RULES.filter(r => !ql || r.name.toLowerCase().includes(ql)).slice(0, 4);
      if (matchingRules.length) {
        items.push(`<div class="cmdk-section">Rules</div>`);
        matchingRules.forEach(r => items.push(`
      <div class="cmdk-item" data-rule="${r.id}">
        <span class="cmdk-item-icon">${svg('rules', 13)}</span>
        <span>${r.name} <span style="color:var(--text-3)">· ${TOPIC(r.topicId)?.name}</span></span>
      </div>`));
      }

      // Topics
      const matchingTopics = TOPICS.filter(t => !ql || t.name.toLowerCase().includes(ql));
      if (matchingTopics.length && ql) {
        items.push(`<div class="cmdk-section">Topics</div>`);
        matchingTopics.forEach(t => items.push(`
      <div class="cmdk-item" data-topic="${t.id}">
        <span class="cmdk-item-icon">${svg('hash', 13)}</span>
        <span>${t.name}</span>
      </div>`));
      }

      if (items.length === 0) items.push(`<div style="padding:24px;text-align:center;color:var(--text-3);font-size:12px">No results</div>`);

      list.innerHTML = items.join('');
      // Bind
      let active = 0;
      const all = list.querySelectorAll('.cmdk-item');
      all.forEach((it, i) => {
        if (i === 0) it.classList.add('active');
        it.onmousemove = () => { all.forEach(x => x.classList.remove('active')); it.classList.add('active'); active = i; };
        it.onclick = () => {
          const ai = it.dataset.alert, ri = it.dataset.rule, ti = it.dataset.topic;
          if (ai) { ALERTS_DATA.find(a => a.id === ai).read = true; state.selectedAlertId = ai; state.route.name = 'alert-detail'; closeCmdK(); renderAll(); }
          else if (ri) { closeCmdK(); navigate(`rule-editor-${ri}`); }
          else if (ti) { closeCmdK(); navigate(`topic-${ti}`); }
          else { navs.find(n => n.label === it.querySelector('span:nth-child(2)')?.textContent.trim())?.action(); }
        };
      });
    }
    function openCmdK() { state.cmdkOpen = true; renderCmdK(); }
    function closeCmdK() { state.cmdkOpen = false; renderCmdK(); }

