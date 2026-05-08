    /*═══════════════════════════════════════════════════════════════
      STATE
    ═══════════════════════════════════════════════════════════════*/
    const state = {
      route: { name: 'inbox', params: {} },
      selectedAlertId: null,
      notifOpen: false,
      cmdkOpen: false,
      debugOpen: false,
      inboxFilter: { status: 'new', search: '', severity: null, topicId: null },
      notifFilter: 'all',
      ruleEditor: null,  // {ruleId|null, draft:{...}, mode:'page'|'panel'}
      toasts: [],
      // ephemera for forecast hover
      forecastHover: { day: null, count: 0 },
    };

