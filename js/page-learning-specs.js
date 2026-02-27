// ══════════════════════════════════════════════════════════════════
// LEARNING SPECIFICATIONS PAGE
// ══════════════════════════════════════════════════════════════════

const LS_API_BASE = ZAVMO_BASE_URL;
const LS_SEARCH_ENDPOINT = '/api/search/unified/';

// In-memory cache for search results and stats
const lsDataCache = {
    results: null,
    activeTab: 'all',
    lastQuery: '',
    statsLoaded: false,
    initialised: false,
    sectors: new Set(),
    currentSort: 'popular',
    apiCards: null,
    currentData: null
};

let lsSearchTimeout = null;

/**
 * Initialise the Learning Specifications page.
 * Called once when the tab is first shown.
 */
function initLearningSpecsPage() {
    if (lsDataCache.initialised) return;
    lsDataCache.initialised = true;

    // Wire up search input (debounced)
    const searchInput = document.getElementById('ls-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', onLSSearchInput);
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (lsSearchTimeout) clearTimeout(lsSearchTimeout);
                executeLSSearch();
            }
        });
    }

    // Wire up search button
    const searchBtn = document.getElementById('ls-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', executeLSSearch);
    }

    // Wire up sort dropdown
    const sortDropdown = document.getElementById('ls-sort-dropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', function() {
            lsDataCache.currentSort = this.value;
            renderLSCards(lsData);
        });
    }

    // Wire up filter dropdowns
    const filterLevel = document.getElementById('ls-filter-level');
    const filterSector = document.getElementById('ls-filter-sector');
    const filterType = document.getElementById('ls-filter-type');
    if (filterLevel) filterLevel.addEventListener('change', onLSFilterChange);
    if (filterSector) filterSector.addEventListener('change', onLSFilterChange);
    if (filterType) filterType.addEventListener('change', onLSFilterChange);

    // Wire up clear filters
    const clearBtn = document.getElementById('ls-clear-filters');
    if (clearBtn) clearBtn.addEventListener('click', clearLSFilters);

    // Wire up result tabs
    const tabContainer = document.getElementById('ls-result-tabs');
    if (tabContainer) {
        tabContainer.querySelectorAll('.ls-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                switchLSResultTab(this.getAttribute('data-ls-tab'));
            });
        });
    }

    // Wire up refresh button
    const refreshBtn = document.getElementById('ls-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            lsDataCache.statsLoaded = false;
            loadLearningSpecsStats();
        });
    }

    // Wire up modal close
    const modalClose = document.getElementById('ls-modal-close');
    if (modalClose) modalClose.addEventListener('click', closeLSDetailModal);
    const modalBackdrop = document.getElementById('ls-detail-modal');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', function(e) {
            if (e.target === modalBackdrop) closeLSDetailModal();
        });
    }

    // Load initial stats
    loadLearningSpecsStats();

    // Render demo cards initially as placeholder
    renderLSCards(lsData);

    // Then try to fetch real data from UAT
    loadRealLSData();
}

/**
 * Debounced handler for search input.
 */
function onLSSearchInput() {
    if (lsSearchTimeout) clearTimeout(lsSearchTimeout);
    lsSearchTimeout = setTimeout(executeLSSearch, 400);
}

/**
 * Handler for filter dropdown changes.
 */
function onLSFilterChange() {
    executeLSSearch();
}

/**
 * Reset all filters and search input.
 */
function clearLSFilters() {
    const searchInput = document.getElementById('ls-search-input');
    const filterLevel = document.getElementById('ls-filter-level');
    const filterSector = document.getElementById('ls-filter-sector');
    const filterType = document.getElementById('ls-filter-type');

    if (searchInput) searchInput.value = '';
    if (filterLevel) filterLevel.value = '';
    if (filterSector) filterSector.value = '';
    if (filterType) filterType.value = '';

    // Clear results and show empty state
    const container = document.getElementById('ls-results-container');
    const header = document.getElementById('ls-results-header');
    const emptyState = document.getElementById('ls-empty-state');
    if (container) container.innerHTML = '';
    if (header) header.style.display = 'none';
    if (emptyState) {
        container.appendChild(emptyState);
        emptyState.style.display = '';
    }

    lsDataCache.results = null;
    lsDataCache.lastQuery = '';
}

/**
 * Execute a search against the unified search API.
 */
async function executeLSSearch() {
    const searchInput = document.getElementById('ls-search-input');
    const query = searchInput ? searchInput.value.trim() : '';

    if (!query) return;

    const filterLevel = document.getElementById('ls-filter-level');
    const filterType = document.getElementById('ls-filter-type');

    const level = filterLevel ? filterLevel.value : '';
    let typeFilter = filterType ? filterType.value : '';
    // Learning Specs: default to NOS and OFQUAL only (no JD unless user selects "Job Descriptions Only")
    if (!typeFilter) typeFilter = 'ofqual,nos';

    try {
        showLSLoading();
        const data = await searchLearningSpecs(query, { level: level, type: typeFilter });
        lsDataCache.results = data;
        lsDataCache.lastQuery = query;

        // Collect sectors for filter population
        if (data && data.ofqual) {
            data.ofqual.forEach(item => {
                if (item.sector_subject_area) {
                    lsDataCache.sectors.add(item.sector_subject_area);
                }
            });
            populateSectorFilter();
        }

        displayLSResults(data, lsDataCache.activeTab);

        // Also update card grid view
        const cards = [];
        data.ofqual.forEach(item => {
            cards.push({
                title: item.title || 'Untitled',
                body: 'OFQUAL',
                level: item.level ? 'Level ' + item.level : '',
                sector: item.sector_subject_area || '',
                type: item.qualification_type || 'Qualification',
                country: 'uk', language: 'en', status: 'Published',
                lastModified: 'From UAT', version: '', linkedJDs: 0,
                enrolled: 0, inProgress: 0, completed: 0,
                overview: item.description || item.overview || '',
                units: item.learning_outcomes || [],
                _source: 'api', _raw: item
            });
        });
        data.nos.forEach(item => {
            cards.push({
                title: item.title || 'Untitled',
                body: 'NOS',
                level: item.qualification_level || '',
                sector: item.industry || '',
                type: 'NOS Standard',
                country: 'uk', language: 'en', status: 'Published',
                lastModified: 'From UAT', version: '', linkedJDs: 0,
                enrolled: 0, inProgress: 0, completed: 0,
                overview: item.description || item.overview || '',
                units: item.performance_criteria || [],
                _source: 'api', _raw: item
            });
        });
        if (cards.length > 0) {
            lsDataCache.apiCards = cards;
            renderLSCards(cards);
        }
    } catch (err) {
        showToast('Search failed: ' + (err.message || 'Unknown error'), 'error');
        showLSEmpty('Search failed. Please check your connection and try again.');
    }
}

/**
 * Fetch from the unified search API.
 * @param {string} query - Search query text
 * @param {Object} filters - Optional filters { level, type }
 * @returns {Object} Parsed API response
 */
async function searchLearningSpecs(query, filters = {}) {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('limit', '50');

    if (filters.level) {
        params.set('level', filters.level);
    }
    if (filters.type) {
        params.set('type', filters.type);
    }

    const url = `${LS_API_BASE}${LS_SEARCH_ENDPOINT}?${params.toString()}`;

    const response = await zavmoFetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return parseUnifiedResponse(data);
}

/**
 * Normalise the unified search API response.
 * Handles string vs array for learning_outcomes, assessment_criteria, etc.
 * @param {Object} data - Raw API response
 * @returns {Object} Normalised response
 */
function parseUnifiedResponse(data) {
    if (!data) return { ofqual: [], nos: [], job_descriptions: [], query: '', inferred_level: null };

    const normalised = {
        ofqual: Array.isArray(data.ofqual) ? data.ofqual.map(normaliseOFQUAL) : [],
        nos: Array.isArray(data.nos) ? data.nos.map(normaliseNOS) : [],
        job_descriptions: Array.isArray(data.job_descriptions) ? data.job_descriptions.map(normaliseJD) : [],
        query: data.query || '',
        inferred_level: data.inferred_level || null
    };

    return normalised;
}

/**
 * Normalise a single OFQUAL item.
 */
function normaliseOFQUAL(item) {
    return {
        id: item.id || '',
        type: 'ofqual',
        title: item.title || 'Untitled',
        level: item.level || '',
        credits: item.credits || 0,
        description: item.description || '',
        learning_objective: item.learning_objective || '',
        learning_outcomes: ensureArray(item.learning_outcomes),
        assessment_criteria: ensureArray(item.assessment_criteria),
        nos_id: item.nos_id || '',
        nos_title: item.nos_title || '',
        unit_id: item.unit_id || '',
        ofqual_id: item.ofqual_id || '',
        qualification_type: item.qualification_type || '',
        sector_subject_area: item.sector_subject_area || '',
        glh: item.glh || 0,
        score: item.score || 0,
        overview: item.overview || ''
    };
}

/**
 * Normalise a single NOS item.
 */
function normaliseNOS(item) {
    return {
        id: item.id || '',
        type: 'nos',
        title: item.title || 'Untitled',
        description: item.description || '',
        score: item.score || 0,
        overview: item.overview || '',
        industry: item.industry || '',
        qualification_level: item.qualification_level || '',
        knowledge_understanding: ensureArray(item.knowledge_understanding),
        performance_criteria: ensureArray(item.performance_criteria),
        relevant_roles: ensureArray(item.relevant_roles)
    };
}

/**
 * Normalise a single Job Description item.
 */
function normaliseJD(item) {
    return {
        job_id: item.job_id || item.id || '',
        type: 'jobDescription',
        title: item.title || item.job_title || 'Untitled',
        job_title: item.job_title || item.title || '',
        description: item.description || '',
        score: item.score || 0,
        industry: item.industry || '',
        experience_band: item.experience_band || '',
        ofqual_level_alignment: item.ofqual_level_alignment || '',
        role_overview: item.role_overview || '',
        key_responsibilities: item.key_responsibilities || '',
        aligned_qualifications: item.aligned_qualifications || '',
        role_purpose: item.role_purpose || '',
        department: item.department || '',
        functional_skills: item.functional_skills || '',
        soft_skills: item.soft_skills || ''
    };
}

/**
 * Ensure a value is an array. If it's a string, split by newlines.
 */
function ensureArray(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
        return val.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return [];
}

/**
 * Parse JD functional_skills and soft_skills (JSON string or array) into learning_outcomes and assessment_criteria arrays.
 * Handles [{"description": "..."}, ...] and plain string formats so the Fetch Modules detail panel shows full LO/AC.
 */
function parseJDSkillsToLOAC(functionalSkills, softSkills) {
    const los = [];
    const acs = [];
    function extractDescriptions(val, out) {
        if (!val) return;
        let arr = [];
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                arr = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : []);
            } catch (_) {
                val.split(/[,;\n]/).forEach(s => { if (s.trim()) out.push(s.trim()); });
                return;
            }
        } else if (Array.isArray(val)) arr = val;
        else if (val && typeof val === 'object') arr = Object.values(val);
        arr.forEach(item => {
            if (typeof item === 'string') out.push(item);
            else if (item && typeof item === 'object' && (item.description || item.text || item.name)) out.push(item.description || item.text || item.name);
        });
    }
    extractDescriptions(functionalSkills, los);
    extractDescriptions(softSkills, acs);
    return { learning_outcomes: los, assessment_criteria: acs };
}

/**
 * Load stats by running broad queries in the background.
 */
async function loadLearningSpecsStats() {
    if (lsDataCache.statsLoaded) return;

    const statOfqual = document.getElementById('ls-stat-ofqual');
    const statNos = document.getElementById('ls-stat-nos');
    const statJd = document.getElementById('ls-stat-jd');
    const statFrameworks = document.getElementById('ls-stat-frameworks');
    const detailOfqual = document.getElementById('ls-stat-ofqual-detail');
    const detailNos = document.getElementById('ls-stat-nos-detail');
    const detailJd = document.getElementById('ls-stat-jd-detail');
    const detailFrameworks = document.getElementById('ls-stat-frameworks-detail');

    // Set loading state
    [statOfqual, statNos, statJd, statFrameworks].forEach(el => {
        if (el) el.textContent = '...';
    });

    try {
        // Run three broad queries in parallel
        const [ofqualResp, nosResp, jdResp] = await Promise.allSettled([
            searchLearningSpecs('qualification', { type: 'ofqual' }),
            searchLearningSpecs('standard', { type: 'nos' }),
            searchLearningSpecs('role', { type: 'jd' })
        ]);

        const ofqualCount = ofqualResp.status === 'fulfilled' ? ofqualResp.value.ofqual.length : 0;
        const nosCount = nosResp.status === 'fulfilled' ? nosResp.value.nos.length : 0;
        const jdCount = jdResp.status === 'fulfilled' ? jdResp.value.job_descriptions.length : 0;

        if (statOfqual) statOfqual.textContent = ofqualCount;
        if (detailOfqual) detailOfqual.textContent = ofqualCount > 0 ? `${ofqualCount}+ in sample` : 'No data yet';

        if (statNos) statNos.textContent = nosCount;
        if (detailNos) detailNos.textContent = nosCount > 0 ? `${nosCount}+ in sample` : 'No data yet';

        if (statJd) statJd.textContent = jdCount;
        if (detailJd) detailJd.textContent = jdCount > 0 ? `${jdCount}+ in sample` : 'No data yet';

        // Collect sectors from OFQUAL results
        if (ofqualResp.status === 'fulfilled') {
            const sectors = new Set();
            ofqualResp.value.ofqual.forEach(item => {
                if (item.sector_subject_area) sectors.add(item.sector_subject_area);
            });
            sectors.forEach(s => lsDataCache.sectors.add(s));
            populateSectorFilter();
        }

        if (statFrameworks) statFrameworks.textContent = 'OFQUAL';
        if (detailFrameworks) detailFrameworks.textContent = 'United Kingdom';

        lsDataCache.statsLoaded = true;

    } catch (err) {
        if (statOfqual) statOfqual.textContent = '--';
        if (statNos) statNos.textContent = '--';
        if (statJd) statJd.textContent = '--';
        if (statFrameworks) statFrameworks.textContent = '--';
        if (detailOfqual) detailOfqual.textContent = 'Connection failed';
        console.warn('Failed to load LS stats:', err);
    }
}

/**
 * Populate the sector filter dropdown from collected sectors.
 */
function populateSectorFilter() {
    const filterSector = document.getElementById('ls-filter-sector');
    if (!filterSector) return;

    const currentVal = filterSector.value;
    const sortedSectors = Array.from(lsDataCache.sectors).sort();

    filterSector.innerHTML = '<option value="">All Sectors</option>';
    sortedSectors.forEach(sector => {
        const opt = document.createElement('option');
        opt.value = sector;
        opt.textContent = sector;
        filterSector.appendChild(opt);
    });

    if (currentVal) filterSector.value = currentVal;
}

/**
 * Switch between OFQUAL / NOS / JD result tabs.
 */
function switchLSResultTab(tab) {
    lsDataCache.activeTab = tab;

    // Update tab button states
    const tabContainer = document.getElementById('ls-result-tabs');
    if (tabContainer) {
        tabContainer.querySelectorAll('.ls-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-ls-tab') === tab);
        });
    }

    // Re-render from cache if we have results
    if (lsDataCache.results) {
        displayLSResults(lsDataCache.results, tab);
    }
}

/**
 * Display search results in the accordion list.
 */
function displayLSResults(data, activeTab) {
    const container = document.getElementById('ls-results-container');
    const header = document.getElementById('ls-results-header');
    const countEl = document.getElementById('ls-results-count');
    const queryEl = document.getElementById('ls-results-query');

    if (!container) return;
    container.innerHTML = '';

    // Gather items based on active tab
    let items = [];
    if (activeTab === 'all' || activeTab === 'ofqual') {
        data.ofqual.forEach(item => items.push({ data: item, type: 'ofqual' }));
    }
    if (activeTab === 'all' || activeTab === 'nos') {
        data.nos.forEach(item => items.push({ data: item, type: 'nos' }));
    }
    if (activeTab === 'all' || activeTab === 'jd') {
        data.job_descriptions.forEach(item => items.push({ data: item, type: 'jd' }));
    }

    // Apply sector filter client-side
    const filterSector = document.getElementById('ls-filter-sector');
    const sectorVal = filterSector ? filterSector.value : '';
    if (sectorVal) {
        items = items.filter(item => {
            if (item.type === 'ofqual') return item.data.sector_subject_area === sectorVal;
            if (item.type === 'nos') return item.data.industry === sectorVal;
            if (item.type === 'jd') return item.data.industry === sectorVal;
            return true;
        });
    }

    // Sort by score descending
    items.sort((a, b) => (b.data.score || 0) - (a.data.score || 0));

    // Update header
    if (header) header.style.display = items.length > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = `${items.length} result${items.length !== 1 ? 's' : ''}`;
    if (queryEl) queryEl.textContent = data.query ? `for "${data.query}"` : '';

    if (items.length === 0) {
        showLSEmpty('No results found. Try a different search term or adjust your filters.');
        return;
    }

    // Render each item
    items.forEach(item => {
        const accordion = renderLSAccordionItem(item.data, item.type);
        container.appendChild(accordion);
    });
}

/**
 * Render a single accordion item.
 */
function renderLSAccordionItem(item, type) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ls-accordion-item';

    // Header
    const header = document.createElement('div');
    header.className = 'ls-accordion-header';

    const leftDiv = document.createElement('div');
    const titleDiv = document.createElement('div');
    titleDiv.className = 'ls-accordion-title';
    titleDiv.textContent = item.title || 'Untitled';
    leftDiv.appendChild(titleDiv);

    // Metadata badges
    const metaDiv = document.createElement('div');
    metaDiv.className = 'ls-accordion-meta';

    // Type badge
    const typeBadge = document.createElement('span');
    typeBadge.className = 'ls-badge ls-badge-type';
    typeBadge.textContent = type === 'ofqual' ? 'OFQUAL' : type === 'nos' ? 'NOS' : 'JD';
    metaDiv.appendChild(typeBadge);

    if (type === 'ofqual') {
        if (item.level) {
            const levelBadge = document.createElement('span');
            levelBadge.className = 'ls-badge ls-badge-level';
            levelBadge.textContent = `Level ${item.level}`;
            metaDiv.appendChild(levelBadge);
        }
        if (item.credits) {
            const creditsBadge = document.createElement('span');
            creditsBadge.className = 'ls-badge ls-badge-credits';
            creditsBadge.textContent = `${item.credits} credits`;
            metaDiv.appendChild(creditsBadge);
        }
        if (item.sector_subject_area) {
            const sectorBadge = document.createElement('span');
            sectorBadge.className = 'ls-badge ls-badge-sector';
            sectorBadge.textContent = item.sector_subject_area;
            metaDiv.appendChild(sectorBadge);
        }
    } else if (type === 'nos') {
        if (item.industry) {
            const indBadge = document.createElement('span');
            indBadge.className = 'ls-badge ls-badge-sector';
            indBadge.textContent = item.industry;
            metaDiv.appendChild(indBadge);
        }
        if (item.qualification_level) {
            const lvlBadge = document.createElement('span');
            lvlBadge.className = 'ls-badge ls-badge-level';
            lvlBadge.textContent = item.qualification_level;
            metaDiv.appendChild(lvlBadge);
        }
    } else if (type === 'jd') {
        if (item.industry) {
            const indBadge = document.createElement('span');
            indBadge.className = 'ls-badge ls-badge-sector';
            indBadge.textContent = item.industry;
            metaDiv.appendChild(indBadge);
        }
        if (item.experience_band) {
            const expBadge = document.createElement('span');
            expBadge.className = 'ls-badge ls-badge-credits';
            expBadge.textContent = item.experience_band;
            metaDiv.appendChild(expBadge);
        }
        if (item.ofqual_level_alignment) {
            const alignBadge = document.createElement('span');
            alignBadge.className = 'ls-badge ls-badge-level';
            alignBadge.textContent = `Level ${item.ofqual_level_alignment}`;
            metaDiv.appendChild(alignBadge);
        }
    }

    leftDiv.appendChild(metaDiv);

    const arrow = document.createElement('span');
    arrow.className = 'ls-accordion-arrow';
    arrow.innerHTML = '&#9654;';

    header.appendChild(leftDiv);
    header.appendChild(arrow);

    // Body
    const body = document.createElement('div');
    body.className = 'ls-accordion-body';
    body.appendChild(renderLSItemDetails(item, type));

    // Toggle handler
    header.addEventListener('click', function() {
        const isOpen = body.classList.contains('open');
        body.classList.toggle('open');
        arrow.classList.toggle('open');
    });

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    return wrapper;
}

/**
 * Render the expanded details for an accordion item.
 */
function renderLSItemDetails(item, type) {
    const fragment = document.createDocumentFragment();

    if (type === 'ofqual') {
        // Description
        if (item.description) {
            const descP = document.createElement('p');
            descP.style.cssText = 'color: #b8c5d6; font-size: 13px; line-height: 1.6; margin: 12px 0;';
            descP.textContent = item.description;
            fragment.appendChild(descP);
        }

        // Learning Outcomes
        if (item.learning_outcomes.length > 0) {
            const loLabel = document.createElement('div');
            loLabel.className = 'ls-section-label';
            loLabel.textContent = `Learning Outcomes (${item.learning_outcomes.length})`;
            fragment.appendChild(loLabel);

            const loList = document.createElement('ul');
            loList.className = 'ls-lo-list';
            item.learning_outcomes.forEach((lo, i) => {
                const li = document.createElement('li');
                li.className = 'ls-lo-item';
                li.innerHTML = `<strong>LO${i + 1}:</strong> ${escapeHTML(lo)}`;
                loList.appendChild(li);
            });
            fragment.appendChild(loList);
        }

        // Assessment Criteria
        if (item.assessment_criteria.length > 0) {
            const acLabel = document.createElement('div');
            acLabel.className = 'ls-section-label';
            acLabel.textContent = `Assessment Criteria (${item.assessment_criteria.length})`;
            fragment.appendChild(acLabel);

            const acList = document.createElement('ul');
            acList.className = 'ls-ac-list';
            item.assessment_criteria.forEach((ac, i) => {
                const li = document.createElement('li');
                li.className = 'ls-ac-item';
                li.innerHTML = `<strong>AC${i + 1}:</strong> ${escapeHTML(ac)}`;
                acList.appendChild(li);
            });
            fragment.appendChild(acList);
        }

        // Metadata row
        const metaInfo = [];
        if (item.ofqual_id) metaInfo.push(`OFQUAL ID: ${item.ofqual_id}`);
        if (item.unit_id) metaInfo.push(`Unit: ${item.unit_id}`);
        if (item.nos_id) metaInfo.push(`NOS: ${item.nos_id}`);
        if (item.glh) metaInfo.push(`GLH: ${item.glh}`);
        if (item.qualification_type) metaInfo.push(`Type: ${item.qualification_type}`);

        if (metaInfo.length > 0) {
            const metaP = document.createElement('p');
            metaP.style.cssText = 'color: #6b7c93; font-size: 12px; margin-top: 12px;';
            metaP.textContent = metaInfo.join(' · ');
            fragment.appendChild(metaP);
        }

    } else if (type === 'nos') {
        if (item.description) {
            const descP = document.createElement('p');
            descP.style.cssText = 'color: #b8c5d6; font-size: 13px; line-height: 1.6; margin: 12px 0;';
            descP.textContent = item.description;
            fragment.appendChild(descP);
        }

        if (item.knowledge_understanding.length > 0) {
            const kuLabel = document.createElement('div');
            kuLabel.className = 'ls-section-label';
            kuLabel.textContent = `Knowledge & Understanding (${item.knowledge_understanding.length})`;
            fragment.appendChild(kuLabel);

            const kuList = document.createElement('ul');
            kuList.className = 'ls-lo-list';
            item.knowledge_understanding.forEach((ku, i) => {
                const li = document.createElement('li');
                li.className = 'ls-lo-item';
                li.innerHTML = `<strong>K${i + 1}:</strong> ${escapeHTML(ku)}`;
                kuList.appendChild(li);
            });
            fragment.appendChild(kuList);
        }

        if (item.performance_criteria.length > 0) {
            const pcLabel = document.createElement('div');
            pcLabel.className = 'ls-section-label';
            pcLabel.textContent = `Performance Criteria (${item.performance_criteria.length})`;
            fragment.appendChild(pcLabel);

            const pcList = document.createElement('ul');
            pcList.className = 'ls-ac-list';
            item.performance_criteria.forEach((pc, i) => {
                const li = document.createElement('li');
                li.className = 'ls-ac-item';
                li.innerHTML = `<strong>PC${i + 1}:</strong> ${escapeHTML(pc)}`;
                pcList.appendChild(li);
            });
            fragment.appendChild(pcList);
        }

        if (item.relevant_roles.length > 0) {
            const rolesP = document.createElement('p');
            rolesP.style.cssText = 'color: #6b7c93; font-size: 12px; margin-top: 12px;';
            rolesP.textContent = 'Relevant roles: ' + item.relevant_roles.join(', ');
            fragment.appendChild(rolesP);
        }

    } else if (type === 'jd') {
        if (item.description) {
            const descP = document.createElement('p');
            descP.style.cssText = 'color: #b8c5d6; font-size: 13px; line-height: 1.6; margin: 12px 0;';
            descP.textContent = item.description;
            fragment.appendChild(descP);
        }

        const metaInfo = [];
        if (item.job_title) metaInfo.push(`Role: ${item.job_title}`);
        if (item.industry) metaInfo.push(`Industry: ${item.industry}`);
        if (item.experience_band) metaInfo.push(`Experience: ${item.experience_band}`);
        if (item.ofqual_level_alignment) metaInfo.push(`OFQUAL alignment: Level ${item.ofqual_level_alignment}`);

        if (metaInfo.length > 0) {
            const metaP = document.createElement('p');
            metaP.style.cssText = 'color: #6b7c93; font-size: 12px; margin-top: 8px;';
            metaP.textContent = metaInfo.join(' · ');
            fragment.appendChild(metaP);
        }
    }

    // View Full Details button
    const detailBtn = document.createElement('button');
    detailBtn.className = 'ls-detail-btn';
    detailBtn.textContent = 'View Full Details';
    detailBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openLSDetailModal(item, type);
    });
    fragment.appendChild(detailBtn);

    return fragment;
}


/**
 * Open the detail modal for a specification.
 * For JD, fetches full details from GET /api/discover/jd/<id>/ then renders.
 */
async function openLSDetailModal(item, type) {
    const modal = document.getElementById('ls-detail-modal');
    const titleEl = document.getElementById('ls-modal-title');
    const subtitleEl = document.getElementById('ls-modal-subtitle');
    const bodyEl = document.getElementById('ls-modal-body');

    if (!modal || !bodyEl) return;

    if (titleEl) titleEl.textContent = item.title || 'Specification Details';

    // Build subtitle based on type
    const subtitleParts = [];
    if (type === 'ofqual') {
        subtitleParts.push('OFQUAL Qualification');
        if (item.level) subtitleParts.push(`Level ${item.level}`);
        if (item.credits) subtitleParts.push(`${item.credits} credits`);
        if (item.qualification_type) subtitleParts.push(item.qualification_type);
    } else if (type === 'nos') {
        subtitleParts.push('National Occupational Standard');
        if (item.industry) subtitleParts.push(item.industry);
    } else if (type === 'jd') {
        subtitleParts.push('Job Description');
        if (item.industry) subtitleParts.push(item.industry);
        if (item.experience_band) subtitleParts.push(item.experience_band);
    }
    if (subtitleEl) subtitleEl.textContent = subtitleParts.join(' · ');

    // Build body content
    bodyEl.innerHTML = '';

    // For JD, fetch full details from API then render
    if (type === 'jd' && (item.job_id || item.id)) {
        bodyEl.innerHTML = '<p style="color: #8a97a8; padding: 16px;">Loading full job description…</p>';
        modal.classList.add('open');
        const baseUrl = (typeof LS_API_BASE !== 'undefined' ? LS_API_BASE : ZAVMO_BASE_URL).replace(/\/+$/, '');
        const jobId = (item.job_id || item.id).toString().trim();
        try {
            const url = `${baseUrl.replace(/\/+$/, '')}/api/discover/jd/${encodeURIComponent(jobId)}/`;
            const response = await zavmoFetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
            if (response.ok) {
                const json = await response.json();
                const data = (json.data || json) || item;
                item = normaliseJD(data);
            }
        } catch (e) {
            console.warn('Failed to load full JD, using list data:', e);
        }
        bodyEl.innerHTML = '';
    }

    // Overview / Description
    if (item.overview || item.description) {
        const section = createModalSection('Overview', item.overview || item.description);
        bodyEl.appendChild(section);
    }

    if (type === 'ofqual') {
        // IDs and metadata: ofqual_id, unit_id, nos_id, sector_subject_area, qualification_type, glh, assessment_criteria
        const metaLines = [];
        if (item.ofqual_id) metaLines.push(`OFQUAL ID: ${item.ofqual_id}`);
        if (item.unit_id) metaLines.push(`Unit ID: ${item.unit_id}`);
        if (item.nos_id) metaLines.push(`Linked NOS: ${item.nos_id}${item.nos_title ? ' — ' + item.nos_title : ''}`);
        if (item.sector_subject_area) metaLines.push(`Sector: ${item.sector_subject_area}`);
        if (item.qualification_type) metaLines.push(`Qualification type: ${item.qualification_type}`);
        if (item.glh != null && item.glh !== '') metaLines.push(`Guided Learning Hours: ${Number(item.glh)}`);

        if (metaLines.length > 0) {
            const metaSection = document.createElement('div');
            metaSection.className = 'ls-modal-section';
            const metaTitle = document.createElement('div');
            metaTitle.className = 'ls-modal-section-title';
            metaTitle.textContent = 'Metadata';
            metaSection.appendChild(metaTitle);
            metaLines.forEach(line => {
                const p = document.createElement('p');
                p.style.cssText = 'color: #b8c5d6; font-size: 13px; margin: 4px 0;';
                p.textContent = line;
                metaSection.appendChild(p);
            });
            bodyEl.appendChild(metaSection);
        }

        // Learning Objective (always show for OFQUAL; support multi-line as numbered list)
        const loObjRaw = (item.learning_objective != null && typeof item.learning_objective === 'string') ? item.learning_objective.trim() : '';
        if (loObjRaw) {
            const loObjLines = parseListLikeText(loObjRaw);
            if (loObjLines.length > 1) {
                bodyEl.appendChild(createModalListSection('Learning Objective', loObjLines, ''));
            } else {
                bodyEl.appendChild(createModalSection('Learning Objective', loObjRaw));
            }
        } else {
            bodyEl.appendChild(createModalSection('Learning Objective', 'Not provided'));
        }

        // Learning Outcomes
        if (item.learning_outcomes.length > 0) {
            const loSection = document.createElement('div');
            loSection.className = 'ls-modal-section';
            const loTitle = document.createElement('div');
            loTitle.className = 'ls-modal-section-title';
            loTitle.textContent = `Learning Outcomes (${item.learning_outcomes.length})`;
            loSection.appendChild(loTitle);

            const loList = document.createElement('ul');
            loList.className = 'ls-lo-list';
            item.learning_outcomes.forEach((lo, i) => {
                const li = document.createElement('li');
                li.className = 'ls-lo-item';
                li.innerHTML = `<strong>LO${i + 1}:</strong> ${escapeHTML(lo)}`;
                loList.appendChild(li);
            });
            loSection.appendChild(loList);
            bodyEl.appendChild(loSection);
        }

        // Assessment Criteria
        if (item.assessment_criteria.length > 0) {
            const acSection = document.createElement('div');
            acSection.className = 'ls-modal-section';
            const acTitle = document.createElement('div');
            acTitle.className = 'ls-modal-section-title';
            acTitle.textContent = `Assessment Criteria (${item.assessment_criteria.length})`;
            acSection.appendChild(acTitle);

            const acList = document.createElement('ul');
            acList.className = 'ls-ac-list';
            item.assessment_criteria.forEach((ac, i) => {
                const li = document.createElement('li');
                li.className = 'ls-ac-item';
                li.innerHTML = `<strong>AC${i + 1}:</strong> ${escapeHTML(ac)}`;
                acList.appendChild(li);
            });
            acSection.appendChild(acList);
            bodyEl.appendChild(acSection);
        }

    } else if (type === 'nos') {
        if (item.knowledge_understanding.length > 0) {
            const kuSection = createModalListSection('Knowledge & Understanding', item.knowledge_understanding, 'K');
            bodyEl.appendChild(kuSection);
        }
        if (item.performance_criteria.length > 0) {
            const pcSection = createModalListSection('Performance Criteria', item.performance_criteria, 'PC');
            bodyEl.appendChild(pcSection);
        }
        if (item.relevant_roles && item.relevant_roles.length > 0) {
            const rolesSection = createModalSection('Relevant Roles', item.relevant_roles.join(', '));
            bodyEl.appendChild(rolesSection);
        }

    } else if (type === 'jd') {
        if (item.role_overview && item.role_overview.trim()) {
            bodyEl.appendChild(createModalSection('Role Overview', item.role_overview));
        }
        if (item.role_purpose && item.role_purpose.trim()) {
            bodyEl.appendChild(createModalSection('Role Purpose', item.role_purpose));
        }
        if (item.key_responsibilities && item.key_responsibilities.trim()) {
            const text = item.key_responsibilities.trim();
            const list = parseListLikeText(text);
            if (list.length > 0) {
                bodyEl.appendChild(createModalListSection('Key Responsibilities', list, ''));
            } else {
                bodyEl.appendChild(createModalSection('Key Responsibilities', text));
            }
        }
        if (item.aligned_qualifications && item.aligned_qualifications.trim()) {
            const text = item.aligned_qualifications.trim();
            const list = parseListLikeText(text);
            if (list.length > 0) {
                bodyEl.appendChild(createModalListSection('Aligned Qualifications', list, ''));
            } else {
                bodyEl.appendChild(createModalSection('Aligned Qualifications', text));
            }
        }
        const metaLines = [];
        if (item.department) metaLines.push(`Department: ${item.department}`);
        if (item.industry) metaLines.push(`Industry: ${item.industry}`);
        if (item.experience_band) metaLines.push(`Experience Band: ${item.experience_band}`);
        if (item.ofqual_level_alignment) metaLines.push(`OFQUAL Level: ${item.ofqual_level_alignment}`);

        if (metaLines.length > 0) {
            const metaSection = document.createElement('div');
            metaSection.className = 'ls-modal-section';
            const metaTitle = document.createElement('div');
            metaTitle.className = 'ls-modal-section-title';
            metaTitle.textContent = 'Details';
            metaSection.appendChild(metaTitle);
            metaLines.forEach(line => {
                const p = document.createElement('p');
                p.style.cssText = 'color: #b8c5d6; font-size: 13px; margin: 4px 0;';
                p.textContent = line;
                metaSection.appendChild(p);
            });
            bodyEl.appendChild(metaSection);
        }

        const skills = parseSkillsForDisplay(item.functional_skills, item.soft_skills);
        if (skills.length > 0) {
            const section = document.createElement('div');
            section.className = 'ls-modal-section';
            const titleEl = document.createElement('div');
            titleEl.className = 'ls-modal-section-title';
            titleEl.textContent = 'Key Skills';
            section.appendChild(titleEl);
            const tagContainer = document.createElement('div');
            tagContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;';
            skills.forEach(s => {
                const span = document.createElement('span');
                span.style.cssText = 'background: rgba(0,217,192,0.15); color: #00d9c0; font-size: 12px; padding: 4px 10px; border-radius: 6px;';
                span.textContent = s;
                tagContainer.appendChild(span);
            });
            section.appendChild(tagContainer);
            bodyEl.appendChild(section);
        }
    }

    modal.classList.add('open');
}

/**
 * Parse text that may be newline- or bullet-separated list into array of items.
 */
function parseListLikeText(text) {
    if (!text || typeof text !== 'string') return [];
    return text.split(/\n|•|▪|–|-/).map(s => s.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
}

/**
 * Parse functional_skills and soft_skills (JSON array or plain text) into array of skill strings.
 */
function parseSkillsForDisplay(functionalSkills, softSkills) {
    const out = [];
    function add(val) {
        if (!val) return;
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) parsed.forEach(s => { if (s && typeof s === 'string') out.push(s); });
                else if (typeof parsed === 'object') Object.values(parsed).forEach(add);
                else out.push(val.trim());
            } catch (_) {
                val.split(/[,;\n]/).forEach(s => { if (s.trim()) out.push(s.trim()); });
            }
        } else if (Array.isArray(val)) val.forEach(add);
        else if (val && typeof val === 'object') Object.values(val).forEach(add);
    }
    add(functionalSkills);
    add(softSkills);
    return [...new Set(out)].slice(0, 50);
}

/**
 * Create a simple text section for the modal.
 */
function createModalSection(title, text) {
    const section = document.createElement('div');
    section.className = 'ls-modal-section';
    const titleEl = document.createElement('div');
    titleEl.className = 'ls-modal-section-title';
    titleEl.textContent = title;
    section.appendChild(titleEl);
    const p = document.createElement('p');
    p.style.cssText = 'color: #b8c5d6; font-size: 13px; line-height: 1.6;';
    p.textContent = text;
    section.appendChild(p);
    return section;
}

/**
 * Create a list section for the modal.
 */
function createModalListSection(title, items, prefix) {
    const section = document.createElement('div');
    section.className = 'ls-modal-section';
    const titleEl = document.createElement('div');
    titleEl.className = 'ls-modal-section-title';
    titleEl.textContent = `${title} (${items.length})`;
    section.appendChild(titleEl);

    const list = document.createElement('ul');
    list.className = 'ls-lo-list';
    items.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'ls-lo-item';
        li.innerHTML = `<strong>${prefix}${i + 1}:</strong> ${escapeHTML(item)}`;
        list.appendChild(li);
    });
    section.appendChild(list);
    return section;
}

/**
 * Close the detail modal.
 */
function closeLSDetailModal() {
    const modal = document.getElementById('ls-detail-modal');
    if (modal) modal.classList.remove('open');
}

/**
 * Show loading state in results container.
 */
function showLSLoading() {
    const container = document.getElementById('ls-results-container');
    const header = document.getElementById('ls-results-header');
    if (header) header.style.display = 'none';
    if (container) {
        container.innerHTML = '<div class="ls-loading"><div class="ls-spinner"></div>Searching the database...</div>';
    }
}

/**
 * Show empty state with custom message.
 */
function showLSEmpty(message) {
    const container = document.getElementById('ls-results-container');
    const header = document.getElementById('ls-results-header');
    if (header) header.style.display = 'none';
    if (container) {
        container.innerHTML = `
            <div class="ls-empty-state">
                <div class="ls-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div class="ls-empty-title">No results</div>
                <div class="ls-empty-text">${escapeHTML(message)}</div>
            </div>
        `;
    }
}


// ========================================
// LEARNING SPECIFICATIONS PAGE
// ========================================

const lsData = [
    {
        title: "BTEC Level 3 National Diploma in Computing",
        body: "OFQUAL",
        level: "L
        evel 3",
        sector: "Technology",
        type: "BTEC",
        country: "uk",
        language: "en",
        status: "Published",
        lastModified: "2 weeks ago",
        version: "v2.1",
        linkedJDs: 5,
        enrolled: 0,
        inProgress: 0,
        completed: 0,
        overview: "Comprehensive computing qualification covering systems and services, digital networks, and software development. Designed to develop knowledge and practical skills in contemporary computing.",
        units: ["Systems and Services", "Digital Networks", "IT Security for Users", "Software Development"]
    },
    {
        title: "NVQ Level 2 in Health and Social Care",
        body: "NOS",
        level: "Level 2",
        sector: "Health & Social Care",
        type: "NVQ",
        country: "uk",
        language: "en",
        status: "Published",
        lastModified: "1 month ago",
        version: "v1.8",
        linkedJDs: 3,
        enrolled: 0,
        inProgress: 0,
        completed: 0,
        overview: "Work-based qualification in health and social care settings. Develops practical competences in care provision, communication, and safeguarding.",
        units: ["Care values and person-centred practice", "Effective communication", "Health, safety and security"]
    },
    {
        title: "CMI Level 5 Management and Leadership",
        body: "OFQUAL",
        level: "Level 5",
        sector: "Management",
        type: "Professional",
        country: "uk",
        language: "en",
        status: "Published",
        lastModified: "3 days ago",
        version: "v3.2",
        linkedJDs: 7,
        enrolled: 0,
        inProgress: 0,
        completed: 0,
        overview: "Specialist management and leadership qualification. Covers strategic thinking, managing teams, and organisational change.",
        units: ["Managing people and performance", "Strategic management", "Organisational change"]
    },
    {
        title: "City & Guilds Level 3 Electrotechnical",
        body: "NOS",
        level: "Level 3",
        sector: "Construction & Engineering",
        type: "City & Guilds",
        country: "uk",
        language: "en",
        status: "Draft",
        lastModified: "1 week ago",
        version: "v1.5",
        linkedJDs: 4,
        enrolled: 0,
        inProgress: 0,
        completed: 0,
        overview: "Practical electrotechnical qualification covering installation, testing, and maintenance of electrical systems.",
        units: ["Electrical installation", "Testing and commissioning", "Health and safety"]
    },
    {
        title: "AAT Level 4 Professional Diploma in Accounting",
        body: "OFQUAL",
        level: "Level 4",
        sector: "Finance",
        type: "Professional",
        country: "uk",
        language: "en",
        status: "Published",
        lastModified: "2 days ago",
        version: "v2.3",
        linkedJDs: 6,
        enrolled: 0,
        inProgress: 0,
        completed: 0,
        overview: "Advanced accounting qualification covering financial reporting, management accounting, and audit principles.",
        units: ["Financial statements", "Management accounting", "Audit and assurance"]
    },
    {
        title: "CIPD Level 5 Associate Diploma in People Management",
        body: "OFQUAL",
        level: "Level 5",
        sector: "Human Resources",
        type: "Professional",
        country: "uk",
        language: "en",
        status: "Published",
        lastModified: "5 days ago",
        version: "v2.0",
        linkedJDs: 8,
        enrolled: 0,
        inProgress: 0,
        completed: 0,
        overview: "Professional HR qualification covering people strategy, employee relations, and talent management.",
        units: ["People resourcing and talent planning", "Employee relations", "Learning and development"]
    }
];

/**
 * Load real Learning Specs data from UAT API.
 * Falls back to demo data if API fails.
 */
async function loadRealLSData() {
    try {
        // Search for a broad set of qualifications
        const data = await searchLearningSpecs('qualification', {});
        if (data && (data.ofqual.length > 0 || data.nos.length > 0 || data.job_descriptions.length > 0)) {
            // Convert API results to card format
            const cards = [];
            data.ofqual.forEach(item => {
                cards.push({
                    title: item.title || 'Untitled',
                    body: 'OFQUAL',
                    level: item.level ? 'Level ' + item.level : '',
                    sector: item.sector_subject_area || '',
                    type: item.qualification_type || 'Qualification',
                    country: 'uk',
                    language: 'en',
                    status: 'Published',
                    lastModified: 'From UAT',
                    version: '',
                    linkedJDs: 0,
                    enrolled: 0,
                    inProgress: 0,
                    completed: 0,
                    overview: item.description || item.overview || '',
                    units: item.learning_outcomes || [],
                    _source: 'api',
                    _raw: item
                });
            });
            data.nos.forEach(item => {
                cards.push({
                    title: item.title || 'Untitled',
                    body: 'NOS',
                    level: item.qualification_level || '',
                    sector: item.industry || '',
                    type: 'NOS Standard',
                    country: 'uk',
                    language: 'en',
                    status: 'Published',
                    lastModified: 'From UAT',
                    version: '',
                    linkedJDs: 0,
                    enrolled: 0,
                    inProgress: 0,
                    completed: 0,
                    overview: item.description || item.overview || '',
                    units: item.performance_criteria || [],
                    _source: 'api',
                    _raw: item
                });
            });
            if (cards.length > 0) {
                lsDataCache.apiCards = cards;
                lsDataCache.currentData = cards;
                renderLSCards(cards);
            }
        }
    } catch (err) {
        console.warn('Could not load real LS data from UAT, using demo data:', err.message);
        // Demo data already rendered, no action needed
    }
}

function renderLSCards(data) {
    const grid = document.getElementById('ls-results-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Store current data for search re-filtering
    lsDataCache.currentData = data;

    // Sort based on selected option
    const sortMode = lsDataCache.currentSort || 'popular';
    const sortedData = [...data].sort((a, b) => {
        if (sortMode === 'popular') {
            const totalA = (a.enrolled || 0) + (a.inProgress || 0) + (a.completed || 0);
            const totalB = (b.enrolled || 0) + (b.inProgress || 0) + (b.completed || 0);
            return totalB - totalA;
        } else if (sortMode === 'recent') {
            // Parse "X days ago" format — for demo, just compare title length or use fixed order
            return 0; // Keep original order for "recently updated"
        } else if (sortMode === 'alpha') {
            return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
    });

    sortedData.forEach((ls, index) => {
        const card = document.createElement('div');
        card.className = 'ls-card';

        // Build popularity bar HTML — real data requires API ticket ZAV-API-001
        let popHTML = '';
        const isApiData = ls._source === 'api';
        if (!isApiData) {
            popHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 12px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 8px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style="color: #fbbf24; font-size: 11px; font-weight: 500;">Usage Analytics — Coming Soon</span>
                    <span style="color: #6b7c93; font-size: 11px; margin-left: auto;">Enrolled / In Progress / Completed</span>
                </div>
            `;
        } else {
            popHTML = `
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 12px;">
                    <span style="background: rgba(0,217,192,0.15); color: #00d9c0; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">LIVE</span>
                    <span style="color: #6b7c93; font-size: 11px;">From UAT Neo4j</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="ls-card-header">
                <div>
                    <div class="ls-card-title">${escapeHTML(ls.title)}</div>
                    <div class="ls-card-org">${escapeHTML(ls.body)}</div>
                </div>
            </div>
            <div class="ls-card-tags">
                <span class="ls-tag">${escapeHTML(ls.level)}</span>
                <span class="ls-tag">${escapeHTML(ls.sector)}</span>
            </div>
            ${popHTML}
            <div class="ls-card-meta">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    ${ls.linkedJDs} Linked JDs
                </span>
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${escapeHTML(ls.lastModified)}
                </span>
            </div>
        `;
        grid.appendChild(card);
    });

    var resultCount = document.getElementById('ls-results-count');
    if (resultCount) resultCount.textContent = data.length + ' results';
}

