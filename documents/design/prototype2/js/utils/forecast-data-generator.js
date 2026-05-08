    /*═══════════════════════════════════════════════════════════════
      FORECAST DATA GENERATOR
    ═══════════════════════════════════════════════════════════════*/
    function generateForecast(rule) {
      // 30 days of historical fire counts simulated from rule conditions
      const seed = rule.id?.charCodeAt?.(1) || rule.name?.charCodeAt?.(0) || 7;
      const baseRate = (rule.threshold && rule.threshold.count <= 2) ? 4 : (rule.threshold?.count <= 5 ? 1.4 : 0.4);
      const arr = [];
      for (let i = 0; i < 30; i++) {
        const noise = Math.sin((i + seed) * 0.7) * 1.4 + Math.cos((i + seed) * 0.3) * 1.1;
        let v = Math.max(0, Math.round(baseRate + noise + (i === 26 || i === 22 ? 2 : 0) + (Math.random() * 0.6 - 0.3)));
        if (rule._tooLoose) v = 30 + Math.round(Math.sin(i * .4) * 8 + Math.random() * 10);
        arr.push(v);
      }
      return arr;
    }
    function forecastTotal(arr) { return arr.reduce((a, b) => a + b, 0); }
    function forecastPerDay(arr) { return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1); }

