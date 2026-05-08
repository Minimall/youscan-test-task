    /*═══════════════════════════════════════════════════════════════
      DARK MODE
    ═══════════════════════════════════════════════════════════════*/
    function toggleDark() {
      document.documentElement.classList.toggle('dark');
      renderDebug();
    }

    /*═══════════════════════════════════════════════════════════════
      EVENTS / INIT
    ═══════════════════════════════════════════════════════════════*/
    function init() {
      // Bell
      $('#bell-btn').onclick = () => state.notifOpen ? closeNotif() : openNotif();
      // Search pill
      $('#search-pill').onclick = openCmdK;
      // Backdrop
      $('#backdrop').onclick = () => {
        if (state.notifOpen) closeNotif();
        if (state.cmdkOpen) closeCmdK();
      };
      // Debug FAB
      $('#debug-fab').onclick = () => { state.debugOpen = true; renderDebug(); };

      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
          if (e.key === 'Escape' && (state.cmdkOpen || state.notifOpen)) {
            if (state.cmdkOpen) closeCmdK(); else closeNotif();
          }
          return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); state.cmdkOpen ? closeCmdK() : openCmdK(); return; }
        if (e.key === 'Escape') {
          if (state.cmdkOpen) closeCmdK();
          else if (state.notifOpen) closeNotif();
          else if (state.debugOpen) { state.debugOpen = false; renderDebug(); }
          else if (state.selectedAlertId) { state.selectedAlertId = null; state.route.name = 'inbox'; renderAll(); }
          return;
        }
        if (e.key === 'd' || e.key === 'D') {
          if (e.shiftKey) { toggleDark(); return; }
          state.debugOpen = !state.debugOpen; renderDebug(); return;
        }
        if (e.key === '/') { e.preventDefault(); openCmdK(); return; }
        if (e.key === 'g') {
          const next = (ev) => {
            if (ev.key === 'i') navigate('inbox');
            else if (ev.key === 'r') navigate('rules');
            else if (ev.key === 't') navigate('topics');
            document.removeEventListener('keydown', next);
          };
          document.addEventListener('keydown', next, { once: true });
          return;
        }
        if (e.key === 'n' && state.route.name === 'rules') { navigate('rule-editor-new'); return; }
      });

      renderAll();

      // Welcome toast on load
      setTimeout(() => toast('Welcome — press D for demo controls, ⌘K to search', { timeout: 6000 }), 500);
    }

    // Start
    init();
