    /*═══════════════════════════════════════════════════════════════
      TOAST
    ═══════════════════════════════════════════════════════════════*/
    function toast(text, opts = {}) {
      const t = el('div', { class: 'toast' });
      t.innerHTML = `
    <span class="toast-icon">${svg('check', 14)}</span>
    <span class="toast-text">${text}</span>
    ${opts.action ? `<span class="toast-action">${opts.action}</span>` : ''}
    <span class="toast-progress" style="animation-duration:${opts.timeout || 5000}ms"></span>`;
      $('#toast-stack').appendChild(t);
      if (opts.action && opts.onAction) {
        t.querySelector('.toast-action').onclick = () => { opts.onAction(); removeToast(t); };
      }
      const timeout = opts.timeout || 5000;
      setTimeout(() => removeToast(t), timeout);
    }

    function toastCritical(alertData) {
      const r = RULE(alertData.ruleId), t2 = TOPIC(alertData.topicId);
      const toast = el('div', { class: 'toast toast-critical' });
      toast.innerHTML = `
    <div class="toast-critical-head">
      <span class="toast-critical-sev">${svg('flame',11)} Critical</span>
      <span class="toast-critical-name">${r?.name || 'Alert'}</span>
    </div>
    <div class="toast-critical-body">${alertData.matchCount} negative mentions · ${t2?.name || ''} · just now</div>
    <div class="toast-critical-actions">
      <button class="toast-cta toast-cta-primary" id="tc-view">View alert</button>
      <button class="toast-cta toast-cta-ghost" id="tc-dismiss">Dismiss</button>
    </div>
    <span class="toast-progress" style="animation-duration:12000ms;background:#ef4444"></span>`;
      $('#toast-stack').appendChild(toast);
      toast.querySelector('#tc-view').onclick = () => {
        alertData.read = true;
        state.selectedAlertId = alertData.id;
        state.route.name = 'alert-detail';
        removeToast(toast); renderAll();
      };
      toast.querySelector('#tc-dismiss').onclick = () => removeToast(toast);
      setTimeout(() => removeToast(toast), 12000);
    }
    function removeToast(t) {
      if (!t.parentNode) return;
      t.classList.add('leaving');
      setTimeout(() => t.remove(), 220);
    }

