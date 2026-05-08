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
        t.querySelector('.toast-action').onclick = () => {
          opts.onAction();
          removeToast(t);
        };
      }
      const timeout = opts.timeout || 5000;
      setTimeout(() => removeToast(t), timeout);
    }
    function removeToast(t) {
      if (!t.parentNode) return;
      t.classList.add('leaving');
      setTimeout(() => t.remove(), 220);
    }

