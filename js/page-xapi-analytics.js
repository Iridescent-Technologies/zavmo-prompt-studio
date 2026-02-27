// ================================================================
// xAPI ANALYTICS PAGE
// Real-time learning analytics dashboard
// ================================================================

const XA_API_BASE = ZAVMO_BASE_URL + '/api/xapi';
let xaInitialised = false;
let xaFeedPaused = false;
let xaFeedInterval = null;
let xaCurrentPeriod = 'today';
let xaSelectedAgentsForCompare = [];
let xaSavedTemplates = [];
let xaBuilderBloom = '';
let xaBuilderKirk = '';
let xaBuilderWonders = [];

// Character data for agent performance
const XA_CHARACTERS = [
    { id: 'foundation-builder', name: 'Foundation Builder', icon: 'FB', role: 'Foundational knowledge and recall' },
    { id: 'challenge-coach', name: 'Challenge Coach', icon: 'CC', role: 'Pushing boundaries and resilience' },
    { id: 'career-navigator', name: 'Career Navigator', icon: 'CN', role: 'Career guidance and pathways' },
    { id: 'pattern-connector', name: 'Pattern Connector', icon: 'PC', role: 'Cross-domain pattern recognition' },
    { id: 'systems-analyst', name: 'Systems Analyst', icon: 'SA', role: 'Systematic analysis and evaluation' },
    { id: 'collaboration-guide', name: 'Collaboration Guide', icon: 'CG', role: 'Team learning and collaboration' },
    { id: 'evidence-evaluator', name: 'Evidence Evaluator', icon: 'EE', role: 'Critical thinking and evidence' },
    { id: 'experiment-space', name: 'Experiment Space', icon: 'ES', role: 'Hands-on experimentation' },
    { id: 'practical-builder', name: 'Practical Builder', icon: 'PB', role: 'Practical application and building' },
    { id: 'creative-catalyst', name: 'Creative Catalyst', icon: 'CT', role: 'Creative thinking and innovation' },
    { id: 'qualification-certifier', name: 'Qualification Certifier', icon: 'QC', role: 'Assessment and certification' },
    { id: 'integrator', name: 'Integrator', icon: 'IN', role: 'Knowledge integration and synthesis' }
];

// Bloom's taxonomy levels
const XA_BLOOMS = [
    { id: 'remember', label: 'Remember', colour: '#4a5568' },
    { id: 'understand', label: 'Understand', colour: '#2d7d9a' },
    { id: 'apply', label: 'Apply', colour: '#00d9c0' },
    { id: 'analyse', label: 'Analyse', colour: '#00b4d8' },
    { id: 'evaluate', label: 'Evaluate', colour: '#0077b6' },
    { id: 'create', label: 'Create', colour: '#6c63ff' }
];

// xAPI Verb library — comprehensive catalogue
const XA_VERB_LIBRARY = [
    { verb: 'experienced', iri: 'https://zavmo.co.uk/xapi/verbs/experienced', bloom: 'remember', description: 'Learner encountered or was exposed to content', agents: ['foundation-builder'], status: 'active', frequency: 0 },
    { verb: 'understood', iri: 'https://zavmo.co.uk/xapi/verbs/understood', bloom: 'understand', description: 'Learner demonstrated comprehension of a concept', agents: ['foundation-builder', 'pattern-connector'], status: 'active', frequency: 0 },
    { verb: 'applied', iri: 'https://zavmo.co.uk/xapi/verbs/applied', bloom: 'apply', description: 'Learner used knowledge in a practical context', agents: ['practical-builder', 'experiment-space'], status: 'active', frequency: 0 },
    { verb: 'analysed', iri: 'https://zavmo.co.uk/xapi/verbs/analysed', bloom: 'analyse', description: 'Learner broke down complex information into components', agents: ['systems-analyst', 'evidence-evaluator'], status: 'active', frequency: 0 },
    { verb: 'evaluated', iri: 'https://zavmo.co.uk/xapi/verbs/evaluated', bloom: 'evaluate', description: 'Learner made judgements based on criteria and evidence', agents: ['evidence-evaluator', 'qualification-certifier'], status: 'active', frequency: 0 },
    { verb: 'created', iri: 'https://zavmo.co.uk/xapi/verbs/created', bloom: 'create', description: 'Learner produced original work or synthesis', agents: ['creative-catalyst', 'integrator'], status: 'active', frequency: 0 },
    { verb: 'planned', iri: 'https://zavmo.co.uk/xapi/verbs/planned', bloom: 'create', description: 'Learner designed a strategy or approach', agents: ['career-navigator', 'systems-analyst'], status: 'active', frequency: 0 },
    { verb: 'experimented', iri: 'https://zavmo.co.uk/xapi/verbs/experimented', bloom: 'apply', description: 'Learner tested ideas through hands-on exploration', agents: ['experiment-space'], status: 'active', frequency: 0 },
    { verb: 'connected', iri: 'https://zavmo.co.uk/xapi/verbs/connected', bloom: 'analyse', description: 'Learner identified relationships between concepts', agents: ['pattern-connector', 'integrator'], status: 'active', frequency: 0 },
    { verb: 'recognised', iri: 'https://zavmo.co.uk/xapi/verbs/recognised', bloom: 'remember', description: 'Learner identified or recalled previously learned content', agents: ['foundation-builder'], status: 'active', frequency: 0 },
    { verb: 'demonstrated', iri: 'https://zavmo.co.uk/xapi/verbs/demonstrated', bloom: 'apply', description: 'Learner showed competence through performance', agents: ['practical-builder', 'qualification-certifier'], status: 'active', frequency: 0 },
    { verb: 'built', iri: 'https://zavmo.co.uk/xapi/verbs/built', bloom: 'create', description: 'Learner constructed a tangible output or artefact', agents: ['practical-builder', 'creative-catalyst'], status: 'active', frequency: 0 },
    { verb: 'collaborated', iri: 'https://zavmo.co.uk/xapi/verbs/collaborated', bloom: 'apply', description: 'Learner worked with peers to achieve a shared goal', agents: ['collaboration-guide'], status: 'active', frequency: 0 },
    { verb: 'facilitated', iri: 'https://zavmo.co.uk/xapi/verbs/facilitated', bloom: 'evaluate', description: 'Learner guided or supported others in their learning', agents: ['collaboration-guide'], status: 'active', frequency: 0 },
    { verb: 'innovated', iri: 'https://zavmo.co.uk/xapi/verbs/innovated', bloom: 'create', description: 'Learner introduced novel ideas or approaches', agents: ['creative-catalyst'], status: 'active', frequency: 0 },
    { verb: 'transformed', iri: 'https://zavmo.co.uk/xapi/verbs/transformed', bloom: 'create', description: 'Learner fundamentally changed their approach or understanding', agents: ['integrator'], status: 'active', frequency: 0 },
    { verb: 'synthesised', iri: 'https://zavmo.co.uk/xapi/verbs/synthesised', bloom: 'create', description: 'Learner combined multiple sources into a coherent whole', agents: ['integrator', 'pattern-connector'], status: 'active', frequency: 0 },
    { verb: 'integrated', iri: 'https://zavmo.co.uk/xapi/verbs/integrated', bloom: 'evaluate', description: 'Learner merged knowledge from different domains', agents: ['integrator'], status: 'active', frequency: 0 },
    { verb: 'monitored', iri: 'https://zavmo.co.uk/xapi/verbs/monitored', bloom: 'evaluate', description: 'Learner tracked their own progress or performance', agents: ['systems-analyst'], status: 'active', frequency: 0 },
    { verb: 'orchestrated', iri: 'https://zavmo.co.uk/xapi/verbs/orchestrated', bloom: 'create', description: 'Learner coordinated complex multi-step learning activities', agents: ['systems-analyst', 'collaboration-guide'], status: 'active', frequency: 0 },
    { verb: 'assessed', iri: 'https://zavmo.co.uk/xapi/verbs/assessed', bloom: 'evaluate', description: 'Learner completed a formal or informal assessment', agents: ['qualification-certifier'], status: 'active', frequency: 0 },
    { verb: 'certified', iri: 'https://zavmo.co.uk/xapi/verbs/certified', bloom: 'evaluate', description: 'Learner achieved a certification or qualification milestone', agents: ['qualification-certifier'], status: 'active', frequency: 0 },
    { verb: 'completed', iri: 'http://adlnet.gov/expapi/verbs/completed', bloom: 'apply', description: 'Learner finished a course, module, or learning activity', agents: ['all'], status: 'active', frequency: 0 },
    { verb: 'systematised', iri: 'https://zavmo.co.uk/xapi/verbs/systematised', bloom: 'analyse', description: 'Learner organised information into a structured framework', agents: ['systems-analyst'], status: 'active', frequency: 0 },
    { verb: 'attempted', iri: 'http://adlnet.gov/expapi/verbs/attempted', bloom: 'remember', description: 'Learner started but may not have completed an activity', agents: ['all'], status: 'active', frequency: 0 },
    { verb: 'passed', iri: 'http://adlnet.gov/expapi/verbs/passed', bloom: 'apply', description: 'Learner met the pass threshold for an assessment', agents: ['qualification-certifier'], status: 'active', frequency: 0 },
    { verb: 'failed', iri: 'http://adlnet.gov/expapi/verbs/failed', bloom: 'apply', description: 'Learner did not meet the pass threshold (opportunity for growth)', agents: ['qualification-certifier', 'challenge-coach'], status: 'active', frequency: 0 },
    { verb: 'reflected', iri: 'https://zavmo.co.uk/xapi/verbs/reflected', bloom: 'evaluate', description: 'Learner engaged in metacognitive reflection on their learning', agents: ['career-navigator', 'challenge-coach'], status: 'active', frequency: 0 },
    { verb: 'persevered', iri: 'https://zavmo.co.uk/xapi/verbs/persevered', bloom: 'apply', description: 'Learner continued despite difficulty — growth mindset indicator', agents: ['challenge-coach'], status: 'active', frequency: 0 },
    { verb: 'questioned', iri: 'https://zavmo.co.uk/xapi/verbs/questioned', bloom: 'analyse', description: 'Learner asked a meaningful question to deepen understanding', agents: ['all'], status: 'active', frequency: 0 }
];

/**
 * Initialise the xAPI Analytics page.
 * Called when the tab is first activated.
 */
function initXapiAnalyticsPage() {
    if (xaInitialised) return;
    xaInitialised = true;

    // Sub-tab navigation
    const tabBtns = document.querySelectorAll('.xa-tab-btn[data-xa-tab]');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-xa-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.xa-tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(tabId);
            if (target) target.classList.add('active');
        });
    });

    // Time range selector
    const timeBtns = document.querySelectorAll('#xa-time-range .xa-time-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            xaCurrentPeriod = this.getAttribute('data-period');
            xaLoadOverviewData();
        });
    });

    // Load initial data
    xaLoadOverviewData();
    xaLoadLiveFeed();
    xaRenderStatementLibrary();
    xaInitBuilder();
    xaLoadAgentPerformance();

    // Live feed controls
    const pauseBtn = document.getElementById('xa-feed-pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            xaFeedPaused = !xaFeedPaused;
            this.innerHTML = xaFeedPaused
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume'
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause';
            this.classList.toggle('active', xaFeedPaused);
        });
    }

    // Export CSV
    const exportBtn = document.getElementById('xa-feed-export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', xaExportFeedCSV);
    }

    // Feed filters
    const feedSearch = document.getElementById('xa-feed-search');
    if (feedSearch) {
        feedSearch.addEventListener('input', xaFilterFeed);
    }
    const verbFilter = document.getElementById('xa-feed-verb-filter');
    if (verbFilter) {
        verbFilter.addEventListener('change', xaFilterFeed);
    }
    const agentFilter = document.getElementById('xa-feed-agent-filter');
    if (agentFilter) {
        // Populate agent filter dropdown
        XA_CHARACTERS.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            agentFilter.appendChild(opt);
        });
        agentFilter.addEventListener('change', xaFilterFeed);
    }

    // Statement library filters
    const libSearch = document.getElementById('xa-lib-search');
    if (libSearch) libSearch.addEventListener('input', xaFilterLibrary);
    const libBloomFilter = document.getElementById('xa-lib-bloom-filter');
    if (libBloomFilter) libBloomFilter.addEventListener('change', xaFilterLibrary);
    const libStatusFilter = document.getElementById('xa-lib-status-filter');
    if (libStatusFilter) libStatusFilter.addEventListener('change', xaFilterLibrary);

    // Library export
    const libExportBtn = document.getElementById('xa-lib-export-btn');
    if (libExportBtn) {
        libExportBtn.addEventListener('click', xaExportLibraryJSON);
    }

    // Learner search
    const learnerSearchBtn = document.getElementById('xa-learner-search-btn');
    if (learnerSearchBtn) {
        learnerSearchBtn.addEventListener('click', xaSearchLearner);
    }
    const learnerSearchInput = document.getElementById('xa-learner-search-input');
    if (learnerSearchInput) {
        learnerSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') xaSearchLearner();
        });
    }

    // Agent view modes
    const gridViewBtn = document.getElementById('xa-agent-view-grid');
    const compareViewBtn = document.getElementById('xa-agent-view-compare');
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.add('active');
            if (compareViewBtn) compareViewBtn.classList.remove('active');
            const comparePanel = document.getElementById('xa-agent-compare-panel');
            if (comparePanel) comparePanel.style.display = 'none';
            xaSelectedAgentsForCompare = [];
            document.querySelectorAll('.xa-compare-cb').forEach(cb => { cb.checked = false; });
        });
    }
    if (compareViewBtn) {
        compareViewBtn.addEventListener('click', function() {
            compareViewBtn.classList.add('active');
            if (gridViewBtn) gridViewBtn.classList.remove('active');
            const comparePanel = document.getElementById('xa-agent-compare-panel');
            if (comparePanel) comparePanel.style.display = 'block';
        });
    }

    // Load saved templates from localStorage
    try {
        const saved = localStorage.getItem('zavmo_xa_templates');
        if (saved) xaSavedTemplates = JSON.parse(saved);
    } catch (e) { /* ignore */ }

    // Start auto-refresh for live feed (every 5 seconds)
    xaFeedInterval = setInterval(function() {
        if (!xaFeedPaused) {
            xaAddNewStatementToFeed();
        }
    }, 5000);
}

// ---------------------------------------------------------------
// OVERVIEW DASHBOARD
// ---------------------------------------------------------------

/**
 * Load and render all overview dashboard data.
 * Attempts live API first, falls back to demonstration data.
 */
async function xaLoadOverviewData() {
    try {
        const response = await zavmoFetch(XA_API_BASE + '/stats/overview?period=' + xaCurrentPeriod);
        const data = await response.json();
        if (data && data.status === 'success' && data.data) {
            xaRenderOverviewKPIs(data.data);
            return;
        }
    } catch (err) {
        // Backend not yet available — use demonstration data
    }
    xaRenderOverviewWithDemoData();
}

/**
 * Render overview with demonstration data to show the UI.
 */
function xaRenderOverviewWithDemoData() {
    // Generate realistic demo KPI data
    const demoKPIs = {
        activeLearners: { value: 1247, change: 12.3, trend: [980, 1020, 1085, 1130, 1190, 1210, 1247] },
        statementsToday: { value: 8934, change: 8.7, trend: [6200, 7100, 7800, 8200, 8500, 8700, 8934] },
        avgDuration: { value: '24m', change: 5.2, trend: [18, 19, 21, 22, 23, 23, 24] },
        completions: { value: 342, change: 15.1, trend: [220, 250, 270, 290, 310, 325, 342] },
        growthMindset: { value: '78%', change: 3.4, trend: [68, 70, 72, 74, 75, 76, 78] },
        interactions: { value: 15623, change: 10.8, trend: [11000, 12200, 13100, 13800, 14500, 15100, 15623] }
    };

    // KPI cards
    xaSetKPI('xa-kpi-learners', demoKPIs.activeLearners.value.toLocaleString(), demoKPIs.activeLearners.change, demoKPIs.activeLearners.trend);
    xaSetKPI('xa-kpi-statements', demoKPIs.statementsToday.value.toLocaleString(), demoKPIs.statementsToday.change, demoKPIs.statementsToday.trend);
    xaSetKPI('xa-kpi-duration', demoKPIs.avgDuration.value, demoKPIs.avgDuration.change, demoKPIs.avgDuration.trend);
    xaSetKPI('xa-kpi-completions', demoKPIs.completions.value.toLocaleString(), demoKPIs.completions.change, demoKPIs.completions.trend);
    xaSetKPI('xa-kpi-growth', demoKPIs.growthMindset.value, demoKPIs.growthMindset.change, demoKPIs.growthMindset.trend);
    xaSetKPI('xa-kpi-interactions', demoKPIs.interactions.value.toLocaleString(), demoKPIs.interactions.change, demoKPIs.interactions.trend);

    // Popular courses
    xaRenderPopularCourses([
        { name: 'Leadership Essentials', count: 1240 },
        { name: 'Data Analytics Fundamentals', count: 1085 },
        { name: 'Effective Communication', count: 980 },
        { name: 'Project Management Pro', count: 870 },
        { name: 'Neuroscience of Learning', count: 760 },
        { name: 'Digital Transformation', count: 650 },
        { name: 'Emotional Intelligence', count: 580 },
        { name: 'Agile Methodology', count: 510 },
        { name: 'Critical Thinking', count: 445 },
        { name: 'Creative Problem Solving', count: 390 }
    ]);

    // Keyword cloud
    xaRenderKeywordCloud([
        { word: 'leadership', count: 420 }, { word: 'neuroscience', count: 380 },
        { word: 'collaboration', count: 350 }, { word: 'analytics', count: 310 },
        { word: 'growth mindset', count: 290 }, { word: 'resilience', count: 270 },
        { word: 'innovation', count: 250 }, { word: 'critical thinking', count: 230 },
        { word: 'communication', count: 210 }, { word: 'problem solving', count: 195 },
        { word: 'creativity', count: 180 }, { word: 'adaptability', count: 165 },
        { word: 'emotional intelligence', count: 155 }, { word: 'strategy', count: 140 },
        { word: 'data literacy', count: 130 }, { word: 'teamwork', count: 120 },
        { word: 'decision making', count: 110 }, { word: 'learning design', count: 100 },
        { word: 'wellbeing', count: 95 }, { word: 'metacognition', count: 85 }
    ]);

    // Activity heatmap
    xaRenderHeatmap();

    // Bloom's distribution
    xaRenderBloomsChart([
        { agent: 'Foundation Builder', remember: 35, understand: 30, apply: 20, analyse: 10, evaluate: 3, create: 2 },
        { agent: 'Challenge Coach', remember: 5, understand: 15, apply: 25, analyse: 25, evaluate: 20, create: 10 },
        { agent: 'Career Navigator', remember: 10, understand: 20, apply: 30, analyse: 20, evaluate: 15, create: 5 },
        { agent: 'Pattern Connector', remember: 5, understand: 15, apply: 15, analyse: 35, evaluate: 20, create: 10 },
        { agent: 'Systems Analyst', remember: 5, understand: 10, apply: 15, analyse: 35, evaluate: 25, create: 10 },
        { agent: 'Creative Catalyst', remember: 2, understand: 8, apply: 15, analyse: 15, evaluate: 20, create: 40 }
    ]);

    // Engagement Score Ring (calculated as weighted average)
    var engagementScore = (demoKPIs.completions.value / 500 * 0.4 + demoKPIs.growthMindset.trend[demoKPIs.growthMindset.trend.length - 1] * 0.3 + (demoKPIs.statementsToday.value / 100) * 0.3);
    xaRenderEngagementRing(Math.min(100, engagementScore));

    // Goals and Anomalies
    xaRenderGoals();
    xaRenderAnomalies();
}

/**
 * Render overview KPIs from live data.
 */
function xaRenderOverviewKPIs(data) {
    if (data.activeLearners) xaSetKPI('xa-kpi-learners', data.activeLearners.value, data.activeLearners.change, data.activeLearners.trend);
    if (data.statementsToday) xaSetKPI('xa-kpi-statements', data.statementsToday.value, data.statementsToday.change, data.statementsToday.trend);
    if (data.avgDuration) xaSetKPI('xa-kpi-duration', data.avgDuration.value, data.avgDuration.change, data.avgDuration.trend);
    if (data.completions) xaSetKPI('xa-kpi-completions', data.completions.value, data.completions.change, data.completions.trend);
    if (data.growthMindset) xaSetKPI('xa-kpi-growth', data.growthMindset.value, data.growthMindset.change, data.growthMindset.trend);
    if (data.interactions) xaSetKPI('xa-kpi-interactions', data.interactions.value, data.interactions.change, data.interactions.trend);
}

/**
 * Set a single KPI card with value, change indicator, and sparkline.
 */
function xaSetKPI(id, value, change, trend) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;

    const changeEl = document.getElementById(id + '-change');
    if (changeEl) {
        const isPositive = change >= 0;
        changeEl.className = 'xa-kpi-change ' + (isPositive ? 'positive' : 'negative');
        changeEl.textContent = (isPositive ? '+' : '') + change.toFixed(1) + '% vs last period';
    }

    const sparkEl = document.getElementById(id + '-spark');
    if (sparkEl && trend && trend.length > 1) {
        sparkEl.innerHTML = xaCreateSparkline(trend);
    }
}

/**
 * Create an SVG sparkline from data points.
 */
function xaCreateSparkline(data) {
    const w = 120, h = 32;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);

    let pathD = '';
    let areaD = 'M0,' + h + ' ';
    data.forEach((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        if (i === 0) {
            pathD += 'M' + x + ',' + y;
            areaD += 'L' + x + ',' + y;
        } else {
            pathD += ' L' + x + ',' + y;
            areaD += ' L' + x + ',' + y;
        }
    });
    areaD += ' L' + (w) + ',' + h + ' Z';

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><path class="spark-fill" d="' + areaD + '"/><path d="' + pathD + '"/></svg>';
}

/**
 * Render popular courses bar chart.
 */
function xaRenderPopularCourses(courses) {
    const container = document.getElementById('xa-popular-courses');
    if (!container) return;
    const maxCount = courses.length > 0 ? courses[0].count : 1;
    let html = '';
    courses.forEach(c => {
        const pct = (c.count / maxCount * 100).toFixed(0);
        html += '<div class="xa-bar-row">' +
            '<span class="xa-bar-label" title="' + xaEscapeAttr(c.name) + '">' + xaEscapeHTML(c.name) + '</span>' +
            '<div class="xa-bar-track"><div class="xa-bar-fill" style="width: ' + pct + '%"><span class="xa-bar-value">' + c.count.toLocaleString() + '</span></div></div>' +
            '</div>';
    });
    container.innerHTML = html;
}

/**
 * Render keyword cloud.
 */
function xaRenderKeywordCloud(keywords) {
    const container = document.getElementById('xa-keyword-cloud');
    if (!container) return;
    const maxCount = keywords.length > 0 ? keywords[0].count : 1;
    // Shuffle for visual variety
    const shuffled = [...keywords].sort(() => Math.random() - 0.5);
    let html = '';
    shuffled.forEach(k => {
        const ratio = k.count / maxCount;
        let sizeClass = 'size-1';
        if (ratio > 0.8) sizeClass = 'size-5';
        else if (ratio > 0.6) sizeClass = 'size-4';
        else if (ratio > 0.4) sizeClass = 'size-3';
        else if (ratio > 0.2) sizeClass = 'size-2';
        html += '<span class="xa-keyword ' + sizeClass + '" title="' + k.count + ' mentions">' + xaEscapeHTML(k.word) + '</span>';
    });
    container.innerHTML = html;
}

/**
 * Render activity heatmap (7 days x 24 hours).
 */
function xaRenderHeatmap() {
    const container = document.getElementById('xa-heatmap-container');
    if (!container) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let html = '<div class="xa-heatmap">';

    // Header row with hours
    html += '<div class="xa-heatmap-label"></div>';
    for (let h = 0; h < 24; h++) {
        if (h % 3 === 0) {
            html += '<div class="xa-heatmap-label" style="justify-content: center; font-size: 9px;">' + (h < 10 ? '0' : '') + h + '</div>';
        } else {
            html += '<div></div>';
        }
    }

    // Data rows
    days.forEach(day => {
        html += '<div class="xa-heatmap-label">' + day + '</div>';
        for (let h = 0; h < 24; h++) {
            // Generate realistic activity patterns (higher during work hours)
            let intensity = Math.random();
            if (h >= 9 && h <= 17) intensity = 0.3 + Math.random() * 0.7;
            else if (h >= 7 && h <= 20) intensity = 0.1 + Math.random() * 0.4;
            else intensity = Math.random() * 0.15;
            if (day === 'Sat' || day === 'Sun') intensity *= 0.4;

            let level = '';
            if (intensity > 0.8) level = 'l5';
            else if (intensity > 0.6) level = 'l4';
            else if (intensity > 0.4) level = 'l3';
            else if (intensity > 0.2) level = 'l2';
            else if (intensity > 0.05) level = 'l1';

            const count = Math.round(intensity * 150);
            html += '<div class="xa-heatmap-cell ' + level + '" title="' + day + ' ' + (h < 10 ? '0' : '') + h + ':00 — ' + count + ' statements"></div>';
        }
    });
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render Bloom's taxonomy stacked bar chart.
 */
function xaRenderBloomsChart(agentData) {
    const container = document.getElementById('xa-blooms-chart');
    if (!container) return;

    let html = '';
    agentData.forEach(a => {
        const total = a.remember + a.understand + a.apply + a.analyse + a.evaluate + a.create;
        html += '<div style="margin-bottom: 12px;">' +
            '<div style="color: #b8c5d6; font-size: 12px; margin-bottom: 4px;">' + xaEscapeHTML(a.agent) + '</div>' +
            '<div class="xa-stacked-bar">' +
            '<div class="xa-stacked-segment xa-bloom-1" style="width: ' + (a.remember / total * 100) + '%" title="Remember: ' + a.remember + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-2" style="width: ' + (a.understand / total * 100) + '%" title="Understand: ' + a.understand + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-3" style="width: ' + (a.apply / total * 100) + '%" title="Apply: ' + a.apply + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-4" style="width: ' + (a.analyse / total * 100) + '%" title="Analyse: ' + a.analyse + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-5" style="width: ' + (a.evaluate / total * 100) + '%" title="Evaluate: ' + a.evaluate + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-6" style="width: ' + (a.create / total * 100) + '%" title="Create: ' + a.create + '%"></div>' +
            '</div></div>';
    });

    // Legend
    html += '<div class="xa-bloom-legend">';
    XA_BLOOMS.forEach(b => {
        html += '<div class="xa-bloom-legend-item"><div class="xa-bloom-legend-dot" style="background: ' + b.colour + '"></div>' + b.label + '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
}

// ---------------------------------------------------------------
// LIVE FEED
// ---------------------------------------------------------------

let xaFeedStatements = [];

/**
 * Load initial live feed data.
 */
async function xaLoadLiveFeed() {
    try {
        const response = await zavmoFetch(XA_API_BASE + '/statements?limit=20&since=' + xaGetPeriodStart());
        const data = await response.json();
        if (data && data.status === 'success' && data.data) {
            xaFeedStatements = data.data;
            xaRenderFeed();
            return;
        }
    } catch (err) {
        // Use demo data
    }
    xaFeedStatements = xaGenerateDemoStatements(20);
    xaRenderFeed();
}

/**
 * Generate demonstration xAPI statements.
 */
function xaGenerateDemoStatements(count) {
    const learners = [
        'Sarah Mitchell', 'James Chen', 'Priya Patel', 'David Okonkwo', 'Emma Williams',
        'Mohammed Al-Rashid', 'Lucy Thompson', 'Raj Kumar', 'Hannah Lewis', 'Tomasz Kowalski',
        'Aisha Begum', 'Oliver Hughes', 'Fatima Hassan', 'Ben Taylor', 'Yuki Tanaka',
        'Charlotte Brown', 'Kwame Asante', 'Sophie Martin', 'Daniel Kim', 'Zara Ahmed'
    ];
    const courses = [
        'Leadership Essentials', 'Data Analytics Fundamentals', 'Effective Communication',
        'Project Management Pro', 'Neuroscience of Learning', 'Digital Transformation',
        'Emotional Intelligence', 'Critical Thinking', 'Creative Problem Solving', 'Agile Methodology'
    ];
    const statements = [];

    for (let i = 0; i < count; i++) {
        const verb = XA_VERB_LIBRARY[Math.floor(Math.random() * XA_VERB_LIBRARY.length)];
        const character = XA_CHARACTERS[Math.floor(Math.random() * XA_CHARACTERS.length)];
        const learner = learners[Math.floor(Math.random() * learners.length)];
        const course = courses[Math.floor(Math.random() * courses.length)];
        const time = new Date(Date.now() - Math.random() * 3600000 * 2);
        const score = verb.bloom === 'evaluate' || verb.bloom === 'apply' ? Math.round(60 + Math.random() * 40) : null;

        statements.push({
            id: 'stmt-' + Date.now() + '-' + i,
            actor: { name: learner, mbox: 'mailto:' + learner.toLowerCase().replace(/\s/g, '.') + '@example.com' },
            verb: { id: verb.iri, display: verb.verb },
            object: { name: course, id: 'https://zavmo.co.uk/courses/' + course.toLowerCase().replace(/\s/g, '-') },
            result: score ? { score: { scaled: score / 100, raw: score, max: 100 }, completion: true } : null,
            context: { agent: character.name, agentId: character.id, bloom: verb.bloom },
            timestamp: time.toISOString()
        });
    }

    return statements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Render the live feed statements.
 */
function xaRenderFeed() {
    const container = document.getElementById('xa-feed-container');
    if (!container) return;

    if (xaFeedStatements.length === 0) {
        container.innerHTML = '<div class="xa-empty"><div class="xa-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><ellipse cx="12" cy="5" rx="9" ry="3"/></svg></div><div class="xa-empty-title">No Statements Yet</div><div class="xa-empty-text">xAPI statements will appear here as learners interact with the platform.</div></div>';
        return;
    }

    let html = '';
    xaFeedStatements.forEach(s => {
        const initials = s.actor.name.split(' ').map(n => n[0]).join('');
        const verbClass = 'xa-verb-' + (s.context.bloom || 'remember');
        const timeStr = xaFormatTime(new Date(s.timestamp));
        const resultStr = s.result && s.result.score ? ' — Score: ' + s.result.score.raw + '/' + s.result.score.max : '';

        html += '<div class="xa-statement-card" data-verb="' + xaEscapeAttr(s.context.bloom || '') + '" data-agent="' + xaEscapeAttr(s.context.agentId || '') + '" data-text="' + xaEscapeAttr((s.actor.name + ' ' + s.verb.display + ' ' + s.object.name).toLowerCase()) + '" onclick="this.classList.toggle(\'expanded\')">' +
            '<div class="xa-statement-row">' +
            '<div class="xa-statement-actor"><div class="xa-statement-avatar">' + xaEscapeHTML(initials) + '</div><span class="xa-statement-name">' + xaEscapeHTML(s.actor.name) + '</span></div>' +
            '<span class="xa-statement-verb ' + verbClass + '">' + xaEscapeHTML(s.verb.display) + '</span>' +
            '<span class="xa-statement-object">' + xaEscapeHTML(s.object.name) + resultStr + '</span>' +
            '<div class="xa-statement-meta"><span class="xa-statement-agent">' + xaEscapeHTML(s.context.agent || '') + '</span><span class="xa-statement-time">' + timeStr + '</span></div>' +
            '</div>' +
            '<div class="xa-statement-detail"><div class="xa-statement-json">' + xaEscapeHTML(JSON.stringify(s, null, 2)) + '</div></div>' +
            '</div>';
    });

    container.innerHTML = html;
    // Update feed badge count
    var badge = document.getElementById('xa-feed-badge');
    if (badge) {
        badge.textContent = xaFeedStatements.length;
        badge.classList.remove('pulse');
        void badge.offsetWidth;
        badge.classList.add('pulse');
    }
    // Update summary stats
    xaUpdateFeedSummary();
}

/**
 * Add a new simulated statement to the feed (for demo purposes).
 */
/**
 * Update the live feed summary stats bar.
 */
function xaUpdateFeedSummary() {
    if (xaFeedStatements.length === 0) return;
    var totalEl = document.getElementById('xa-feed-total');
    var learnersEl = document.getElementById('xa-feed-learners');
    var agentsEl = document.getElementById('xa-feed-agents');
    var avgScoreEl = document.getElementById('xa-feed-avg-score');
    var topVerbEl = document.getElementById('xa-feed-top-verb');
    if (totalEl) totalEl.textContent = xaFeedStatements.length;
    var uniqueLearners = {};
    var uniqueAgents = {};
    var verbCounts = {};
    var scoreSum = 0;
    var scoreCount = 0;
    xaFeedStatements.forEach(function(s) {
        if (s.actor && s.actor.name) uniqueLearners[s.actor.name] = true;
        if (s.context && s.context.agent) uniqueAgents[s.context.agent] = true;
        if (s.verb && s.verb.display) {
            verbCounts[s.verb.display] = (verbCounts[s.verb.display] || 0) + 1;
        }
        if (s.result && s.result.score && s.result.score.raw != null) {
            scoreSum += s.result.score.raw;
            scoreCount++;
        }
    });
    if (learnersEl) learnersEl.textContent = Object.keys(uniqueLearners).length;
    if (agentsEl) agentsEl.textContent = Object.keys(uniqueAgents).length;
    if (avgScoreEl) avgScoreEl.textContent = scoreCount > 0 ? Math.round(scoreSum / scoreCount) + '%' : '—';
    var topVerb = '';
    var topCount = 0;
    Object.keys(verbCounts).forEach(function(v) {
        if (verbCounts[v] > topCount) { topCount = verbCounts[v]; topVerb = v; }
    });
    if (topVerbEl) topVerbEl.textContent = topVerb || '—';
}

function xaAddNewStatementToFeed() {
    const newStatements = xaGenerateDemoStatements(1);
    if (newStatements.length > 0) {
        xaFeedStatements.unshift(newStatements[0]);
        if (xaFeedStatements.length > 100) xaFeedStatements.pop();
        xaRenderFeed();
    }
}

/**
 * Filter the live feed based on search and filter inputs.
 */
function xaFilterFeed() {
    const searchVal = (document.getElementById('xa-feed-search') || {}).value || '';
    const verbVal = (document.getElementById('xa-feed-verb-filter') || {}).value || '';
    const agentVal = (document.getElementById('xa-feed-agent-filter') || {}).value || '';

    const cards = document.querySelectorAll('.xa-statement-card');
    cards.forEach(card => {
        let show = true;
        if (searchVal && card.getAttribute('data-text').indexOf(searchVal.toLowerCase()) === -1) show = false;
        if (verbVal && card.getAttribute('data-verb') !== verbVal) show = false;
        if (agentVal && card.getAttribute('data-agent') !== agentVal) show = false;
        card.style.display = show ? '' : 'none';
    });
}

/**
 * Export current feed as CSV.
 */
function xaExportFeedCSV() {
    let csv = 'Timestamp,Learner,Verb,Object,Agent,Bloom Level,Score\n';
    xaFeedStatements.forEach(s => {
        const score = s.result && s.result.score ? s.result.score.raw : '';
        csv += '"' + s.timestamp + '","' + s.actor.name + '","' + s.verb.display + '","' + s.object.name + '","' + (s.context.agent || '') + '","' + (s.context.bloom || '') + '","' + score + '"\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zavmo-xapi-statements-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Statements exported as CSV', 'success');
}

// ---------------------------------------------------------------
// AGENT PERFORMANCE
// ---------------------------------------------------------------

/**
 * Load and render agent performance data.
 */
async function xaLoadAgentPerformance() {
    try {
        const response = await zavmoFetch(XA_API_BASE + '/agents/performance');
        const data = await response.json();
        if (data && data.status === 'success' && data.data) {
            xaRenderAgentGrid(data.data);
            return;
        }
    } catch (err) {
        // Use demo data
    }
    xaRenderAgentGrid(xaGenerateDemoAgentData());
}

/**
 * Generate demo agent performance data.
 */
function xaGenerateDemoAgentData() {
    return XA_CHARACTERS.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        role: c.role,
        totalInteractions: Math.round(800 + Math.random() * 2000),
        uniqueLearners: Math.round(200 + Math.random() * 500),
        avgDuration: Math.round(12 + Math.random() * 20) + 'm',
        satisfaction: (3.5 + Math.random() * 1.5).toFixed(1),
        growthMindset: Math.round(55 + Math.random() * 40),
        blooms: {
            remember: Math.round(5 + Math.random() * 30),
            understand: Math.round(10 + Math.random() * 25),
            apply: Math.round(10 + Math.random() * 25),
            analyse: Math.round(5 + Math.random() * 25),
            evaluate: Math.round(5 + Math.random() * 20),
            create: Math.round(2 + Math.random() * 20)
        },
        kirkpatrick: {
            reaction: Math.round(60 + Math.random() * 40),
            learning: Math.round(50 + Math.random() * 40),
            behaviour: Math.round(30 + Math.random() * 40),
            results: Math.round(20 + Math.random() * 40)
        },
        topVerbs: ['experienced', 'understood', 'applied'].sort(() => Math.random() - 0.5).slice(0, 3),
        neurodiversity: {
            adhd: Math.round(60 + Math.random() * 35),
            dyslexia: Math.round(55 + Math.random() * 40),
            autism: Math.round(50 + Math.random() * 40)
        }
    }));
}

/**
 * Render the agent performance grid.
 */
function xaRenderAgentGrid(agents) {
    const container = document.getElementById('xa-agent-grid');
    if (!container) return;

    let html = '';
    agents.forEach(a => {
        const bloomTotal = Object.values(a.blooms).reduce((sum, v) => sum + v, 0) || 1;
        html += '<div class="xa-agent-card" style="position: relative;" data-agent-id="' + xaEscapeAttr(a.id) + '">' +
            '<input type="checkbox" class="xa-compare-cb" data-agent="' + xaEscapeAttr(a.id) + '" style="position: absolute; top: 12px; right: 12px; display: none;" onchange="xaToggleCompareAgent(\'' + xaEscapeAttr(a.id) + '\')" aria-label="Select ' + xaEscapeAttr(a.name) + ' for comparison">' +
            '<div class="xa-agent-header">' +
            '<div class="xa-agent-avatar">' + xaEscapeHTML(a.icon) + '</div>' +
            '<div><div class="xa-agent-name">' + xaEscapeHTML(a.name) + '</div><div class="xa-agent-role">' + xaEscapeHTML(a.role) + '</div></div>' +
            '</div>' +
            '<div class="xa-agent-stats">' +
            '<div class="xa-agent-stat"><div class="xa-agent-stat-value">' + a.totalInteractions.toLocaleString() + '</div><div class="xa-agent-stat-label">Interactions</div></div>' +
            '<div class="xa-agent-stat"><div class="xa-agent-stat-value">' + a.uniqueLearners.toLocaleString() + '</div><div class="xa-agent-stat-label">Learners</div></div>' +
            '<div class="xa-agent-stat"><div class="xa-agent-stat-value">' + a.avgDuration + '</div><div class="xa-agent-stat-label">Avg Duration</div></div>' +
            '<div class="xa-agent-stat"><div class="xa-agent-stat-value">' + a.satisfaction + '</div><div class="xa-agent-stat-label">Satisfaction</div></div>' +
            '</div>' +
            // Bloom's mini bar
            '<div class="xa-stacked-bar" style="height: 8px; margin-bottom: 8px;">' +
            '<div class="xa-stacked-segment xa-bloom-1" style="width: ' + (a.blooms.remember / bloomTotal * 100) + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-2" style="width: ' + (a.blooms.understand / bloomTotal * 100) + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-3" style="width: ' + (a.blooms.apply / bloomTotal * 100) + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-4" style="width: ' + (a.blooms.analyse / bloomTotal * 100) + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-5" style="width: ' + (a.blooms.evaluate / bloomTotal * 100) + '%"></div>' +
            '<div class="xa-stacked-segment xa-bloom-6" style="width: ' + (a.blooms.create / bloomTotal * 100) + '%"></div>' +
            '</div>' +
            // Growth mindset
            '<div class="xa-growth-indicator" style="margin-bottom: 8px;">' +
            '<span style="color: #6b7c93; font-size: 11px; width: 90px;">Growth Mindset</span>' +
            '<div class="xa-growth-bar"><div class="xa-growth-fill" style="width: ' + a.growthMindset + '%"></div></div>' +
            '<span class="xa-growth-pct">' + a.growthMindset + '%</span>' +
            '</div>' +
            // Kirkpatrick
            '<div style="margin-bottom: 8px;">' +
            xaRenderKirkpatrickBars(a.kirkpatrick) +
            '</div>' +
            // Neurodiversity support
            '<div style="display: flex; gap: 6px; margin-bottom: 8px;">' +
            '<span class="xa-neuro-badge xa-neuro-adhd">ADHD ' + a.neurodiversity.adhd + '%</span>' +
            '<span class="xa-neuro-badge xa-neuro-dyslexia">Dyslexia ' + a.neurodiversity.dyslexia + '%</span>' +
            '<span class="xa-neuro-badge xa-neuro-autism">Autism ' + a.neurodiversity.autism + '%</span>' +
            '</div>' +
            // WONDERS Radar
            xaGenerateWondersRadar(null) +
            // Top verbs
            '<div class="xa-agent-verbs">' +
            a.topVerbs.map(v => '<span class="xa-agent-verb-tag">' + xaEscapeHTML(v) + '</span>').join('') +
            '</div>' +
            '</div>';
    });

    container.innerHTML = html;
    // Update agent summary stats
    var totalInt = 0;
    var satSum = 0;
    var growthSum = 0;
    agents.forEach(function(a) {
        totalInt += (a.totalInteractions || a.interactions || 0);
        satSum += parseFloat(a.satisfaction) || 0;
        growthSum += (a.growthMindset || 0);
    });
    var totalIntEl = document.getElementById('xa-agent-total-int');
    var avgSatEl = document.getElementById('xa-agent-avg-sat');
    var avgGrowthEl = document.getElementById('xa-agent-avg-growth');
    if (totalIntEl) totalIntEl.textContent = totalInt.toLocaleString();
    if (avgSatEl && agents.length > 0) avgSatEl.textContent = (satSum / agents.length).toFixed(1) + '/5';
    if (avgGrowthEl && agents.length > 0) avgGrowthEl.textContent = Math.round(growthSum / agents.length) + '%';
}

/**
 * Render Kirkpatrick level bars.
 */
function xaRenderKirkpatrickBars(kirk) {
    const levels = [
        { key: 'reaction', label: 'Reaction', cls: 'xa-kirk-reaction' },
        { key: 'learning', label: 'Learning', cls: 'xa-kirk-learning' },
        { key: 'behaviour', label: 'Behaviour', cls: 'xa-kirk-behaviour' },
        { key: 'results', label: 'Results', cls: 'xa-kirk-results' }
    ];
    return levels.map(l => {
        const val = kirk[l.key] || 0;
        return '<div class="xa-kirk-bar">' +
            '<span class="xa-kirk-label">' + l.label + '</span>' +
            '<div class="xa-kirk-track"><div class="xa-kirk-fill ' + l.cls + '" style="width: ' + val + '%"></div></div>' +
            '<span class="xa-kirk-value">' + val + '%</span>' +
            '</div>';
    }).join('');
}

/**
 * Toggle agent selection for comparison mode.
 */
function xaToggleCompareAgent(agentId) {
    const idx = xaSelectedAgentsForCompare.indexOf(agentId);
    if (idx > -1) {
        xaSelectedAgentsForCompare.splice(idx, 1);
    } else if (xaSelectedAgentsForCompare.length < 3) {
        xaSelectedAgentsForCompare.push(agentId);
    } else {
        showToast('You can compare up to 3 agents at a time', 'warning');
        const cb = document.querySelector('.xa-compare-cb[data-agent="' + agentId + '"]');
        if (cb) cb.checked = false;
        return;
    }

    if (xaSelectedAgentsForCompare.length >= 2) {
        xaRenderComparison();
    }
}

/**
 * Render agent comparison view.
 */
function xaRenderComparison() {
    const content = document.getElementById('xa-compare-content');
    if (!content) return;

    const cards = document.querySelectorAll('.xa-agent-card');
    const selectedData = [];
    cards.forEach(card => {
        if (xaSelectedAgentsForCompare.includes(card.getAttribute('data-agent-id'))) {
            selectedData.push(card.getAttribute('data-agent-id'));
        }
    });

    content.innerHTML = '<p style="color: #00d9c0; font-size: 13px;">Comparing ' + xaSelectedAgentsForCompare.length + ' agents. Full comparison view will be populated with live data from the Zavmo backend.</p>';
}

// ---------------------------------------------------------------
// LEARNER JOURNEYS
// ---------------------------------------------------------------

/**
 * Search for a learner and display their journey.
 */
async function xaSearchLearner() {
    const input = document.getElementById('xa-learner-search-input');
    const query = input ? input.value.trim() : '';
    if (!query) {
        showToast('Please enter a learner name or ID', 'warning');
        return;
    }

    const profile = document.getElementById('xa-learner-profile');
    const empty = document.getElementById('xa-learner-empty');
    if (profile) profile.style.display = 'block';
    if (empty) empty.style.display = 'none';

    // Try live API first
    try {
        const response = await zavmoFetch(XA_API_BASE + '/learners/search?q=' + encodeURIComponent(query));
        const data = await response.json();
        if (data && data.status === 'success' && data.data && data.data.length > 0) {
            xaRenderLearnerProfile(data.data[0]);
            return;
        }
    } catch (err) {
        // Use demo data
    }

    // Demo profile
    xaRenderLearnerProfile({
        name: query.charAt(0).toUpperCase() + query.slice(1),
        email: query.toLowerCase().replace(/\s/g, '.') + '@example.com',
        enrolledCourses: 5,
        completedCourses: 3,
        totalStatements: 847,
        avgSessionDuration: '28m',
        bloomsProgress: { remember: 95, understand: 88, apply: 72, analyse: 55, evaluate: 38, create: 22 },
        growthMindset: 76,
        activeAgents: ['Foundation Builder', 'Challenge Coach', 'Career Navigator'],
        journey: xaGenerateDemoJourney(),
        milestones: [
            { title: 'First Course Completed', date: '2025-11-15', type: 'completion' },
            { title: 'Growth Mindset Breakthrough', date: '2025-12-03', type: 'growth' },
            { title: 'Leadership Essentials Certified', date: '2026-01-20', type: 'certification' },
            { title: '100 Statements Milestone', date: '2026-02-10', type: 'milestone' }
        ]
    });
}

/**
 * Generate demo journey events.
 */
function xaGenerateDemoJourney() {
    const events = [];
    const verbs = ['experienced', 'understood', 'applied', 'analysed', 'evaluated', 'created'];
    const courses = ['Leadership Essentials', 'Data Analytics', 'Neuroscience of Learning'];
    const agents = ['Foundation Builder', 'Challenge Coach', 'Pattern Connector'];
    const now = Date.now();

    for (let i = 0; i < 15; i++) {
        const verb = verbs[Math.min(Math.floor(i / 2.5), verbs.length - 1)];
        const bloomIdx = verbs.indexOf(verb);
        events.push({
            verb: verb,
            object: courses[i % courses.length],
            agent: agents[i % agents.length],
            bloom: verb,
            bloomLevel: bloomIdx + 1,
            timestamp: new Date(now - (15 - i) * 86400000 * 2).toISOString(),
            completed: i < 12
        });
    }
    return events;
}

/**
 * Render a learner's profile and journey.
 */
function xaRenderLearnerProfile(learner) {
    // Profile info
    const info = document.getElementById('xa-learner-info');
    if (info) {
        info.innerHTML = '<div style="margin-bottom: 16px;">' +
            '<div style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 4px;">' + xaEscapeHTML(learner.name) + '</div>' +
            '<div style="color: #6b7c93; font-size: 12px;">' + xaEscapeHTML(learner.email || '') + '</div>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
            '<div><div style="color: #ffffff; font-size: 20px; font-weight: 600;">' + learner.enrolledCourses + '</div><div style="color: #6b7c93; font-size: 10px; text-transform: uppercase;">Enrolled</div></div>' +
            '<div><div style="color: #ffffff; font-size: 20px; font-weight: 600;">' + learner.completedCourses + '</div><div style="color: #6b7c93; font-size: 10px; text-transform: uppercase;">Completed</div></div>' +
            '<div><div style="color: #ffffff; font-size: 20px; font-weight: 600;">' + (learner.totalStatements || 0).toLocaleString() + '</div><div style="color: #6b7c93; font-size: 10px; text-transform: uppercase;">Statements</div></div>' +
            '<div><div style="color: #ffffff; font-size: 20px; font-weight: 600;">' + (learner.avgSessionDuration || '--') + '</div><div style="color: #6b7c93; font-size: 10px; text-transform: uppercase;">Avg Session</div></div>' +
            '</div>' +
            '<div style="margin-top: 16px;">' +
            '<div class="xa-growth-indicator">' +
            '<span style="color: #6b7c93; font-size: 11px; width: 90px;">Growth Mindset</span>' +
            '<div class="xa-growth-bar"><div class="xa-growth-fill" style="width: ' + (learner.growthMindset || 0) + '%"></div></div>' +
            '<span class="xa-growth-pct">' + (learner.growthMindset || 0) + '%</span>' +
            '</div></div>';
    }

    // Growth trajectory chart
    const trajectoryEl = document.getElementById('xa-growth-trajectory');
    if (trajectoryEl && learner.journey) {
        const points = learner.journey.map((e, i) => ({ x: i, y: e.bloomLevel || 1 }));
        const w = 300, h = 180;
        const maxY = 6;
        const stepX = w / Math.max(points.length - 1, 1);

        let pathD = '';
        let areaD = 'M0,' + h + ' ';
        points.forEach((p, i) => {
            const x = i * stepX;
            const y = h - (p.y / maxY) * (h - 20) - 10;
            if (i === 0) { pathD += 'M' + x + ',' + y; areaD += 'L' + x + ',' + y; }
            else { pathD += ' L' + x + ',' + y; areaD += ' L' + x + ',' + y; }
        });
        areaD += ' L' + ((points.length - 1) * stepX) + ',' + h + ' Z';

        let dotsHTML = '';
        points.forEach((p, i) => {
            const x = i * stepX;
            const y = h - (p.y / maxY) * (h - 20) - 10;
            dotsHTML += '<circle class="xa-trajectory-dot" cx="' + x + '" cy="' + y + '" r="3"/>';
        });

        trajectoryEl.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
            '<path class="xa-trajectory-area" d="' + areaD + '"/>' +
            '<path class="xa-trajectory-line" d="' + pathD + '"/>' +
            dotsHTML + '</svg>';
    }

    // Journey timeline
    const timeline = document.getElementById('xa-journey-timeline');
    if (timeline && learner.journey) {
        let html = '<div class="xa-journey-line"></div>';
        learner.journey.forEach(e => {
            const bloomClass = 'xa-verb-' + (e.bloom || 'remember');
            html += '<div class="xa-journey-node">' +
                '<div class="xa-journey-dot' + (e.completed ? ' completed' : '') + '"></div>' +
                '<div class="xa-journey-content">' +
                '<div class="xa-journey-title">' + xaEscapeHTML(e.verb) + ' — ' + xaEscapeHTML(e.object) + '</div>' +
                '<div class="xa-journey-desc">via ' + xaEscapeHTML(e.agent) + '</div>' +
                '<span class="xa-journey-bloom ' + bloomClass + '">' + xaEscapeHTML(e.bloom) + '</span>' +
                '<div class="xa-journey-time">' + xaFormatDate(new Date(e.timestamp)) + '</div>' +
                '</div></div>';
        });
        timeline.innerHTML = html;
    }

    // Milestones
    const milestonesEl = document.getElementById('xa-milestones');
    if (milestonesEl && learner.milestones) {
        let html = '';
        learner.milestones.forEach(m => {
            const icon = m.type === 'certification' ? '&#9733;' : m.type === 'growth' ? '&#9650;' : m.type === 'completion' ? '&#10003;' : '&#9679;';
            html += '<div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(26,58,92,0.2);">' +
                '<span style="color: #00d9c0; font-size: 16px;">' + icon + '</span>' +
                '<div><div style="color: #ffffff; font-size: 13px; font-weight: 500;">' + xaEscapeHTML(m.title) + '</div>' +
                '<div style="color: #6b7c93; font-size: 11px;">' + xaEscapeHTML(m.date) + '</div></div></div>';
        });
        milestonesEl.innerHTML = html;
    }

    // Engagement patterns
    const patterns = document.getElementById('xa-engagement-patterns');
    if (patterns) {
        patterns.innerHTML = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
            '<div><div style="color: #ffffff; font-size: 16px; font-weight: 600;">09:00 - 11:00</div><div style="color: #6b7c93; font-size: 11px; text-transform: uppercase;">Peak Learning Hours</div></div>' +
            '<div><div style="color: #ffffff; font-size: 16px; font-weight: 600;">Tuesday</div><div style="color: #6b7c93; font-size: 11px; text-transform: uppercase;">Most Active Day</div></div>' +
            '<div><div style="color: #ffffff; font-size: 16px; font-weight: 600;">3.2 days</div><div style="color: #6b7c93; font-size: 11px; text-transform: uppercase;">Avg Re-engagement</div></div>' +
            '<div><div style="color: #ffffff; font-size: 16px; font-weight: 600;">4 sessions</div><div style="color: #6b7c93; font-size: 11px; text-transform: uppercase;">Weekly Average</div></div>' +
            '</div>';
    }
}

// ---------------------------------------------------------------
// STATEMENT LIBRARY
// ---------------------------------------------------------------

/**
 * Render the statement library table.
 */
function xaRenderStatementLibrary() {
    const tbody = document.getElementById('xa-lib-tbody');
    if (!tbody) return;

    // Add demo frequency counts
    XA_VERB_LIBRARY.forEach(v => {
        if (!v.frequency) v.frequency = Math.round(Math.random() * 500 + 50);
    });

    xaFilterLibrary();
}

/**
 * Filter and re-render the statement library.
 */
function xaFilterLibrary() {
    const tbody = document.getElementById('xa-lib-tbody');
    if (!tbody) return;

    const searchVal = ((document.getElementById('xa-lib-search') || {}).value || '').toLowerCase();
    const bloomVal = (document.getElementById('xa-lib-bloom-filter') || {}).value || '';
    const statusVal = (document.getElementById('xa-lib-status-filter') || {}).value || '';

    const filtered = XA_VERB_LIBRARY.filter(v => {
        if (searchVal && v.verb.indexOf(searchVal) === -1 && v.iri.indexOf(searchVal) === -1 && v.description.toLowerCase().indexOf(searchVal) === -1) return false;
        if (bloomVal && v.bloom !== bloomVal) return false;
        if (statusVal && v.status !== statusVal) return false;
        return true;
    });

    let html = '';
    filtered.forEach(v => {
        const agentNames = v.agents.map(id => {
            if (id === 'all') return 'All';
            const char = XA_CHARACTERS.find(c => c.id === id);
            return char ? char.name : id;
        }).join(', ');

        const bloomLabel = XA_BLOOMS.find(b => b.id === v.bloom);
        const bloomColour = bloomLabel ? bloomLabel.colour : '#6b7c93';

        html += '<tr>' +
            '<td><span class="xa-lib-verb-name">' + xaEscapeHTML(v.verb) + '</span></td>' +
            '<td><span class="xa-lib-iri">' + xaEscapeHTML(v.iri) + '</span></td>' +
            '<td><span style="color: ' + bloomColour + '; font-weight: 500;">' + xaEscapeHTML(bloomLabel ? bloomLabel.label : v.bloom) + '</span></td>' +
            '<td>' + xaEscapeHTML(v.description) + '</td>' +
            '<td style="font-size: 12px; color: #6b7c93;">' + xaEscapeHTML(agentNames) + '</td>' +
            '<td><span class="xa-lib-count">' + v.frequency.toLocaleString() + '</span></td>' +
            '<td><span class="xa-lib-status ' + v.status + '">' + v.status.charAt(0).toUpperCase() + v.status.slice(1) + '</span></td>' +
            '</tr>';
    });

    tbody.innerHTML = html || '<tr><td colspan="7" style="text-align: center; padding: 32px; color: #6b7c93;">No verbs match your filters</td></tr>';
}

/**
 * Export statement library as JSON.
 */
function xaExportLibraryJSON() {
    const json = JSON.stringify(XA_VERB_LIBRARY, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zavmo-xapi-verb-library.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Statement library exported as JSON', 'success');
}

// ---------------------------------------------------------------
// STATEMENT BUILDER
// ---------------------------------------------------------------

/**
 * Initialise the statement builder.
 */
function xaInitBuilder() {
    // Verb selector
    const verbSelect = document.getElementById('xa-builder-verb');
    const customVerbInput = document.getElementById('xa-builder-custom-verb');
    if (verbSelect) {
        verbSelect.addEventListener('change', function() {
            if (customVerbInput) {
                customVerbInput.style.display = this.value === 'custom' ? 'block' : 'none';
            }
            xaUpdateBuilderPreview();
        });
    }
    if (customVerbInput) {
        customVerbInput.addEventListener('input', xaUpdateBuilderPreview);
    }

    // IRI and Object fields
    ['xa-builder-iri', 'xa-builder-object-type', 'xa-builder-object-name', 'xa-builder-description'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', xaUpdateBuilderPreview);
        if (el) el.addEventListener('change', xaUpdateBuilderPreview);
    });

    // Bloom's tags
    document.querySelectorAll('#xa-builder-bloom-tags .xa-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#xa-builder-bloom-tags .xa-tag').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            xaBuilderBloom = this.getAttribute('data-bloom');
            xaUpdateBuilderPreview();
        });
    });

    // Kirkpatrick tags
    document.querySelectorAll('#xa-builder-kirk-tags .xa-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#xa-builder-kirk-tags .xa-tag').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            xaBuilderKirk = this.getAttribute('data-kirk');
            xaUpdateBuilderPreview();
        });
    });

    // WONDERS tags (multi-select)
    document.querySelectorAll('#xa-builder-wonders-tags .xa-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('selected');
            xaBuilderWonders = Array.from(document.querySelectorAll('#xa-builder-wonders-tags .xa-tag.selected')).map(b => b.getAttribute('data-wonders'));
            xaUpdateBuilderPreview();
        });
    });

    // Agent tags
    const agentTagContainer = document.getElementById('xa-builder-agent-tags');
    if (agentTagContainer) {
        XA_CHARACTERS.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'xa-tag';
            btn.setAttribute('data-agent', c.id);
            btn.textContent = c.name;
            btn.addEventListener('click', function() {
                this.classList.toggle('selected');
                xaUpdateBuilderPreview();
            });
            agentTagContainer.appendChild(btn);
        });
    }

    // Save template
    const saveBtn = document.getElementById('xa-builder-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const template = xaBuildTemplate();
            if (!template.verb.display) {
                showToast('Please select a verb first', 'warning');
                return;
            }
            xaSavedTemplates.push(template);
            try {
                localStorage.setItem('zavmo_xa_templates', JSON.stringify(xaSavedTemplates));
            } catch (e) { /* storage full */ }
            showToast('Template saved successfully', 'success');
            xaRenderSavedTemplates();
        });
    }

    // Test preview
    const testBtn = document.getElementById('xa-builder-test');
    if (testBtn) {
        testBtn.addEventListener('click', function() {
            const template = xaBuildTemplate();
            if (!template.verb.display) {
                showToast('Please select a verb first', 'warning');
                return;
            }
            showToast('Test statement generated — check the Live Feed tab', 'success');
            // Add test statement to feed
            const testStatement = {
                id: 'test-' + Date.now(),
                actor: { name: 'Test Learner', mbox: 'mailto:test@zavmo.co.uk' },
                verb: { id: template.verb.id, display: template.verb.display },
                object: { name: template.object.name || 'Test Activity', id: template.object.id || 'https://zavmo.co.uk/test' },
                result: null,
                context: { agent: 'Statement Builder', agentId: 'builder', bloom: xaBuilderBloom },
                timestamp: new Date().toISOString()
            };
            xaFeedStatements.unshift(testStatement);
            xaRenderFeed();
        });
    }

    // Reset
    const resetBtn = document.getElementById('xa-builder-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (verbSelect) verbSelect.value = '';
            if (customVerbInput) { customVerbInput.value = ''; customVerbInput.style.display = 'none'; }
            ['xa-builder-iri', 'xa-builder-object-name', 'xa-builder-description'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const objectType = document.getElementById('xa-builder-object-type');
            if (objectType) objectType.value = 'Activity';
            document.querySelectorAll('#xa-builder-bloom-tags .xa-tag, #xa-builder-kirk-tags .xa-tag, #xa-builder-wonders-tags .xa-tag, #xa-builder-agent-tags .xa-tag').forEach(b => b.classList.remove('selected'));
            xaBuilderBloom = '';
            xaBuilderKirk = '';
            xaBuilderWonders = [];
            xaUpdateBuilderPreview();
            showToast('Builder reset', 'info');
        });
    }

    xaRenderSavedTemplates();
}

/**
 * Build a template object from the current form state.
 */
function xaBuildTemplate() {
    const verbSelect = document.getElementById('xa-builder-verb');
    const customVerb = document.getElementById('xa-builder-custom-verb');
    const verbValue = verbSelect ? verbSelect.value : '';
    const verb = verbValue === 'custom' ? (customVerb ? customVerb.value : '') : verbValue;
    const iri = (document.getElementById('xa-builder-iri') || {}).value || ('https://zavmo.co.uk/xapi/verbs/' + verb);
    const objectType = (document.getElementById('xa-builder-object-type') || {}).value || 'Activity';
    const objectName = (document.getElementById('xa-builder-object-name') || {}).value || '';
    const description = (document.getElementById('xa-builder-description') || {}).value || '';
    const selectedAgents = Array.from(document.querySelectorAll('#xa-builder-agent-tags .xa-tag.selected')).map(b => b.getAttribute('data-agent'));

    return {
        verb: { id: iri, display: verb },
        object: { objectType: objectType, id: 'https://zavmo.co.uk/activities/' + objectName.toLowerCase().replace(/\s/g, '-'), name: objectName },
        description: description,
        bloom: xaBuilderBloom,
        kirkpatrick: xaBuilderKirk,
        wonders: xaBuilderWonders,
        agents: selectedAgents,
        createdAt: new Date().toISOString()
    };
}

/**
 * Update the JSON preview in the builder.
 */
function xaUpdateBuilderPreview() {
    const template = xaBuildTemplate();
    const preview = {
        actor: { mbox: 'mailto:learner@example.com', name: 'Learner Name' },
        verb: { id: template.verb.id || '', display: { 'en-GB': template.verb.display || '' } },
        object: {
            objectType: template.object.objectType,
            id: template.object.id || '',
            definition: {
                name: { 'en-GB': template.object.name || '' },
                type: 'https://zavmo.co.uk/xapi/activity-types/learning-activity'
            }
        },
        context: {
            extensions: {
                'https://zavmo.co.uk/xapi/context/blooms-level': template.bloom || '',
                'https://zavmo.co.uk/xapi/context/kirkpatrick-level': template.kirkpatrick || '',
                'https://zavmo.co.uk/xapi/context/wonders-dimension': template.wonders.length > 0 ? template.wonders : ''
            }
        }
    };

    const jsonEl = document.getElementById('xa-builder-json');
    if (jsonEl) jsonEl.textContent = JSON.stringify(preview, null, 2);
}

/**
 * Render saved templates list.
 */
function xaRenderSavedTemplates() {
    const container = document.getElementById('xa-builder-templates');
    if (!container) return;

    if (xaSavedTemplates.length === 0) {
        container.innerHTML = '<p style="color: #6b7c93; font-size: 13px;">No saved templates yet. Build a statement template and click Save to store it here.</p>';
        return;
    }

    let html = '';
    xaSavedTemplates.forEach((t, i) => {
        html += '<div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(26,58,92,0.2);">' +
            '<div><span style="color: #ffffff; font-weight: 500;">' + xaEscapeHTML(t.verb.display || 'Unknown') + '</span>' +
            '<span style="color: #6b7c93; font-size: 12px; margin-left: 8px;">' + xaEscapeHTML(t.object.name || '') + '</span>' +
            (t.bloom ? ' <span class="xa-statement-verb xa-verb-' + t.bloom + '">' + xaEscapeHTML(t.bloom) + '</span>' : '') +
            '</div>' +
            '<button class="xa-btn-outline" style="padding: 4px 10px; font-size: 11px;" onclick="xaDeleteTemplate(' + i + ')">Remove</button>' +
            '</div>';
    });
    container.innerHTML = html;
}

/**
 * Delete a saved template.
 */
function xaDeleteTemplate(index) {
    xaSavedTemplates.splice(index, 1);
    try {
        localStorage.setItem('zavmo_xa_templates', JSON.stringify(xaSavedTemplates));
    } catch (e) { /* ignore */ }
    xaRenderSavedTemplates();
    showToast('Template removed', 'info');
}

// ---------------------------------------------------------------
// UTILITY FUNCTIONS
// ---------------------------------------------------------------

/**
 * Get period start date string based on selected time range.
 */
function xaGetPeriodStart() {
    const now = new Date();
    switch (xaCurrentPeriod) {
        case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        case '7d': return new Date(now.getTime() - 7 * 86400000).toISOString();
        case '30d': return new Date(now.getTime() - 30 * 86400000).toISOString();
        case '90d': return new Date(now.getTime() - 90 * 86400000).toISOString();
        default: return new Date(now.getTime() - 86400000).toISOString();
    }
}

/**
 * Format a date for display.
 */
function xaFormatTime(date) {
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Format a full date.
 */
function xaFormatDate(date) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Escape HTML entities for safe rendering.
 */
function xaEscapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

/**
 * Escape attribute value.
 */
function xaEscapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Render engagement score ring on Overview.
 */
function xaRenderEngagementRing(score) {
    var ringFill = document.getElementById('xa-ring-fill');
    var ringValue = document.getElementById('xa-ring-value');
    if (!ringFill || !ringValue) return;
    var clampedScore = Math.max(0, Math.min(100, score || 0));
    var circumference = 2 * Math.PI * 60; // r=60
    var dashLen = (clampedScore / 100) * circumference;
    ringFill.setAttribute('stroke-dasharray', dashLen + ' ' + circumference);
    ringValue.textContent = Math.round(clampedScore) + '%';
}

/**
 * Render goal tracking bars on Overview.
 */
function xaRenderGoals() {
    var container = document.getElementById('xa-goals-container');
    if (!container) return;
    var goals = [
        { name: 'Monthly Completions', current: 342, target: 500, unit: '' },
        { name: 'Active Learners', current: 1247, target: 1500, unit: '' },
        { name: 'Growth Mindset', current: 78, target: 85, unit: '%' },
        { name: 'Agent Satisfaction', current: 4.1, target: 4.5, unit: '/5' }
    ];
    var html = '';
    goals.forEach(function(g) {
        var pct = Math.min(100, Math.round((g.current / g.target) * 100));
        var statusClass = pct >= 80 ? 'on-track' : pct >= 60 ? 'at-risk' : 'behind';
        html += '<div class="xa-goal-item">' +
            '<div class="xa-goal-label"><span class="xa-goal-name">' + xaEscapeHTML(g.name) + '</span>' +
            '<span class="xa-goal-numbers">' + g.current + g.unit + ' / ' + g.target + g.unit + ' (' + pct + '%)</span></div>' +
            '<div class="xa-goal-bar"><div class="xa-goal-fill ' + statusClass + '" style="width: ' + pct + '%;"></div></div>' +
            '</div>';
    });
    container.innerHTML = html;
}

/**
 * Render anomaly alerts on Overview.
 */
function xaRenderAnomalies() {
    var container = document.getElementById('xa-anomaly-list');
    if (!container) return;
    var anomalies = [
        { level: 'alert', msg: 'Foundation Builder interactions dropped 34% in the last 24 hours', time: '2h ago' },
        { level: 'warning', msg: 'Unusual spike in "experimented" verb usage across Sales cohort', time: '5h ago' },
        { level: 'info', msg: 'Growth Mindset scores trending upward for 3 consecutive weeks', time: '1d ago' },
        { level: 'warning', msg: 'Average session duration below target for Leadership cohort', time: '1d ago' }
    ];
    var icons = { alert: '!', warning: '&#9888;', info: '&#8505;' };
    var html = '';
    anomalies.forEach(function(a) {
        html += '<div class="xa-anomaly-item">' +
            '<div class="xa-anomaly-icon ' + a.level + '">' + icons[a.level] + '</div>' +
            '<div><div class="xa-anomaly-msg">' + xaEscapeHTML(a.msg) + '</div>' +
            '<div class="xa-anomaly-time">' + xaEscapeHTML(a.time) + '</div></div>' +
            '</div>';
    });
    container.innerHTML = html;
}

/**
 * Cohort comparison data and rendering.
 */
var XA_COHORTS = {
    'all': { name: 'All Departments', learners: 1247, completionRate: 68, growthMindset: 78 },
    'engineering': { name: 'Engineering', learners: 312, completionRate: 72, growthMindset: 81 },
    'sales': { name: 'Sales', learners: 287, completionRate: 65, growthMindset: 74 },
    'marketing': { name: 'Marketing', learners: 198, completionRate: 71, growthMindset: 82 },
    'leadership': { name: 'Leadership', learners: 156, completionRate: 58, growthMindset: 85 },
    'customer-success': { name: 'Customer Success', learners: 294, completionRate: 74, growthMindset: 76 }
};

function xaSelectCohort(cohortId) {
    document.querySelectorAll('.xa-cohort-btn').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-cohort') === cohortId);
    });
    xaRenderCohortComparison(cohortId);
}

function xaRenderCohortComparison(selected) {
    var container = document.getElementById('xa-cohort-grid');
    if (!container) return;
    var bloomColours = ['#a0aec0', '#63b3ed', '#00d9c0', '#00b4d8', '#63b3ed', '#a78bfa'];
    var bloomLabels = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];
    var cohorts = selected === 'all' ? Object.keys(XA_COHORTS).filter(function(k) { return k !== 'all'; }) : [selected];
    var html = '';
    cohorts.forEach(function(key) {
        var c = XA_COHORTS[key];
        if (!c) return;
        var blooms = [];
        for (var i = 0; i < 6; i++) blooms.push(Math.round(8 + Math.random() * 25));
        var total = blooms.reduce(function(s, v) { return s + v; }, 0);
        html += '<div class="xa-cohort-card">' +
            '<div class="xa-cohort-name">' + xaEscapeHTML(c.name) + '</div>' +
            '<div class="xa-cohort-stat"><span>Learners</span><span class="xa-cohort-stat-val">' + c.learners + '</span></div>' +
            '<div class="xa-cohort-stat"><span>Completion Rate</span><span class="xa-cohort-stat-val">' + c.completionRate + '%</span></div>' +
            '<div class="xa-cohort-stat"><span>Growth Mindset</span><span class="xa-cohort-stat-val">' + c.growthMindset + '%</span></div>' +
            '<div class="xa-cohort-bloom-bar" title="Bloom\'s Taxonomy Distribution">';
        blooms.forEach(function(val, idx) {
            var pct = Math.round((val / total) * 100);
            html += '<div style="width: ' + pct + '%; background: ' + bloomColours[idx] + ';" title="' + bloomLabels[idx] + ': ' + pct + '%"></div>';
        });
        html += '</div></div>';
    });
    container.innerHTML = html;
}

/**
 * Generate WONDERS radar SVG for an agent.
 */
function xaGenerateWondersRadar(wondersData) {
    if (!wondersData) {
        wondersData = {
            wonder: Math.round(40 + Math.random() * 55),
            openness: Math.round(40 + Math.random() * 55),
            narrative: Math.round(40 + Math.random() * 55),
            drive: Math.round(40 + Math.random() * 55),
            empathy: Math.round(40 + Math.random() * 55),
            reasoning: Math.round(40 + Math.random() * 55),
            synthesis: Math.round(40 + Math.random() * 55)
        };
    }
    var labels = ['W', 'O', 'N', 'D', 'E', 'R', 'S'];
    var fullLabels = ['Wonder', 'Openness', 'Narrative', 'Drive', 'Empathy', 'Reasoning', 'Synthesis'];
    var keys = ['wonder', 'openness', 'narrative', 'drive', 'empathy', 'reasoning', 'synthesis'];
    var cx = 80, cy = 60, maxR = 45;
    var n = 7;
    var angleStep = (2 * Math.PI) / n;
    // Draw axis lines
    var svgParts = '<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">';
    // Background rings at 33% and 66%
    [0.33, 0.66, 1].forEach(function(ring) {
        var pts = [];
        for (var i = 0; i < n; i++) {
            var angle = -Math.PI / 2 + i * angleStep;
            pts.push((cx + maxR * ring * Math.cos(angle)).toFixed(1) + ',' + (cy + maxR * ring * Math.sin(angle)).toFixed(1));
        }
        svgParts += '<polygon points="' + pts.join(' ') + '" fill="none" class="xa-wonders-axis"/>';
    });
    // Axes
    for (var i = 0; i < n; i++) {
        var angle = -Math.PI / 2 + i * angleStep;
        var x2 = cx + maxR * Math.cos(angle);
        var y2 = cy + maxR * Math.sin(angle);
        svgParts += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="xa-wonders-axis"/>';
        // Label
        var lx = cx + (maxR + 12) * Math.cos(angle);
        var ly = cy + (maxR + 12) * Math.sin(angle);
        svgParts += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" text-anchor="middle" class="xa-wonders-label" title="' + fullLabels[i] + '">' + labels[i] + '</text>';
    }
    // Data polygon
    var dataPts = [];
    for (var i = 0; i < n; i++) {
        var angle = -Math.PI / 2 + i * angleStep;
        var val = (wondersData[keys[i]] || 50) / 100;
        dataPts.push((cx + maxR * val * Math.cos(angle)).toFixed(1) + ',' + (cy + maxR * val * Math.sin(angle)).toFixed(1));
    }
    svgParts += '<polygon points="' + dataPts.join(' ') + '" class="xa-wonders-polygon"/>';
    // Data dots
    dataPts.forEach(function(pt) {
        var coords = pt.split(',');
        svgParts += '<circle cx="' + coords[0] + '" cy="' + coords[1] + '" r="2.5" fill="#00d9c0"/>';
    });
    svgParts += '</svg>';
    return '<div class="xa-wonders-radar"><div style="color: #6b7c93; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">WONDERS Intelligence</div>' + svgParts + '</div>';
}

/**
 * Export Overview as PDF using window.print().
 */
function xaExportPDF() {
    window.print();
}

