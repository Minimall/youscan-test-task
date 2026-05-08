    /*═══════════════════════════════════════════════════════════════
      TIME UTILS
    ═══════════════════════════════════════════════════════════════*/
    function timeAgo(ms) {
      if (!ms) return 'Never';
      const d = NOW - new Date(ms).getTime();
      if (d < 60 * MIN) return Math.max(1, Math.floor(d / MIN)) + ' min ago';
      if (d < 24 * HOUR) return Math.floor(d / HOUR) + 'h ago';
      if (d < 2 * DAY) return 'Yesterday';
      if (d < 7 * DAY) return Math.floor(d / DAY) + 'd ago';
      const dt = new Date(ms);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    function clockTime(ms) {
      const d = new Date(ms); let h = d.getHours(); const m = d.getMinutes().toString().padStart(2, '0');
      const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
      return `${h}:${m} ${ap}`;
    }
    function dayLabel(ms) {
      const d = NOW - new Date(ms).getTime();
      if (d < 24 * HOUR) return 'Today';
      if (d < 2 * DAY) return 'Yesterday';
      if (d < 7 * DAY) return 'This week';
      return 'Earlier';
    }

