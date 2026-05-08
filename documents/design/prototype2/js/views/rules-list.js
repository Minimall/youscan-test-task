    /*═══════════════════════════════════════════════════════════════
      VIEW: Alert Rules list
    ═══════════════════════════════════════════════════════════════*/
    function viewRules() {
      const wrap = el('div', { class: 'list-pane', style: 'flex:1' });
      wrap.innerHTML = `
    <div class="list-header">
      <div class="list-title-row">
        <div class="list-title">Alert Rules</div>
        <span class="list-count">${RULES.length} rules</span>
        <div style="flex:1"></div>
        <button class="btn btn-primary btn-sm" id="new-rule-btn">${svg('plus', 13)} New rule</button>
      </div>
      <div class="filter-row">
        <span class="filter-pill active">All rules</span>
        <span class="filter-pill">My rules</span>
        <span class="filter-pill">High mute rate</span>
        <span class="filter-pill">Inactive</span>
      </div>
    </div>
    <div class="tbl-wrap">
      <table class="tbl" id="rules-tbl">
        <thead>
          <tr>
            <th style="width:30%">Rule</th>
            <th>Topic</th>
            <th class="num">Fired 7d</th>
            <th class="num">Fired 30d</th>
            <th class="num">Mute rate</th>
            <th>Last fired</th>
            <th class="row-actions-cell"></th>
          </tr>
        </thead>
        <tbody>
          ${RULES.map(r => {
        const t = TOPIC(r.topicId);
        const zero = r.fired30d === 0;
        const muteCls = r.muteRate >= 50 ? 'health-crit' : (r.muteRate >= 30 ? 'health-warn' : '');
        const fired7Cls = r.fired7d >= 4 ? 'health-crit' : r.fired7d >= 2 ? 'health-warn' : '';
        return `
              <tr class="${zero ? 'zero-fire' : ''}" data-rule="${r.id}">
                <td>
                  <div class="rule-cell">
                    <div class="rule-bar bar-${r.severity}"></div>
                    <div>
                      <div style="font-weight:500">${r.name}</div>
                      <div style="font-size:11px;color:var(--text-3);margin-top:1px">${r.threshold.count}+ mentions / ${r.threshold.window} ${r.threshold.unit}</div>
                    </div>
                  </div>
                </td>
                <td style="color:var(--text-2)">${t?.name || '—'}</td>
                <td class="num ${fired7Cls}">${r.fired7d}</td>
                <td class="num">${r.fired30d}</td>
                <td class="num ${muteCls}">${r.fired30d === 0 ? '—' : r.muteRate + '%'}</td>
                <td style="color:var(--text-2)">${timeAgo(r.lastFired)}</td>
                <td class="row-actions-cell">
                  <div class="actions">
                    <button class="row-action" data-act="view" title="View alerts">${svg('inbox', 13)}</button>
                    <button class="row-action" data-act="edit" title="Edit">${svg('edit', 13)}</button>
                    <button class="row-action" data-act="delete" title="Delete">${svg('trash2', 13)}</button>
                  </div>
                </td>
              </tr>`;
      }).join('')}
        </tbody>
      </table>
    </div>`;
      setTimeout(() => {
        wrap.querySelector('#new-rule-btn').onclick = () => navigate('rule-editor-new');
        wrap.querySelectorAll('tr[data-rule]').forEach(tr => {
          const rid = tr.dataset.rule;
          tr.onclick = (e) => {
            if (e.target.closest('[data-act]')) return;
            navigate(`rule-editor-${rid}`);
          };
          tr.querySelector('[data-act="view"]').onclick = (e) => {
            e.stopPropagation();
            state.inboxFilter.search = RULE(rid).name;
            navigate('inbox');
          };
          tr.querySelector('[data-act="edit"]').onclick = (e) => { e.stopPropagation(); navigate(`rule-editor-${rid}`); };
          tr.querySelector('[data-act="delete"]').onclick = (e) => {
            e.stopPropagation();
            const idx = RULES.findIndex(r => r.id === rid);
            const removed = RULES.splice(idx, 1)[0];
            toast(`Rule "${removed.name}" deleted`, { action: 'Undo', onAction: () => { RULES.splice(idx, 0, removed); renderAll(); } });
            renderAll();
          };
        });
      }, 0);
      return wrap;
    }

