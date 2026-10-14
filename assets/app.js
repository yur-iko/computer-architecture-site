(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const content = window.ARCHITECTURE_CONTENT;
  if (!content || !content.lessons.length) {
    $('#lesson-title').textContent = 'The lesson files could not be loaded.';
    $('#lesson-content').innerHTML = '<p>Keep the <strong>assets</strong> folder beside <strong>index.html</strong>, then reopen the page. You can also read the guide PDF from the download links.</p>';
    return;
  }
  const { chapters, lessons, extras } = content;
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };
  const escape = (text) => text.replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const searchText = new Map(lessons.map((lesson) => [lesson.id, normalize(`${lesson.id} ${lesson.title} ${chapterById.get(lesson.chapter).label} ${lesson.search}`)]));
  let currentId = '', themeTimer, wasSearching = false, openBeforeSearch = new Set();
  $('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    $('#reading').focus({ preventScroll: true });
    $('#reading').scrollIntoView({ block: 'start', behavior: 'instant' });
  });

  function syncThemeButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('#theme-label').textContent = dark ? 'Light theme' : 'Dark theme';
    $('#theme-toggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    $('#theme-icon').innerHTML = dark
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>'
      : '<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z"/>';
    $('meta[name="theme-color"]').content = dark ? '#151221' : '#f5f1fc';
  }
  $('#theme-toggle').addEventListener('click', () => {
    document.body.classList.add('theme-changing');
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    storage.set('architecture-theme', theme);
    syncThemeButton();
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => document.body.classList.remove('theme-changing'), 250);
  });
  syncThemeButton();

  function renderNavigation() {
    const rawQuery = $('#lesson-search').value.trim();
    const terms = normalize(rawQuery).split(/\s+/).filter(Boolean);
    const activeChapter = lessonById.get(currentId)?.chapter;
    const currentOpen = new Set([...document.querySelectorAll('.chapter-group[open]')].map((group) => group.dataset.chapter));
    if (terms.length && !wasSearching) openBeforeSearch = currentOpen;
    const openChapters = wasSearching && !terms.length ? openBeforeSearch : currentOpen;
    const exactLessonId = /^(?:I|[1-5])\.\d+$/i.test(rawQuery) ? rawQuery.toUpperCase() : '';
    let matches = 0;
    $('#chapter-navigation').innerHTML = chapters.map((chapter) => {
      const selected = lessons.filter((lesson) => lesson.chapter === chapter.id && (exactLessonId ? lesson.id === exactLessonId : terms.every((term) => searchText.get(lesson.id).includes(term))));
      matches += selected.length;
      if (!selected.length) return '';
      const open = terms.length || activeChapter === chapter.id || openChapters.has(chapter.id);
      return `<details class="chapter-group" data-chapter="${chapter.id}"${open ? ' open' : ''}><summary><span><strong>${escape(chapter.label)}</strong><small>${escape(chapter.title)}</small></span><span class="chapter-count">${selected.length}</span></summary><ul class="lesson-list">${selected.map((lesson) => `<li><a class="lesson-link" href="#lesson/${lesson.id}"${lesson.id === currentId ? ' aria-current="page"' : ''}><span class="lesson-id">${lesson.id}</span><span>${escape(lesson.title)}</span></a></li>`).join('')}</ul></details>`;
    }).join('');
    $('#empty-search').hidden = matches !== 0;
    $('#search-status').textContent = terms.length ? `${matches} matching ${matches === 1 ? 'lesson' : 'lessons'} · searches the full text` : 'Introduction + Chapters 1–5';
    wasSearching = Boolean(terms.length);
  }
  $('#lesson-search').addEventListener('input', renderNavigation);
  $('#clear-search').addEventListener('click', () => {
    $('#lesson-search').value = '';
    renderNavigation();
    $('#lesson-search').focus();
  });

  function closeMenu() {
    $('#lesson-sidebar').classList.remove('is-open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
  }
  $('#menu-toggle').addEventListener('click', () => {
    const open = $('#lesson-sidebar').classList.toggle('is-open');
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
    if (open) $('#lesson-search').focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#lesson-sidebar').classList.contains('is-open')) {
      closeMenu();
      $('#menu-toggle').focus();
    }
  });

  function setPaging(selector, lesson, label) {
    const link = $(selector);
    if (lesson) {
      link.href = `#lesson/${lesson.id}`;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
      link.querySelector('strong').textContent = `${lesson.id} · ${lesson.title}`;
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
      link.querySelector('strong').textContent = label;
    }
  }

  function renderPage(moveFocus = true) {
    const route = location.hash.slice(1);
    let page, index = -1;
    let missing = false;
    if (route === 'study' || route === 'sources') {
      page = extras[route];
      currentId = '';
      $('#lesson-location').textContent = route === 'study' ? 'Reading plan' : 'Course sources';
      $('#lesson-paging').hidden = true;
      $('#sequence-position').hidden = true;
    } else {
      const match = /^lesson\/((?:I|[1-5])\.\d+)$/.exec(route);
      const wantedId = match?.[1] || (route ? '' : storage.get('architecture-last-lesson'));
      missing = Boolean(route && !lessonById.has(wantedId));
      page = lessonById.get(wantedId) || lessons[0];
      currentId = page.id;
      index = lessons.indexOf(page);
      storage.set('architecture-last-lesson', page.id);
      $('#lesson-location').textContent = `${chapterById.get(page.chapter).label} / Lesson ${page.id}`;
      $('#lesson-paging').hidden = false;
      $('#sequence-position').hidden = false;
      $('#sequence-position').textContent = `Lesson ${index + 1} of ${lessons.length}`;
      setPaging('#previous-lesson', lessons[index - 1], 'You are at the first lesson');
      setPaging('#next-lesson', lessons[index + 1], 'You have reached the last lesson');
      if (!route || missing) history.replaceState(null, '', `#lesson/${page.id}`);
    }
    $('#route-message').hidden = !missing;
    $('#route-message').textContent = missing ? 'That lesson link was not found. The first lesson is open; choose any lesson from the menu.' : '';
    $('#lesson-title').textContent = page.title;
    document.title = `${page.id ? page.id + ' · ' : ''}${page.title} | Computer Architecture`;
    $('#lesson-content').innerHTML = page.html;
    const outline = $('#lesson-outline');
    outline.hidden = page.headings.length < 2;
    outline.innerHTML = page.headings.length < 2 ? '' : `<details><summary>In this lesson</summary><ul>${page.headings.map((heading) => `<li><a href="#" data-section="${heading.anchor}">${escape(heading.title)}</a></li>`).join('')}</ul></details>`;
    renderNavigation();
    closeMenu();
    $('#print-lesson').setAttribute('aria-label', `Print ${page.id ? 'lesson ' + page.id : page.title}`);
    if (moveFocus) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      $('#reading').focus({ preventScroll: true });
    }
  }

  $('#lesson-outline').addEventListener('click', (event) => {
    const link = event.target.closest('[data-section]');
    if (!link) return;
    event.preventDefault();
    const heading = document.getElementById(link.dataset.section);
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  $('#chapter-navigation').addEventListener('click', (event) => {
    const link = event.target.closest('.lesson-link');
    if (!link) return;
    if (link.hash === location.hash) {
      event.preventDefault();
      closeMenu();
      window.scrollTo({ top: 0, behavior: 'instant' });
      $('#reading').focus({ preventScroll: true });
    }
  });
  $('#print-lesson').addEventListener('click', () => window.print());
  window.addEventListener('hashchange', () => renderPage());
  renderPage(false);
})();
