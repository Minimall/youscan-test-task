    /*═══════════════════════════════════════════════════════════════
      MOCK DATA
    ═══════════════════════════════════════════════════════════════*/
    const NOW = new Date('2026-05-05T21:30:00');
    const DAY = 24 * 60 * 60 * 1000, HOUR = 60 * 60 * 1000, MIN = 60 * 1000;

    const TOPICS = [
      { id: 't1', name: 'Nike Ukraine', icon: '#', watchers: ['Kateryna P.', 'Andrii M.', 'Olena S.', 'Dmytro V.'], color: '#f97316' },
      { id: 't2', name: 'Nike Global', icon: '#', watchers: ['Kateryna P.', 'Andrii M.', 'Sofia R.', 'Marta L.', 'Pavlo K.', 'Inna T.'], color: '#0ea5e9' },
      { id: 't3', name: 'Adidas comparison', icon: '#', watchers: ['Kateryna P.', 'Sofia R.'], color: '#84cc16' },
      { id: 't4', name: 'Holiday campaign', icon: '#', watchers: ['Kateryna P.', 'Marta L.', 'Andrii M.'], color: '#a855f7' },
    ];
    const TOPIC = id => TOPICS.find(t => t.id === id);

    const RULES = [
      {
        id: 'r1', name: 'Brand Reputation Crisis', topicId: 't1', severity: 'critical',
        conditions: { sentiment: 'negative', platform: 'Twitter/X', authorTier: 'medium-or-higher', keywords: '' },
        threshold: { count: 3, window: 1, unit: 'hour' }, recipients: 'topic-watchers',
        fired7d: 4, fired30d: 14, muteRate: 38, lastFired: NOW - 16 * MIN, createdBy: 'Kateryna P.', createdAt: NOW - 12 * DAY
      },
      {
        id: 'r2', name: 'Journalist mention spike', topicId: 't2', severity: 'important',
        conditions: { sentiment: 'any', platform: 'Twitter/X', authorTier: 'high', keywords: '' },
        threshold: { count: 2, window: 30, unit: 'minutes' }, recipients: 'topic-watchers',
        fired7d: 1, fired30d: 3, muteRate: 0, lastFired: NOW - 2 * HOUR - 28 * MIN, createdBy: 'Kateryna P.', createdAt: NOW - 18 * DAY
      },
      {
        id: 'r3', name: 'Negative sentiment drift', topicId: 't1', severity: 'info',
        conditions: { sentiment: 'negative', platform: 'any', authorTier: 'any', keywords: '' },
        threshold: { count: 10, window: 6, unit: 'hours' }, recipients: 'topic-watchers',
        fired7d: 2, fired30d: 7, muteRate: 14, lastFired: NOW - 1 * DAY - 6 * HOUR, createdBy: 'Andrii M.', createdAt: NOW - 22 * DAY
      },
      {
        id: 'r4', name: 'Influencer mention', topicId: 't2', severity: 'important',
        conditions: { sentiment: 'positive', platform: 'Instagram', authorTier: 'high', keywords: '' },
        threshold: { count: 1, window: 1, unit: 'hour' }, recipients: 'topic-watchers',
        fired7d: 3, fired30d: 9, muteRate: 11, lastFired: NOW - 3 * HOUR - 12 * MIN, createdBy: 'Marta L.', createdAt: NOW - 8 * DAY
      },
      {
        id: 'r5', name: 'Competitor share-of-voice spike', topicId: 't3', severity: 'info',
        conditions: { sentiment: 'any', platform: 'any', authorTier: 'any', keywords: 'Adidas' },
        threshold: { count: 25, window: 1, unit: 'day' }, recipients: 'topic-watchers',
        fired7d: 1, fired30d: 4, muteRate: 25, lastFired: NOW - 2 * DAY - 4 * HOUR, createdBy: 'Sofia R.', createdAt: NOW - 30 * DAY
      },
      {
        id: 'r6', name: 'Holiday campaign mentions', topicId: 't4', severity: 'info',
        conditions: { sentiment: 'any', platform: 'any', authorTier: 'any', keywords: '#NikeHoliday' },
        threshold: { count: 5, window: 1, unit: 'hour' }, recipients: 'topic-watchers',
        fired7d: 6, fired30d: 18, muteRate: 55, lastFired: NOW - 4 * HOUR, createdBy: 'Marta L.', createdAt: NOW - 5 * DAY
      },
      {
        id: 'r7', name: 'Crisis word watchlist', topicId: 't1', severity: 'critical',
        conditions: { sentiment: 'any', platform: 'any', authorTier: 'any', keywords: 'boycott, scandal, lawsuit' },
        threshold: { count: 2, window: 1, unit: 'hour' }, recipients: 'topic-watchers',
        fired7d: 0, fired30d: 1, muteRate: 0, lastFired: NOW - 8 * DAY, createdBy: 'Kateryna P.', createdAt: NOW - 14 * DAY
      },
      {
        id: 'r8', name: 'Weekly digest trigger', topicId: 't2', severity: 'info',
        conditions: { sentiment: 'any', platform: 'any', authorTier: 'any', keywords: '' },
        threshold: { count: 100, window: 7, unit: 'days' }, recipients: 'topic-watchers',
        fired7d: 0, fired30d: 0, muteRate: 0, lastFired: null, createdBy: 'Andrii M.', createdAt: NOW - 4 * DAY
      },
    ];
    const RULE = id => RULES.find(r => r.id === id);

    const AUTHORS = [
      { handle: '@user_journalist', name: 'Olha Voronova', avatarColor: '#dc2626', initials: 'OV', tier: 'high', verified: true, platform: 'Twitter/X', followers: 48200, role: 'Tech reporter, Forbes UA' },
      { handle: '@media_pro_ua', name: 'Andrii Kostenko', avatarColor: '#059669', initials: 'AK', tier: 'high', verified: true, platform: 'Twitter/X', followers: 23100, role: 'Senior editor, Liga.net' },
      { handle: '@news_kyiv', name: 'Kyiv Post', avatarColor: '#0ea5e9', initials: 'KP', tier: 'high', verified: true, platform: 'Twitter/X', followers: 142000, role: 'News outlet' },
      { handle: '@sportsdaily', name: 'Sports Daily UA', avatarColor: '#7c3aed', initials: 'SD', tier: 'high', verified: true, platform: 'Twitter/X', followers: 89400, role: 'Sports media' },
      { handle: '@m.kovalenko', name: 'Mariya Kovalenko', avatarColor: '#0891b2', initials: 'MK', tier: 'medium', verified: false, platform: 'Instagram', followers: 18400, role: 'Lifestyle blogger' },
      { handle: '@runner_dnipro', name: 'Pavlo Tkachenko', avatarColor: '#65a30d', initials: 'PT', tier: 'medium', verified: false, platform: 'Instagram', followers: 32800, role: 'Athlete · runner' },
      { handle: '@maks.yev', name: 'Maksym Yevtushenko', avatarColor: '#ea580c', initials: 'MY', tier: 'low', verified: false, platform: 'Twitter/X', followers: 1240, role: 'Football fan' },
      { handle: '@li.community', name: 'Lviv Community', avatarColor: '#9333ea', initials: 'LC', tier: 'medium', verified: false, platform: 'Facebook', followers: 5800, role: 'Community group' },
      { handle: '@ole_blog', name: 'Olena Maksymchuk', avatarColor: '#db2777', initials: 'OM', tier: 'medium', verified: false, platform: 'Twitter/X', followers: 9100, role: 'Marketing consultant' },
      { handle: '@daniel_brand', name: 'Daniel Brand-Watch', avatarColor: '#0d9488', initials: 'DB', tier: 'high', verified: true, platform: 'LinkedIn', followers: 21000, role: 'Brand strategist' },
    ];
    const AUTHOR_BY_HANDLE = h => AUTHORS.find(a => a.handle === h);

    const MENTION_BANK = {
      crisis: [
        { author: '@user_journalist', text: 'Disappointed with <m>Nike\'s</m> response to the supply chain controversy. This is exactly the kind of <m>negative</m> PR they don\'t need right now. #NikeControversy', engagement: { rt: 2147, lk: 8.4, rep: 312 } },
        { author: '@media_pro_ua', text: 'Multiple sources confirming <m>Nike Ukraine</m> delayed shipments again. The brand\'s silence is making things worse. Story developing.', engagement: { rt: 847, lk: 3.1, rep: 178 } },
        { author: '@news_kyiv', text: 'Third consecutive <m>negative</m> story on <m>Nike</m> this week. Something\'s brewing — full report linked.', engagement: { rt: 1205, lk: 4.8, rep: 240 } },
        { author: '@sportsdaily', text: '<m>Nike Ukraine</m> facing customer backlash over delayed orders. Several athletes voiced frustration publicly.', engagement: { rt: 512, lk: 2.2, rep: 89 } },
        { author: '@maks.yev', text: 'Yo @<m>Nike</m> where are the orders??? Two months waiting. <m>Negative</m> experience all the way.', engagement: { rt: 34, lk: .4, rep: 12 } },
      ],
      journalist: [
        { author: '@user_journalist', text: 'Just got off a call about <m>Nike\'s</m> Q2 plans. Big shifts coming for the EMEA region — full piece tomorrow.', engagement: { rt: 412, lk: 1.8, rep: 45 } },
        { author: '@media_pro_ua', text: '<m>Nike Global</m> announces new sustainability initiative. Verified internal memo seen by our team.', engagement: { rt: 298, lk: 1.2, rep: 38 } },
        { author: '@daniel_brand', text: 'Quick take on <m>Nike\'s</m> latest brand campaign — bold, but does the messaging land for non-US markets? Thread 🧵', engagement: { rt: 178, lk: .9, rep: 62 } },
      ],
      influencer: [
        { author: '@m.kovalenko', text: 'New <m>Nike</m> Air drop and I am OBSESSED. Quality just keeps getting better 🔥 #NikeUkraine', engagement: { rt: 0, lk: 14.2, rep: 840 } },
        { author: '@runner_dnipro', text: 'Best running shoes I\'ve owned. <m>Nike</m> Pegasus 41 feels like nothing else. Thanks @<m>Nike</m>!', engagement: { rt: 0, lk: 8.7, rep: 412 } },
      ],
      drift: [
        { author: '@ole_blog', text: 'Used to recommend <m>Nike</m> to all my clients. Lately seeing more complaints than positive feedback. <m>Negative</m> trend?', engagement: { rt: 42, lk: .3, rep: 28 } },
        { author: '@li.community', text: 'Fewer <m>Nike</m> sightings at recent Lviv events. Anyone else noticing the shift?', engagement: { rt: 18, lk: .2, rep: 11 } },
      ],
      campaign: [
        { author: '@m.kovalenko', text: 'Loving the <m>#NikeHoliday</m> drop! Worth every hryvnia. ❤️', engagement: { rt: 0, lk: 5.4, rep: 280 } },
        { author: '@runner_dnipro', text: 'Got my <m>#NikeHoliday</m> kit today. Quality = top tier as always.', engagement: { rt: 0, lk: 3.1, rep: 124 } },
        { author: '@ole_blog', text: '<m>#NikeHoliday</m> ad campaign is everywhere. Smart placement, strong creative.', engagement: { rt: 14, lk: .4, rep: 9 } },
      ],
    };

    let ALERTS_DATA = [
      {
        id: 'a1', ruleId: 'r1', topicId: 't1', severity: 'critical', firedAt: NOW - 16 * MIN, status: 'new',
        matched: ['Sentiment: negative', 'Platform: Twitter/X', 'Volume: >3 / hour', 'Author tier: medium+'],
        matchCount: 5, mentionsKey: 'crisis', read: false
      },
      {
        id: 'a2', ruleId: 'r2', topicId: 't2', severity: 'important', firedAt: NOW - 2 * HOUR - 28 * MIN, status: 'new',
        matched: ['Verified journalists: 3', 'Platform: Twitter/X', 'Window: 30 min'],
        matchCount: 3, mentionsKey: 'journalist', read: false
      },
      {
        id: 'a3', ruleId: 'r4', topicId: 't2', severity: 'important', firedAt: NOW - 3 * HOUR - 12 * MIN, status: 'new',
        matched: ['Author tier: high', 'Platform: Instagram', 'Sentiment: positive'],
        matchCount: 1, mentionsKey: 'influencer', read: false
      },
      {
        id: 'a4', ruleId: 'r6', topicId: 't4', severity: 'info', firedAt: NOW - 4 * HOUR, status: 'new',
        matched: ['Keyword: #NikeHoliday', 'Volume: >5 / hour'],
        matchCount: 8, mentionsKey: 'campaign', read: true
      },
      {
        id: 'a5', ruleId: 'r1', topicId: 't1', severity: 'critical', firedAt: NOW - 22 * HOUR, status: 'acknowledged',
        matched: ['Sentiment: negative', 'Platform: Twitter/X', 'Volume: >3 / hour'],
        matchCount: 7, mentionsKey: 'crisis', read: true
      },
      {
        id: 'a6', ruleId: 'r3', topicId: 't1', severity: 'info', firedAt: NOW - 1 * DAY - 6 * HOUR, status: 'new',
        matched: ['Sentiment shift: positive→negative', 'Volume: >10 / 6h'],
        matchCount: 12, mentionsKey: 'drift', read: true
      },
      {
        id: 'a7', ruleId: 'r6', topicId: 't4', severity: 'info', firedAt: NOW - 1 * DAY - 9 * HOUR, status: 'dismissed',
        matched: ['Keyword: #NikeHoliday', 'Volume: >5 / hour'],
        matchCount: 6, mentionsKey: 'campaign', read: true
      },
      {
        id: 'a8', ruleId: 'r5', topicId: 't3', severity: 'info', firedAt: NOW - 2 * DAY - 4 * HOUR, status: 'new',
        matched: ['Keyword: Adidas', 'Volume: >25 / day'],
        matchCount: 34, mentionsKey: 'drift', read: true
      },
      {
        id: 'a9', ruleId: 'r6', topicId: 't4', severity: 'info', firedAt: NOW - 2 * DAY - 11 * HOUR, status: 'dismissed',
        matched: ['Keyword: #NikeHoliday'],
        matchCount: 5, mentionsKey: 'campaign', read: true
      },
      {
        id: 'a10', ruleId: 'r1', topicId: 't1', severity: 'important', firedAt: NOW - 3 * DAY - 2 * HOUR, status: 'acknowledged',
        matched: ['Sentiment: negative', 'Volume: >3 / hour'],
        matchCount: 4, mentionsKey: 'crisis', read: true
      },
      {
        id: 'a11', ruleId: 'r3', topicId: 't1', severity: 'info', firedAt: NOW - 4 * DAY, status: 'acknowledged',
        matched: ['Sentiment drift detected'],
        matchCount: 11, mentionsKey: 'drift', read: true
      },
      {
        id: 'a12', ruleId: 'r4', topicId: 't2', severity: 'important', firedAt: NOW - 4 * DAY - 8 * HOUR, status: 'acknowledged',
        matched: ['Author tier: high', 'Platform: Instagram'],
        matchCount: 1, mentionsKey: 'influencer', read: true
      },
    ];

