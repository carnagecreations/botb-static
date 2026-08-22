/*
 * Pulls live "available for adoption" animals straight from the rescue's
 * Firestore `publicAnimals` collection (see rescue-volunteer-app repo,
 * stores/animals.js's syncPublicAnimal) and replaces the static
 * #animal-grid cards on /adopt with them.
 *
 * Calls the Firestore REST API directly with the project's public web API
 * key rather than going through a Cloudflare Function — that key isn't a
 * secret (it just identifies the Firebase project; Firestore Security
 * Rules are the actual authorization boundary, and `publicAnimals` is the
 * one collection deliberately open to `allow read: if true`), and this
 * avoids needing a service-account key Google Cloud org policy disabled
 * for this account.
 *
 * Fails soft: if Firestore is unreachable or returns nothing, the static
 * cards already in the HTML stay exactly as they are — this script only
 * ever overwrites the grid once it has real data in hand.
 */
(function () {
  var FIREBASE_PROJECT_ID = 'reptilebase-10c89';
  var FIREBASE_API_KEY = 'AIzaSyC0c-NwJ0XswinjWcqr3OmSGASfLNpB2pQ';
  var ANIMALS_API_URL =
    'https://firestore.googleapis.com/v1/projects/' +
    FIREBASE_PROJECT_ID +
    '/databases/(default)/documents/publicAnimals?key=' +
    FIREBASE_API_KEY +
    '&pageSize=300';

  function fsValue(field) {
    if (!field) return null
    if (field.stringValue !== undefined) return field.stringValue
    if (field.integerValue !== undefined) return Number(field.integerValue)
    if (field.doubleValue !== undefined) return field.doubleValue
    if (field.booleanValue !== undefined) return field.booleanValue
    return null
  }

  function docToAnimal(fsDoc) {
    var f = fsDoc.fields || {};
    return {
      id: fsDoc.name.split('/').pop(),
      slug: fsValue(f.slug),
      name: fsValue(f.name),
      species: fsValue(f.species),
      breed: fsValue(f.breed),
      sex: fsValue(f.sex),
      ageLabel: fsValue(f.ageLabel),
      sizeLabel: fsValue(f.sizeLabel),
      experienceLevel: fsValue(f.experienceLevel),
      bio: fsValue(f.bio),
      status: fsValue(f.status),
    };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function sexLabel(sex) {
    if (sex === 'male') return '♂ male';
    if (sex === 'female') return '♀ female';
    return '';
  }

  function badgesHtml(animal) {
    var badges = [];
    if (animal.ageLabel) badges.push(animal.ageLabel);
    if (animal.experienceLevel) badges.push(animal.experienceLevel + ' adopter');
    if (animal.sizeLabel) badges.push(animal.sizeLabel);
    return badges
      .map(function (b) {
        return (
          '<span class="inline-flex items-center border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest-2 border-obsidian-600 bg-obsidian-900 text-bone-300">' +
          escapeHtml(b) +
          '</span>'
        );
      })
      .join('');
  }

  function breedLineHtml(animal) {
    // `breed` already carries the full common name + morph (e.g. "Ball
    // Python (Blue Eyed Leucistic)"), so lead with that — `species` is
    // just a broad category (Snake/Lizard/Tarantula/...) and reads
    // redundant as a prefix when breed is this specific. Only fall back
    // to species when breed is missing entirely.
    if (animal.breed) return escapeHtml(animal.breed);
    return escapeHtml(animal.species || '');
  }

  function cardHtml(animal) {
    var experience = animal.experienceLevel || 'beginner';
    var species = animal.species ? String(animal.species).toLowerCase() : 'reptile';
    var slug = encodeURIComponent(animal.slug || animal.id || '');
    return (
      '<article class="group relative flex flex-col overflow-hidden border border-obsidian-700/80 bg-obsidian-850 reptile-card-lift glow-border hover:border-jade-600" data-experience="' +
      escapeHtml(experience) +
      '" data-species="' +
      escapeHtml(species) +
      '">' +
      '<div class="flex flex-1 flex-col p-6">' +
      '<div class="species-placeholder h-32" aria-hidden="true"><svg width="48" height="48" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 37 C 5 32, 10 23, 19 21 C 28 19, 11 15, 16 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="8.5" r="2.8" fill="currentColor"/></svg></div>' +
      '<div class="flex items-baseline justify-between gap-3">' +
      '<h2 class="font-display text-2xl font-normal text-bone-50">' +
      escapeHtml(animal.name) +
      '</h2>' +
      '<span class="inline-flex items-center font-mono text-[10px] uppercase tracking-widest-2 text-bone-400">' +
      sexLabel(animal.sex) +
      '</span>' +
      '</div>' +
      '<div class="mt-1 font-mono text-[11px] uppercase tracking-widest-2 text-jade-300">' +
      breedLineHtml(animal) +
      '</div>' +
      '<p class="mt-4 flex-1 text-sm leading-relaxed text-bone-200">' +
      escapeHtml(animal.bio || '') +
      '</p>' +
      '<div class="mt-6 flex flex-wrap gap-2">' +
      badgesHtml(animal) +
      '</div>' +
      '<div class="mt-6 border-t border-obsidian-700 pt-5">' +
      '<a class="group/cta inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest-2 text-jade-300 transition-all hover:text-jade-200 group-hover:tracking-[0.3em]" style="transition-timing-function:var(--ease-expo);transition-duration:350ms" aria-label="Apply to adopt ' +
      escapeHtml(animal.name) +
      '" href="/adopt/apply/?reptile=' +
      slug +
      '">Apply to adopt<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right h-3.5 w-3.5 transition-transform" style="transition-duration:350ms"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></a>' +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function updateCounts(count) {
    var badge = document.getElementById('animal-count-badge');
    if (badge) {
      var dot = badge.querySelector('.badge-dot');
      badge.innerHTML =
        (dot ? dot.outerHTML : '') + count + ' animal' + (count === 1 ? '' : 's') + ' need' + (count === 1 ? 's' : '') + ' homes';
    }
    var availableCount = document.getElementById('available-count');
    if (availableCount) availableCount.textContent = String(count);
  }

  function init() {
    var grid = document.getElementById('animal-grid');
    if (!grid) return;

    fetch(ANIMALS_API_URL, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error('Firestore returned ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var animals = ((data && data.documents) || []).map(docToAnimal);
        if (!animals.length) return; // keep the static fallback cards

        grid.innerHTML = animals.map(cardHtml).join('');
        updateCounts(animals.length);

        // Reuse the page's own filter function so the experience-level
        // buttons and "Showing N animals" status line recompute against
        // the new cards instead of the stale static count.
        if (typeof window.bbFilter === 'function') window.bbFilter('all');
      })
      .catch(function () {
        // Network or API failure: leave the static cards exactly as they are.
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
