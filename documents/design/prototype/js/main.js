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
      // Bell — intentionally no-op (notifications button does nothing)
      // Alerts inbox icon opens the sidebar
      const alertsInboxBtn = $('#alerts-inbox-btn');
      if (alertsInboxBtn) alertsInboxBtn.onclick = () => state.notifOpen ? closeNotif() : openNotif();
      // Backdrop
      $('#backdrop').onclick = () => {
        if (state.notifOpen) closeNotif();
        if (state.cmdkOpen) closeCmdK();
        if (state.ruleEditor?.mode === 'sidebar') closeRuleEditorSidebar();
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
          else if (state.ruleEditor?.mode === 'sidebar') closeRuleEditorSidebar();
          else if (state.debugOpen) { state.debugOpen = false; renderDebug(); }
          else if (state.selectedAlertId) { state.selectedAlertId = null; state.route.name = 'inbox'; renderAll(); }
          return;
        }
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && state.selectedAlertId && (state.route.name === 'alert-detail' || state.route.name === 'inbox')) {
          e.preventDefault();
          const list = state._filteredAlerts || [];
          const idx = list.findIndex(x => x.id === state.selectedAlertId);
          const next = e.key === 'ArrowDown' ? list[idx + 1] : list[idx - 1];
          if (next) {
            next.read = true;
            state.selectedAlertId = next.id;
            state.route.name = 'alert-detail';
            // Suppress sidebar/topbar transitions — they don't need to animate on row-level navigation
            const sidebar = $('#sidebar'), topbar = $('#topbar');
            sidebar.classList.add('no-anim');
            topbar.classList.add('no-anim');
            state._alertLoading = true;
            state._noListAnim = true;
            renderView();
            requestAnimationFrame(() => requestAnimationFrame(() => {
              sidebar.classList.remove('no-anim');
              topbar.classList.remove('no-anim');
            }));
            setTimeout(() => {
              state._alertLoading = false;
              renderView();
              state._noListAnim = false;
            }, 120);
          }
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

