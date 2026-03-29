'use strict';

/**
 * API:
 * GET https://lego-api-blue.vercel.app/deals?page=1&size=6
 * GET https://lego-api-blue.vercel.app/sales?id=<legoSetId>
 */

// ─── State ────────────────────────────────────────────────────────────────────
let currentDeals = [];
let currentPagination = {};
let currentSales = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Active filters & sort
let filterBestDiscount = false;
let filterMostCommented = false;
let filterHotDeals = false;
let filterFavorites = false;
let currentSort = 'none';

// ─── Selectors ────────────────────────────────────────────────────────────────
const selectShow          = document.querySelector('#show-select');
const selectPage          = document.querySelector('#page-select');
const selectSort          = document.querySelector('#sort-select');
const selectLegoSetIds    = document.querySelector('#lego-set-id-select');
const sectionDeals        = document.querySelector('#deals');
const spanNbDeals         = document.querySelector('#nbDeals');
const spanNbSales         = document.querySelector('#nbSales');

// Filter spans — we identify them by their text content
const spanFilterDiscount  = [...document.querySelectorAll('#filters span')]
  .find(s => s.textContent.includes('best discount'));
const spanFilterCommented = [...document.querySelectorAll('#filters span')]
  .find(s => s.textContent.includes('most commented'));
const spanFilterHot       = [...document.querySelectorAll('#filters span')]
  .find(s => s.textContent.includes('hot deals'));

// Indicator spans (in order they appear in the HTML)
const indicatorSpans = document.querySelectorAll('#indicators div span:nth-child(2)');
const spanP5       = indicatorSpans[2];
const spanP25      = indicatorSpans[3];
const spanP50      = indicatorSpans[4];
const spanLifetime = indicatorSpans[5];
// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract unique lego set ids from deals
 * @param {Array} deals
 * @returns {Array}
 */
/**
 * Sort deals array
 * @param {Array} deals
 * @param {string} sort - 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc'
 * @returns {Array}
 */
const sortDeals = (deals, sort) => {
  const sorted = deals.slice();
  if (sort === 'price-asc')  return sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return sorted.sort((a, b) => b.price - a.price);
  if (sort === 'date-asc')   return sorted.sort((a, b) => new Date(a.published) - new Date(b.published));
  if (sort === 'date-desc')  return sorted.sort((a, b) => new Date(b.published) - new Date(a.published));
  return sorted;
};

/**
 * Apply active filters to deals
 * @param {Array} deals
 * @returns {Array}
 */
const applyFilters = deals => {
  let filtered = deals.slice();
  if (filterBestDiscount)  filtered = filtered.filter(d => d.discount > 50);
  if (filterMostCommented) filtered = filtered.filter(d => d.comments > 15);
  if (filterHotDeals)      filtered = filtered.filter(d => d.temperature > 100);
  if (filterFavorites)     filtered = filtered.filter(d => favorites.includes(d.uuid));
  return filtered;
};

/**
 * Compute percentile from a sorted array of numbers
 * @param {Array} sorted
 * @param {number} p - percentile between 0 and 1
 * @returns {number}
 */
const quantile = (sorted, p) => {
  if (!sorted.length) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const w = idx - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
};

/**
 * Compute lifetime in days between oldest and newest published date
 * @param {Array} sales
 * @returns {number}
 */
const computeLifetime = sales => {
  if (!sales.length) return 0;
  const dates = sales.map(s => new Date(s.published * 1000)).filter(d => !isNaN(d));
  if (!dates.length) return 0;
  const oldest = Math.min(...dates);
  const newest = Math.max(...dates);
  return Math.round((newest - oldest) / (1000 * 60 * 60 * 24));
};

// ─── State setter ─────────────────────────────────────────────────────────────
const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetch deals from API
 * @param {number} page
 * @param {number} size
 * @returns {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();
    if (body.success !== true) {
      console.error(body);
      return { currentDeals, currentPagination };
    }
    return body.data;
  } catch (error) {
    console.error(error);
    return { currentDeals, currentPagination };
  }
};

/**
 * Fetch Vinted sales for a given lego set id
 * @param {string} id
 * @returns {Array}
 */
const fetchSales = async id => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/sales?id=${id}`
    );
    const body = await response.json();
    if (body.success !== true) {
      console.error(body);
      return [];
    }
    return body.data.result;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ─── Render ───────────────────────────────────────────────────────────────────

/**
 * Feature 0 + filters + sort — Render deals list
 * @param {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');

  const template = deals.map(deal => {
    const isFav = favorites.includes(deal.uuid);
    return `
  
  <div class="deal" id="${deal.uuid}">
    <span class="deal-id">${deal.id}</span>
    <a class="deal-link" href="${deal.link}" target="_blank" rel="noopener">${deal.title}</a>
    <span class="deal-price">€${deal.price}</span>
    <div class="deal-meta">
      <span class="deal-discount">${deal.discount ?? '—'}%</span>
      <span class="deal-comments">💬 ${deal.comments}</span>
      <span class="deal-temperature">🌡 ${deal.temperature}</span>
    </div>
    <button class="deal-favorite" data-uuid="${deal.uuid}">${isFav ? '❤️' : '🤍'}</button>
  </div>
`;
  }).join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);

  // Feature 13 — favorite buttons
  sectionDeals.querySelectorAll('.deal-favorite').forEach(btn => {
    btn.addEventListener('click', () => {
      const uuid = btn.dataset.uuid;
      if (favorites.includes(uuid)) {
        favorites = favorites.filter(f => f !== uuid);
      } else {
        favorites.push(uuid);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
      renderDeals(getDisplayDeals());
    });
  });
};

/**
 * Feature 1 — Render page selector
 * @param {Object} pagination
 */
const renderPagination = pagination => {
  const { currentPage, pageCount } = pagination;
  const options = Array.from(
    { length: pageCount },
    (_, i) => `<option value="${i + 1}">${i + 1}</option>`
  ).join('');
  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set id selector
 * @param {Array} deals
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => `<option value="${id}">${id}</option>`).join('');
  selectLegoSetIds.innerHTML = options;
};

/**
 * Feature 8 — Render number of deals & sales
 * @param {Object} pagination
 */
const renderIndicators = pagination => {
  spanNbDeals.innerHTML = pagination.count;
};

/**
 * Feature 7 — Render Vinted sales
 * @param {Array} sales
 */
const renderSales = sales => {
  const existing = document.querySelector('#sales');
  if (existing) existing.remove();

  const section = document.createElement('section');
  section.id = 'sales';

  const template = sales.map(sale => `
    <div class="sale">
      <a href="${sale.link}" target="_blank" rel="noopener">${sale.title}</a>
      <span>€${sale.price?.amount || sale.price}</span>
      <span>${new Date(sale.published * 1000).toLocaleDateString()}</span>
    </div>
  `).join('');

  section.innerHTML = `<h2>Vinted Sales</h2>${template}`;
  document.body.appendChild(section);
};

/**
 * Feature 9 — Render price indicators from sales
 * @param {Array} sales
 */
const renderSalesIndicators = sales => {
  spanNbSales.innerHTML = sales.length;

  const prices = sales.map(s => parseFloat(s.price?.amount || s.price)).filter(p => !isNaN(p)).sort((a, b) => a - b);

  if (spanP5)       spanP5.innerHTML   = prices.length ? quantile(prices, 0.05).toFixed(2) : '—';
  if (spanP25)      spanP25.innerHTML  = prices.length ? quantile(prices, 0.25).toFixed(2) : '—';
  if (spanP50)      spanP50.innerHTML  = prices.length ? quantile(prices, 0.50).toFixed(2) : '—';

  // Feature 10 — Lifetime
  const lifetime = computeLifetime(sales);
  if (spanLifetime) spanLifetime.innerHTML = `${lifetime} days`;
};

/**
 * Get the deals to display after applying filters and sort
 * @returns {Array}
 */
const getDisplayDeals = () => {
  const filtered = applyFilters(currentDeals);
  return sortDeals(filtered, currentSort);
};

/**
 * Main render
 */
const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
};

// ─── Listeners ────────────────────────────────────────────────────────────────

// Feature 0 — Show more (6, 12, 24)
selectShow.addEventListener('change', async event => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));
  setCurrentDeals(deals);
  render(getDisplayDeals(), currentPagination);
});

// Feature 1 — Browse pages
selectPage.addEventListener('change', async event => {
  const size = parseInt(selectShow.value);
  const deals = await fetchDeals(parseInt(event.target.value), size);
  setCurrentDeals(deals);
  render(getDisplayDeals(), currentPagination);
});

// Feature 5 — Sort
selectSort.addEventListener('change', event => {
  currentSort = event.target.value;
  renderDeals(getDisplayDeals());
});

// Feature 2 — Filter by best discount
if (spanFilterDiscount) {
  spanFilterDiscount.style.cursor = 'pointer';
  spanFilterDiscount.addEventListener('click', () => {
    filterBestDiscount = !filterBestDiscount;
    spanFilterDiscount.style.fontWeight = filterBestDiscount ? 'bold' : 'normal';
    renderDeals(getDisplayDeals());
  });
}

// Feature 3 — Filter by most commented
if (spanFilterCommented) {
  spanFilterCommented.style.cursor = 'pointer';
  spanFilterCommented.addEventListener('click', () => {
    filterMostCommented = !filterMostCommented;
    spanFilterCommented.style.fontWeight = filterMostCommented ? 'bold' : 'normal';
    renderDeals(getDisplayDeals());
  });
}

// Feature 4 — Filter by hot deals
if (spanFilterHot) {
  spanFilterHot.style.cursor = 'pointer';
  spanFilterHot.addEventListener('click', () => {
    filterHotDeals = !filterHotDeals;
    spanFilterHot.style.fontWeight = filterHotDeals ? 'bold' : 'normal';
    renderDeals(getDisplayDeals());
  });
}

// Feature 14 — Filter by favorites
// We add a "Favorites" span to the filters div dynamically
const filtersDiv = document.querySelector('#filters');
if (filtersDiv) {
  const spanFav = document.createElement('span');
  spanFav.textContent = 'Favorites only';
  spanFav.style.cursor = 'pointer';
  spanFav.style.marginLeft = '10px';
  filtersDiv.appendChild(spanFav);

  spanFav.addEventListener('click', () => {
    filterFavorites = !filterFavorites;
    spanFav.style.fontWeight = filterFavorites ? 'bold' : 'normal';
    renderDeals(getDisplayDeals());
  });
}

// Feature 7 + 8 + 9 + 10 — Load sales when lego set id changes
selectLegoSetIds.addEventListener('change', async event => {
  const id = event.target.value;
  currentSales = await fetchSales(id);
  renderSales(currentSales);
  renderSalesIndicators(currentSales);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
const init = async () => {
  const deals = await fetchDeals();
  setCurrentDeals(deals);
  render(getDisplayDeals(), currentPagination);

  // Auto-load sales for first lego set id
  if (selectLegoSetIds.value) {
    currentSales = await fetchSales(selectLegoSetIds.value);
    renderSales(currentSales);
    renderSalesIndicators(currentSales);
  }
};

init();