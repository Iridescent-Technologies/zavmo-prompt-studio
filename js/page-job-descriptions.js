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
 * Parse a JSON-encoded array from the API.
 * Accepts a JSON string or an actual array/object. Returns the parsed value or [].
 */
function parseJDJSON(raw) {
    if (!raw) return [];
    if (typeof raw !== 'string') return Array.isArray(raw) ? raw : [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

/**
 * Parse a JSON-encoded skills array from the API.
 * Accepts a string like '[{"description":"..."},...]' or an actual array.
 * Returns an array of description strings.
 */
function parseJDSkills(raw) {
    return parseJDJSON(raw).map(s => s.description || s.name || s.skill || '').filter(Boolean);
}

/**
 * Map a raw API job description item to the card format used by the UI.
 */
function mapAPIJobToCard(item) {
    const funcSkills = parseJDSkills(item.functional_skills);
    const softSkills = parseJDSkills(item.soft_skills);
    return {
        job_id: item.job_id || '',
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
        overview: item.role_summary || item.description || '',
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

/**
 * Build the detail modal HTML from a data object.
 * Works for both demo data (with arrays) and full API data (with JSON strings).
 */
function buildJDDetailHTML(d) {
    let html = '';

    // --- Role Summary / Overview ---
    const summary = d.role_summary || d.overview || '';
    if (summary) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> Role Summary</div>';
        html += '<p class="jd-detail-text">' + escapeHTML(summary) + '</p>';
        html += '</div>';
    }

    // --- Department & Reporting ---
    if (d.department || d.reports_to) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Department & Reporting</div>';
        html += '<div class="jd-detail-meta-grid">';
        if (d.department) html += '<div class="jd-detail-meta-pair"><span class="jd-meta-label">Department</span><span class="jd-meta-value">' + escapeHTML(d.department) + '</span></div>';
        if (d.reports_to) html += '<div class="jd-detail-meta-pair"><span class="jd-meta-label">Reports to</span><span class="jd-meta-value">' + escapeHTML(d.reports_to) + '</span></div>';
        html += '</div></div>';
    }

    // --- Responsibilities (API: JSON array of {level, responsibilities}) ---
    const responsibilities = parseJDJSON(d.responsibilities);
    // Also support demo data where responsibilities is an array of strings
    if (responsibilities.length > 0) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Key Responsibilities</div>';
        if (typeof responsibilities[0] === 'string') {
            // Demo data: simple string array
            html += '<ul class="jd-qual-list">';
            responsibilities.forEach(function(r) {
                html += '<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>' + escapeHTML(r) + '</li>';
            });
            html += '</ul>';
        } else {
            // API data: objects with {level, responsibilities}
            responsibilities.forEach(function(group) {
                if (group.level) {
                    html += '<div class="jd-resp-level-label">' + escapeHTML(group.level) + '</div>';
                }
                const items = (group.responsibilities || '').split('. ').filter(Boolean);
                if (items.length > 0) {
                    html += '<ul class="jd-qual-list">';
                    items.forEach(function(item) {
                        const text = item.endsWith('.') ? item : item + '.';
                        html += '<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>' + escapeHTML(text) + '</li>';
                    });
                    html += '</ul>';
                }
            });
        }
        html += '</div>';
    }

    // --- Domain / Functional Skills (JSON array of {skill, description}) ---
    const domainSkills = parseJDJSON(d.functional_skills);
    if (domainSkills.length > 0 && domainSkills[0].skill) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Domain Skills</div>';
        html += '<div class="jd-detail-skills-list">';
        domainSkills.forEach(function(s) {
            html += '<div class="jd-detail-skill-card">';
            html += '<div class="jd-detail-skill-name">' + escapeHTML(s.skill || s.name || '') + '</div>';
            if (s.description) html += '<div class="jd-detail-skill-desc">' + escapeHTML(s.description) + '</div>';
            html += '</div>';
        });
        html += '</div></div>';
    }

    // --- Soft Skills (JSON array of {skill, description}) ---
    const softSkills = parseJDJSON(d.soft_skills);
    if (softSkills.length > 0 && softSkills[0].skill) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Soft Skills</div>';
        html += '<div class="jd-detail-skills-list">';
        softSkills.forEach(function(s) {
            html += '<div class="jd-detail-skill-card">';
            html += '<div class="jd-detail-skill-name">' + escapeHTML(s.skill || s.name || '') + '</div>';
            if (s.description) html += '<div class="jd-detail-skill-desc">' + escapeHTML(s.description) + '</div>';
            html += '</div>';
        });
        html += '</div></div>';
    }

    // --- Fallback: simple skills tags (demo data) ---
    if (d.skills && Array.isArray(d.skills) && d.skills.length > 0 && typeof d.skills[0] === 'string') {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Key Skills</div>';
        html += '<div class="jd-skill-tags">';
        d.skills.forEach(function(s) { html += '<span class="jd-skill-tag">' + escapeHTML(s) + '</span>'; });
        html += '</div></div>';
    }

    // --- Tech Stack ---
    const techStack = parseJDJSON(d.tech_stack);
    if (techStack.length > 0) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg> Tech Stack</div>';
        html += '<div class="jd-detail-tech-list">';
        techStack.forEach(function(t) {
            html += '<div class="jd-detail-tech-item">';
            html += '<span class="jd-detail-tech-name">' + escapeHTML(t.name || '') + '</span>';
            if (t.proficiency) html += '<span class="jd-detail-tech-prof">' + escapeHTML(t.proficiency) + '</span>';
            html += '</div>';
        });
        html += '</div></div>';
    }

    // --- Education & Experience ---
    if (d.education || d.experience_requirement || d.experience) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> Education & Experience</div>';
        if (d.education) html += '<p class="jd-detail-text"><strong>Education:</strong> ' + escapeHTML(d.education) + '</p>';
        if (d.experience_requirement) html += '<p class="jd-detail-text"><strong>Experience:</strong> ' + escapeHTML(d.experience_requirement) + '</p>';
        else if (d.experience) html += '<p class="jd-detail-text"><strong>Experience:</strong> ' + escapeHTML(d.experience) + '</p>';
        if (d.prerequisite_competencies) html += '<p class="jd-detail-text"><strong>Prerequisites:</strong> ' + escapeHTML(d.prerequisite_competencies) + '</p>';
        html += '</div>';
    }

    // --- Qualifications (demo data: array of {text, type}) ---
    if (d.qualifications && Array.isArray(d.qualifications) && d.qualifications.length > 0 && d.qualifications[0].text) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> Aligned Qualifications</div>';
        html += '<ul class="jd-qual-list">';
        d.qualifications.forEach(function(q) {
            var cls = q.type === 'required' ? 'required' : 'desirable';
            var label = q.type === 'required' ? 'Essential' : 'Desirable';
            html += '<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>' + escapeHTML(q.text) + '</span><span class="jd-qual-essential ' + cls + '">' + label + '</span></li>';
        });
        html += '</ul></div>';
    }

    // --- Career Progression ---
    const progression = parseJDJSON(d.progression_from_this_role);
    const entryPaths = parseJDJSON(d.common_entry_paths);
    const careerVision = parseJDJSON(d.long_term_career_vision);
    if (progression.length > 0 || entryPaths.length > 0 || careerVision.length > 0) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> Career Progression</div>';
        if (entryPaths.length > 0) {
            html += '<p class="jd-detail-sub-label">Common Entry Paths</p>';
            html += '<div class="jd-skill-tags">';
            entryPaths.forEach(function(p) { html += '<span class="jd-skill-tag">' + escapeHTML(typeof p === 'string' ? p : (p.pathway || p.name || '')) + '</span>'; });
            html += '</div>';
        }
        if (progression.length > 0) {
            html += '<p class="jd-detail-sub-label">Progression from This Role</p>';
            html += '<div class="jd-detail-progression-list">';
            progression.forEach(function(p) {
                html += '<div class="jd-detail-progression-card">';
                html += '<div class="jd-detail-progression-title">' + escapeHTML(p.pathway || '') + '</div>';
                if (p.new_skills_needed) html += '<div class="jd-detail-progression-skills">' + escapeHTML(p.new_skills_needed) + '</div>';
                html += '</div>';
            });
            html += '</div>';
        }
        if (careerVision.length > 0) {
            html += '<p class="jd-detail-sub-label">Long-term Career Vision</p>';
            html += '<div class="jd-skill-tags">';
            careerVision.forEach(function(v) { html += '<span class="jd-skill-tag">' + escapeHTML(typeof v === 'string' ? v : (v.pathway || v.name || '')) + '</span>'; });
            html += '</div>';
        }
        html += '</div>';
    }

    // --- Performance Metrics ---
    const qualMetrics = parseJDJSON(d.qualitative_metrics);
    const quantMetrics = parseJDJSON(d.quantitative_metrics);
    if (qualMetrics.length > 0 || quantMetrics.length > 0) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg> Performance Metrics</div>';
        if (quantMetrics.length > 0) {
            html += '<p class="jd-detail-sub-label">Quantitative</p>';
            html += '<ul class="jd-qual-list">';
            quantMetrics.forEach(function(m) { html += '<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>' + escapeHTML(typeof m === 'string' ? m : (m.description || m.name || '')) + '</li>'; });
            html += '</ul>';
        }
        if (qualMetrics.length > 0) {
            html += '<p class="jd-detail-sub-label">Qualitative</p>';
            html += '<ul class="jd-qual-list">';
            qualMetrics.forEach(function(m) { html += '<li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/></svg>' + escapeHTML(typeof m === 'string' ? m : (m.description || m.name || '')) + '</li>'; });
            html += '</ul>';
        }
        html += '</div>';
    }

    // --- Decision Making & Stakeholders ---
    const stakeholders = parseJDJSON(d.key_stakeholders);
    if (d.decision_making_authority || stakeholders.length > 0) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Decision Making & Stakeholders</div>';
        if (d.decision_making_authority) html += '<p class="jd-detail-text">' + escapeHTML(d.decision_making_authority) + '</p>';
        if (stakeholders.length > 0) {
            html += '<p class="jd-detail-sub-label">Key Stakeholders</p>';
            html += '<div class="jd-skill-tags">';
            stakeholders.forEach(function(s) { html += '<span class="jd-skill-tag">' + escapeHTML(typeof s === 'string' ? s : (s.name || '')) + '</span>'; });
            html += '</div>';
        }
        html += '</div>';
    }

    // --- Emerging & Advancing Skills ---
    if (d.advancing_technical_skills || d.emerging_skills) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Emerging & Advancing Skills</div>';
        if (d.advancing_technical_skills) html += '<p class="jd-detail-text"><strong>Advancing:</strong> ' + escapeHTML(d.advancing_technical_skills) + '</p>';
        if (d.emerging_skills) html += '<p class="jd-detail-text"><strong>Emerging:</strong> ' + escapeHTML(d.emerging_skills) + '</p>';
        html += '</div>';
    }

    // --- Alternative Titles ---
    const altTitles = parseJDJSON(d.alternative_titles);
    if (altTitles.length > 0) {
        html += '<div class="jd-detail-section">';
        html += '<div class="jd-detail-section-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg> Alternative Titles</div>';
        html += '<div class="jd-skill-tags">';
        altTitles.forEach(function(t) { html += '<span class="jd-skill-tag">' + escapeHTML(typeof t === 'string' ? t : (t.name || '')) + '</span>'; });
        html += '</div></div>';
    }

    return html;
}

/**
 * Fetch full JD details from the API for a given job_id.
 */
async function fetchJDFullDetails(jobId) {
    if (!jobId) return null;
    try {
        const url = ZAVMO_BASE_URL + '/api/discover/jd/' + encodeURIComponent(jobId) + '/';
        const response = await zavmoFetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.data || data;
    } catch (err) {
        console.warn('Failed to fetch full JD details:', err.message);
        return null;
    }
}

function openJDDetail(jd) {
    if (!jd) return;

    const titleEl = document.getElementById('jd-detail-title');
    const industryEl = document.getElementById('jd-detail-industry');
    const levelEl = document.getElementById('jd-detail-level');
    const updatedEl = document.getElementById('jd-detail-updated');
    const bodyEl = document.getElementById('jd-detail-body');
    const overlayEl = document.getElementById('jd-detail-overlay');

    if (titleEl) titleEl.textContent = jd.title;
    if (industryEl) industryEl.textContent = jd.industry;
    if (levelEl) levelEl.textContent = jd.level;
    if (updatedEl) updatedEl.textContent = jd.updated;

    // Render with basic data first
    if (bodyEl) bodyEl.innerHTML = buildJDDetailHTML(jd);
    if (overlayEl) overlayEl.classList.add('open');
    document.body.style.overflow = 'hidden';

    // If this is API data, fetch full details and re-render
    if (jd._source === 'api' && jd.job_id) {
        fetchJDFullDetails(jd.job_id).then(function(fullData) {
            if (fullData && bodyEl) {
                bodyEl.innerHTML = buildJDDetailHTML(fullData);
            }
        }).catch(function() {
            // Keep the basic view already rendered
        });
    }
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

