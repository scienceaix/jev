(function () {
  'use strict';

  const atlas = window.JEV_ATLAS;
  const state = { role: 'all', maturity: 'all', access: 'all' };
  const $ = (selector) => document.querySelector(selector);

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderMetrics() {
    const container = $('#metrics');
    container.innerHTML = atlas.metrics.map((metric) => `
      <div class="metric metric-${escapeHTML(metric.tone)}">
        <strong class="metric-value">${escapeHTML(metric.value)}</strong>
        <span class="metric-label">${escapeHTML(metric.label)}</span>
      </div>
    `).join('');
  }

  function renderRoleFilters() {
    const container = $('#role-filters');
    container.innerHTML = atlas.roles.map((role) => `
      <button class="filter-button" type="button" data-role-filter="${escapeHTML(role.id)}" aria-pressed="${role.id === state.role}">${escapeHTML(role.label)}</button>
    `).join('');
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-role-filter]');
      if (!button) return;
      state.role = button.dataset.roleFilter;
      container.querySelectorAll('[data-role-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      renderProjects();
    });
  }

  function renderSelect(select, values, stateKey) {
    select.innerHTML = values.map((value, index) => {
      const optionValue = index === 0 ? 'all' : value;
      return `<option value="${escapeHTML(optionValue)}">${escapeHTML(value)}</option>`;
    }).join('');
    select.addEventListener('change', () => {
      state[stateKey] = select.value;
      renderProjects();
    });
  }

  function projectMatches(project) {
    return (state.role === 'all' || project.role === state.role)
      && (state.maturity === 'all' || project.maturity === state.maturity)
      && (state.access === 'all' || project.access === state.access);
  }

  function projectCard(project) {
    const stars = project.starsLabel || '—';
    return `
      <article class="project-card" data-role="${escapeHTML(project.role)}" title="${escapeHTML(project.sourceNote)}">
        <div class="project-card-top">
          <span class="project-rank">${String(project.rank).padStart(2, '0')} / ${escapeHTML(project.role)}</span>
          <span class="project-stars">${escapeHTML(stars)} ★</span>
        </div>
        <h3><a href="${escapeHTML(project.url)}" target="_blank" rel="noreferrer">${escapeHTML(project.name)} <span aria-hidden="true">↗</span></a></h3>
        <p>${escapeHTML(project.description)}</p>
        <div class="project-card-footer">
          <span class="tag">${escapeHTML(project.maturity)}</span>
          <span class="tag">${escapeHTML(project.access)}</span>
          <span class="tag tag-signal">${escapeHTML(project.recommendation)}</span>
        </div>
      </article>
    `;
  }

  function renderProjects() {
    const projects = atlas.projects.filter(projectMatches);
    const grid = $('#project-grid');
    grid.innerHTML = projects.length
      ? projects.map(projectCard).join('')
      : '<p class="empty-state">No projects match this combination. Reset one filter to widen the field.</p>';
    $('#filter-count').textContent = `${projects.length} of ${atlas.projects.length} projects`;
  }

  function renderLeaderboard() {
    const ranked = atlas.projects.filter((project) => Number.isFinite(project.stars)).sort((a, b) => b.stars - a.stars);
    const maxStars = ranked[0].stars;
    $('#leaderboard-list').innerHTML = ranked.map((project, index) => `
      <div class="leader-row">
        <span class="leader-rank">${String(index + 1).padStart(2, '0')}</span>
        <a class="leader-name" href="${escapeHTML(project.url)}" target="_blank" rel="noreferrer">${escapeHTML(project.name)}</a>
        <div class="leader-track" role="img" aria-label="${escapeHTML(project.starsLabel)} GitHub stars"><div class="leader-fill" style="width:${Math.max(2, (project.stars / maxStars) * 100)}%"></div></div>
        <span class="leader-stars">${escapeHTML(project.starsLabel)}</span>
      </div>
    `).join('');
  }

  function renderTimeline() {
    $('#timeline-list').innerHTML = atlas.timeline.map((item) => `
      <div class="timeline-item">
        <time class="timeline-date">${escapeHTML(item.date)}</time>
        <span class="timeline-marker" aria-hidden="true"></span>
        <div><strong class="timeline-title">${escapeHTML(item.title)}</strong><p class="timeline-detail">${escapeHTML(item.detail)}</p></div>
      </div>
    `).join('');
  }

  function renderRecommendations() {
    $('#recommendation-list').innerHTML = atlas.recommendations.map((item) => `
      <article class="recommendation">
        <span class="recommendation-index">${escapeHTML(item.index)} / ${escapeHTML(item.tone)}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.body)}</p>
      </article>
    `).join('');
  }

  function init() {
    $('#hero-eyebrow').textContent = atlas.thesis.eyebrow;
    $('#hero-body').textContent = atlas.thesis.body;
    $('#hero-snapshot').textContent = atlas.meta.snapshot.toUpperCase();
    renderMetrics();
    renderRoleFilters();
    renderSelect($('#maturity-filter'), atlas.maturity, 'maturity');
    renderSelect($('#access-filter'), atlas.access, 'access');
    renderProjects();
    renderLeaderboard();
    renderTimeline();
    renderRecommendations();
  }

  init();
}());
