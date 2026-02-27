// ========================================
// JOB DESCRIPTIONS PAGE
// ========================================

const jdData = [
    {
        title: "Senior Software Engineer",
        org: "Digital Transformation Team",
        industry: "Technology",
        level: "Level 6 — Degree",
        type: "Full-time",
        updated: "Updated 3 days ago",
        linkedQuals: 4,
        allocated: 0,
        inProgress: 0,
        completed: 0,
        overview: "Lead the design, development, and delivery of scalable software solutions within the digital transformation programme. This role requires deep technical expertise across the full stack, with a focus on cloud-native architectures, CI/CD pipelines, and mentoring junior developers.",
        responsibilities: [
            "Architect and implement scalable microservices using modern frameworks and cloud platforms",
            "Lead code reviews, establish coding standards, and drive best practices",
            "Collaborate with product owners to translate business requirements into technical specifications",
            "Mentor and support junior and mid-level developers through pair programming",
            "Ensure security, performance, and accessibility standards are met"
        ],
        qualifications: [
            { text: "BSc (Hons) Computer Science or equivalent Level 6 qualification", type: "required" },
            { text: "Digital and Technology Solutions Professional (Level 6 Apprenticeship Standard)", type: "required" },
            { text: "AWS Solutions Architect Associate or equivalent cloud certification", type: "desirable" }
        ],
        skills: ["Python", "JavaScript/TypeScript", "React", "Django", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
        experience: "5+ years of professional software development experience, with at least 2 years in a senior or lead capacity."
    },
    {
        title: "Healthcare Assistant",
        org: "NHS Trust — Acute Care",
        industry: "Healthcare",
        level: "Level 3 — Advanced",
        type: "Apprenticeship",
        updated: "Updated 1 week ago",
        linkedQuals: 3,
        allocated: 0,
        inProgress: 0,
        completed: 0,
        overview: "Provide high-quality, compassionate care to patients across acute care settings. Working under the supervision of registered nurses, you will support patients with daily living activities, monitor vital signs, and ensure a safe and dignified care environment.",
        responsibilities: [
            "Assist patients with personal care, mobility, and nutritional needs",
            "Record and report patient observations including temperature, pulse, blood pressure",
            "Support the nursing team in maintaining a clean, safe, and well-organised ward environment",
            "Communicate effectively with patients, families, and the multidisciplinary care team",
            "Adhere to infection prevention and control protocols at all times"
        ],
        qualifications: [
            { text: "Senior Healthcare Support Worker (Level 3 Apprenticeship Standard)", type: "required" },
            { text: "Level 2 Diploma in Health and Social Care or equivalent", type: "required" },
            { text: "Care Certificate or willingness to complete within 12 weeks", type: "required" }
        ],
        skills: ["Patient Care", "Clinical Observations", "Infection Control", "Communication", "Safeguarding", "Manual Handling"],
        experience: "Prior experience in a care setting is desirable but not essential. A genuine passion for helping others is essential."
    },
    {
        title: "Project Manager",
        org: "Construction & Infrastructure",
        industry: "Construction",
        level: "Level 5 — Foundation Degree",
        type: "Management",
        updated: "Updated 2 weeks ago",
        linkedQuals: 5,
        allocated: 0,
        inProgress: 0,
        completed: 0,
        overview: "Manage the end-to-end delivery of construction projects from inception through to handover, ensuring they are completed safely, on time, within budget, and to the required quality standards.",
        responsibilities: [
            "Develop and maintain project plans, schedules, budgets, and risk registers",
            "Lead project teams including subcontractors, consultants, and direct labour",
            "Ensure compliance with CDM Regulations, Building Standards, and environmental legislation",
            "Chair project meetings, produce progress reports, and manage stakeholder communications",
            "Identify and mitigate risks, resolving issues proactively"
        ],
        qualifications: [
            { text: "HNC/HND or Foundation Degree in Construction Management", type: "required" },
            { text: "SMSTS (Site Management Safety Training Scheme) certification", type: "required" },
            { text: "APM Project Management Qualification (PMQ) or equivalent", type: "desirable" }
        ],
        skills: ["Project Planning", "Budgeting", "Risk Management", "CDM Regulations", "Stakeholder Management", "MS Project"],
        experience: "Minimum 3 years of experience managing construction projects with a value in excess of £1M."
    },
    {
        title: "Financial Analyst",
        org: "Investment Banking Division",
        industry: "Finance & Banking",
        level: "Level 4 — Higher",
        type: "Graduate Programme",
        updated: "Updated 5 days ago",
        linkedQuals: 3,
        allocated: 0,
        inProgress: 0,
        completed: 0,
        overview: "Join the investment banking division as a graduate financial analyst, supporting senior colleagues in financial modelling, market analysis, and client advisory. You will gain exposure across M&A, equity capital markets, and debt financing.",
        responsibilities: [
            "Build and maintain financial models for valuation, forecasting, and scenario analysis",
            "Conduct market research and competitive analysis to support client pitches",
            "Prepare client presentations, information memoranda, and investment committee papers",
            "Analyse financial statements and key performance indicators",
            "Support due diligence workstreams and coordinate with legal and compliance teams"
        ],
        qualifications: [
            { text: "Level 4 Diploma in Financial Planning or equivalent", type: "required" },
            { text: "Working towards CFA Level I or CISI Level 4 Investment Advice Diploma", type: "required" },
            { text: "2:1 degree or above in Finance, Economics, Mathematics, or related discipline", type: "desirable" }
        ],
        skills: ["Financial Modelling", "Excel (Advanced)", "Bloomberg", "PowerPoint", "Valuation", "Accounting (IFRS)"],
        experience: "Entry-level role suited to recent graduates. Internship experience within financial services is desirable."
    },
    {
        title: "Digital Marketing Executive",
        org: "Brand & Communications",
        industry: "Retail",
        level: "Level 3 — Advanced",
        type: "Apprenticeship",
        updated: "Updated 1 day ago",
        linkedQuals: 2,
        allocated: 0,
        inProgress: 0,
        completed: 0,
        overview: "Drive brand awareness and customer engagement through digital channels. You will manage social media campaigns, email marketing, content creation, and paid media, working closely with the wider marketing team.",
        responsibilities: [
            "Plan, create, and schedule engaging content across social media platforms",
            "Manage and optimise email marketing campaigns using industry platforms",
            "Support the execution of paid digital advertising campaigns",
            "Monitor and report on campaign performance using Google Analytics",
            "Collaborate with the design team to produce visual assets aligned to brand guidelines",
            "Research market trends and competitor activity"
        ],
        qualifications: [
            { text: "Multi-Channel Marketer (Level 3 Apprenticeship Standard)", type: "required" },
            { text: "Google Ads Certification or Meta Blueprint Certification", type: "desirable" }
        ],
        skills: ["Social Media Management", "Email Marketing", "Google Analytics", "Google Ads", "Content Creation", "SEO Basics"],
        experience: "No prior professional experience required. A strong personal interest in digital marketing and social media is essential."
    },
    {
        title: "Operations Manager",
        org: "Logistics & Distribution",
        industry: "Logistics & Supply Chain",
        level: "Level 5 — Foundation Degree",
        type: "Management",
        updated: "Updated 4 days ago",
        linkedQuals: 4,
        allocated: 0,
        inProgress: 0,
        completed: 0,
        overview: "Oversee the daily operations of a busy distribution centre, ensuring efficient and cost-effective management of warehousing, transport, and fulfilment activities. You will lead a team of 40+ operatives and supervisors.",
        responsibilities: [
            "Manage day-to-day warehouse and distribution operations to meet service level agreements",
            "Lead, coach, and develop a team of supervisors and operatives",
            "Drive continuous improvement initiatives using Lean/Six Sigma methodologies",
            "Manage operational budgets, forecast resource requirements, and control costs",
            "Ensure full compliance with health and safety legislation"
        ],
        qualifications: [
            { text: "Foundation Degree or HND in Supply Chain Management, Logistics, or Business Management", type: "required" },
            { text: "IOSH Managing Safely certification", type: "required" },
            { text: "Lean Six Sigma Green Belt", type: "desirable" }
        ],
        skills: ["Warehouse Management", "Lean/Six Sigma", "Team Leadership", "Budget Management", "WMS Systems", "Health & Safety"],
        experience: "Minimum 3 years of operations management experience within a logistics or distribution environment."
    }
];

// In-memory cache for JD data and state
const jdDataCache = {
    initialised: false,
    currentSort: 'popular',
    currentData: null,
    apiCards: null
};

function initJobDescriptionsPage() {
    if (jdDataCache.initialised) return;
    jdDataCache.initialised = true;

    // Render demo cards as placeholder
    renderJDCards(jdData);

    // Wire up search
    const searchInput = document.getElementById('jd-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (jdSearchTimeout) clearTimeout(jdSearchTimeout);
            jdSearchTimeout = setTimeout(executeJDSearch, 400);
        });
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (jdSearchTimeout) clearTimeout(jdSearchTimeout);
                executeJDSearch();
            }
        });
    }

    // Wire up filters
    ['jd-filter-country', 'jd-filter-language', 'jd-filter-industry', 'jd-filter-level'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', executeJDSearch);
    });

    // Wire up sort
    const sortDropdown = document.getElementById('jd-sort-dropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', function() {
            jdDataCache.currentSort = this.value;
            renderJDCards(jdDataCache.currentData || jdData);
        });
    }

    // Try to load real JD data from UAT
    loadRealJDData();
}

let jdSearchTimeout = null;

/**
 * Parse a JSON-encoded skills array from the API.
 * Accepts a string like '[{"description":"..."},...]' or an actual array.
 * Returns an array of description strings.
 */
function parseJDSkills(raw) {
    if (!raw) return [];
    try {
        const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!Array.isArray(arr)) return [];
        return arr.map(s => s.description || s.name || '').filter(Boolean);
    } catch (e) {
        return [];
    }
}

/**
 * Map a raw API job description item to the card format used by the UI.
 */
function mapAPIJobToCard(item) {
    const funcSkills = parseJDSkills(item.functional_skills);
    const softSkills = parseJDSkills(item.soft_skills);
    return {
        title: item.title || item.job_title || 'Untitled',
        org: item.industry || 'Organisation',
        industry: item.industry || '',
        level: item.ofqual_level_alignment ? 'Level ' + item.ofqual_level_alignment : '',
        type: item.experience_band || 'Full-time',
        updated: 'From UAT',
        linkedQuals: 0,
        allocated: 0,
        inProgress: 0,
        completed: 0,
        overview: item.description || '',
        responsibilities: funcSkills,
        qualifications: softSkills.map(s => ({ text: s, type: 'desirable' })),
        skills: [].concat(funcSkills, softSkills),
        experience: item.experience_band || '',
        _source: 'api',
        _raw: item
    };
}

/**
 * Load real Job Descriptions data from UAT API.
 * Falls back to demo data if API fails.
 */
async function loadRealJDData() {
    try {
        const data = await searchLearningSpecs('role', { type: 'jd' });
        if (data && data.job_descriptions && data.job_descriptions.length > 0) {
            const cards = data.job_descriptions.map(mapAPIJobToCard);
            if (cards.length > 0) {
                jdDataCache.apiCards = cards;
                jdDataCache.currentData = cards;
                renderJDCards(cards);
            }
        }
    } catch (err) {
        console.warn('Could not load real JD data from UAT, using demo data:', err.message);
    }
}

/**
 * Execute Job Descriptions search against the API.
 */
async function executeJDSearch() {
    const searchInput = document.getElementById('jd-search-input');
    const query = searchInput ? searchInput.value.trim() : '';

    if (!query) {
        // No search query — show all data (API data if available, otherwise demo)
        const data = jdDataCache.apiCards || jdData;
        jdDataCache.currentData = data;
        renderJDCards(data);
        return;
    }

    try {
        const results = await searchLearningSpecs(query, { type: 'jd' });
        if (results && results.job_descriptions && results.job_descriptions.length > 0) {
            const cards = results.job_descriptions.map(mapAPIJobToCard);
            jdDataCache.currentData = cards;
            renderJDCards(cards);
        } else {
            // No API results — filter demo data client-side
            const filtered = jdData.filter(jd => {
                const q = query.toLowerCase();
                return (jd.title && jd.title.toLowerCase().includes(q)) ||
                       (jd.industry && jd.industry.toLowerCase().includes(q)) ||
                       (jd.org && jd.org.toLowerCase().includes(q));
            });
            jdDataCache.currentData = filtered;
            renderJDCards(filtered);
        }
    } catch (err) {
        // API failed — filter demo data client-side
        const filtered = jdData.filter(jd => {
            const q = query.toLowerCase();
            return (jd.title && jd.title.toLowerCase().includes(q)) ||
                   (jd.industry && jd.industry.toLowerCase().includes(q)) ||
                   (jd.org && jd.org.toLowerCase().includes(q));
        });
        jdDataCache.currentData = filtered;
        renderJDCards(filtered);
    }
}

function renderJDCards(data) {
    const grid = document.getElementById('jd-results-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Store current data for search re-filtering
    jdDataCache.currentData = data;

    // Sort based on selected option
    const sortMode = jdDataCache.currentSort || 'popular';
    const sortedData = [...data].sort((a, b) => {
        if (sortMode === 'popular') {
            const totalA = (a.allocated || 0) + (a.inProgress || 0) + (a.completed || 0);
            const totalB = (b.allocated || 0) + (b.inProgress || 0) + (b.completed || 0);
            return totalB - totalA;
        } else if (sortMode === 'recent') {
            // Keep original order for "recently updated"
            return 0;
        } else if (sortMode === 'alpha') {
            return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
    });

    sortedData.forEach((jd, index) => {
        const card = document.createElement('div');
        card.className = 'jd-card';

        // Build popularity bar HTML — real data requires API ticket ZAV-API-002
        let popHTML = '';
        const isApiData = jd._source === 'api';
        if (!isApiData && (jd.allocated || jd.inProgress || jd.completed)) {
            popHTML = `
                <div class="jd-coming-soon-bar">
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 12px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 8px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span style="color: #fbbf24; font-size: 11px; font-weight: 500;">Usage Analytics — Coming Soon</span>
                        <span style="color: #6b7c93; font-size: 11px; margin-left: auto;">Allocated / In Progress / Completed</span>
                    </div>
                </div>
            `;
        } else if (isApiData) {
            popHTML = `
                <div class="jd-coming-soon-bar">
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 12px;">
                        <span style="background: rgba(0,217,192,0.15); color: #00d9c0; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">LIVE</span>
                        <span style="color: #6b7c93; font-size: 11px;">From UAT Neo4j</span>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="jd-card-header">
                <div>
                    <div class="jd-card-title">${escapeHTML(jd.title)}</div>
                    <div class="jd-card-org">${escapeHTML(jd.org)}</div>
                </div>
            </div>
            <div class="jd-card-tags">
                <span class="jd-tag industry">${escapeHTML(jd.industry)}</span>
                <span class="jd-tag level">${escapeHTML(jd.level)}</span>
                <span class="jd-tag type">${escapeHTML(jd.type)}</span>
            </div>
            ${popHTML}
            <div class="jd-card-meta">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    ${jd.linkedQuals} Qualifications
                </span>
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${escapeHTML(jd.updated)}
                </span>
            </div>
        `;
        card.onclick = () => openJDDetail(jd);
        grid.appendChild(card);
    });

    const resultCount = document.getElementById('jd-result-count');
    if (resultCount) resultCount.textContent = data.length;
}

function openJDDetail(jd) {
    if (!jd) return;

    document.getElementById('jd-detail-title').textContent = jd.title;
    document.getElementById('jd-detail-industry').textContent = jd.industry;
    document.getElementById('jd-detail-level').textContent = jd.level;
    document.getElementById('jd-detail-updated').textContent = jd.updated;

    let html = '';

    // Overview
    html += '<div class="jd-detail-section">';
    html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> Role Overview</div>';
    html += '<p class="jd-detail-text">' + escapeHTML(jd.overview) + '</p>';
    html += '</div>';

    // Responsibilities
    html += '<div class="jd-detail-section">';
    html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Key Responsibilities</div>';
    html += '<ul class="jd-qual-list">';
    jd.responsibilities.forEach(r => {
        html += '<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>' + escapeHTML(r) + '</li>';
    });
    html += '</ul></div>';

    // Qualifications
    html += '<div class="jd-detail-section">';
    html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> Aligned Qualifications</div>';
    html += '<ul class="jd-qual-list">';
    jd.qualifications.forEach(q => {
        const cls = q.type === 'required' ? 'required' : 'desirable';
        const label = q.type === 'required' ? 'Essential' : 'Desirable';
        html += '<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>' + escapeHTML(q.text) + '</span><span class="jd-qual-essential ' + cls + '">' + label + '</span></li>';
    });
    html += '</ul></div>';

    // Skills
    html += '<div class="jd-detail-section">';
    html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Key Skills</div>';
    html += '<div class="jd-skill-tags">';
    jd.skills.forEach(s => {
        html += '<span class="jd-skill-tag">' + escapeHTML(s) + '</span>';
    });
    html += '</div></div>';

    // Experience
    html += '<div class="jd-detail-section">';
    html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Experience Required</div>';
    html += '<p class="jd-detail-text">' + escapeHTML(jd.experience) + '</p>';
    html += '</div>';

    document.getElementById('jd-detail-body').innerHTML = html;
    document.getElementById('jd-detail-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeJDDetailIfBackdrop(event, el) {
    if (event.target === el) closeJDDetail();
}

function closeJDDetail() {
    document.getElementById('jd-detail-overlay').classList.remove('open');
    document.body.style.overflow = '';
}

function toggleJDExport(e) {
    e.stopPropagation();
    const dd = document.getElementById('jd-export-dropdown');
    if (dd) dd.classList.toggle('open');
}

function showJDToast(msg) {
    const toast = document.getElementById('jd-toast');
    const msg_el = document.getElementById('jd-toast-msg');
    if (msg_el) msg_el.textContent = msg;
    if (toast) {
        toast.classList.add('show');
        const dd = document.getElementById('jd-export-dropdown');
        if (dd) dd.classList.remove('open');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
}

document.addEventListener('click', () => {
    const dd = document.getElementById('jd-export-dropdown');
    if (dd) dd.classList.remove('open');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeJDDetail();
});

