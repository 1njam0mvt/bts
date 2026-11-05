/* Music tray logic with no DOM: filter by mood / era / search words, and chip counts. Browser: window.MusicCore. Node: require() in tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MusicCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ERA_LABEL = {
    school: 'School era', hyyh: 'HYYH', wings: 'WINGS', 'love-yourself': 'Love Yourself',
    'map-of-the-soul': 'Map of the Soul', be: 'BE', proof: 'Proof', latest: 'Latest (2026)'
  };
  const MOOD_LABEL = {
    heartbreak: 'Heartbreak', loneliness: 'Loneliness', healing: 'Healing', joy: 'Joy', comfort: 'Comfort', courage: 'Courage', nostalgia: 'Nostalgia'
  };

  const isPlayable = (t) => /^[\w-]{11}$/.test(String(t && t.youtubeId));

  /** Lower-case and strip accents so "Beyoncé" matches "beyonce". */
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  function filter(tracks, f) {
    f = f || {};
    const mood = f.mood || 'all', era = f.era || 'all';
    const terms = norm(f.query || '').split(/\s+/).filter(Boolean);
    return tracks.filter((t) => {
      if (f.playableOnly && !isPlayable(t)) return false;
      if (mood !== 'all' && t.moods.indexOf(mood) === -1) return false;
      if (era !== 'all' && t.era !== era) return false;
      const hay = norm(t.title + ' ' + t.artist + ' ' + (ERA_LABEL[t.era] || '') + ' ' + t.moods.map((m) => MOOD_LABEL[m] || m).join(' '));
      return terms.every((w) => hay.indexOf(w) > -1);        // every typed word must match somewhere
    });
  }

  /** How many songs each chip would give, given the OTHER active filters (so empty chips can be greyed out). */
  function facetCounts(tracks, f) {
    const eras = {}, moods = {};
    filter(tracks, Object.assign({}, f, { era: 'all' })).forEach((t) => { eras[t.era] = (eras[t.era] || 0) + 1; });
    filter(tracks, Object.assign({}, f, { mood: 'all' })).forEach((t) => t.moods.forEach((m) => { moods[m] = (moods[m] || 0) + 1; }));
    return { eras, moods };
  }

  return { ERA_LABEL, MOOD_LABEL, isPlayable, filter, facetCounts };
});
