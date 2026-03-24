// ══════════════════════════════════════════════════════════════════
// COMMAND CENTRE PAGE MODULE
// Initialises the Command Centre dashboard with chat, insights, neural network
// ══════════════════════════════════════════════════════════════════

/**
 * Initialise the Command Centre page
 * Handles chat interface, scrolling insights, and neural network animation
 */
function initCommandCentre() {
    initGreeting();
    initChat();
    initScrollingInsights();
    initNeuralNetwork();
}

// ══════════════════════════════════════════════════════════════════
// GREETING
// ══════════════════════════════════════════════════════════════════

function initGreeting() {
    // Extract first name from logged-in user email
    // Email is stored inside zavmo_auth JSON object by auth.js, or in sessionStorage as zavmo_access
    let userEmail = null;
    try {
        const auth = JSON.parse(localStorage.getItem('zavmo_auth') || 'null');
        if (auth && auth.email) userEmail = auth.email;
    } catch (e) { /* ignore parse errors */ }
    if (!userEmail) userEmail = sessionStorage.getItem('zavmo_access');
    let firstName = 'there';

    if (userEmail && typeof userEmail === 'string') {
        const parts = userEmail.split('@');
        if (parts.length > 0) {
            const namePart = parts[0];
            // Handle dot-separated names (e.g., john.doe@company.com)
            const nameSegments = namePart.split('.');
            if (nameSegments.length > 0) {
                firstName = nameSegments[0];
                // Capitalise first letter
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            }
        }
    }

    const nameEl = document.querySelector('.cc-name');
    if (nameEl) {
        nameEl.textContent = firstName;
    }
}

// ══════════════════════════════════════════════════════════════════
// CHAT FUNCTIONALITY
// ══════════════════════════════════════════════════════════════════

function initChat() {
    const chatInput = document.getElementById('cc-chat-input');
    const chatSend = document.getElementById('cc-chat-send');
    const chatMessages = document.getElementById('cc-chat-messages');
    const typingIndicator = document.getElementById('cc-typing-indicator');

    if (!chatInput || !chatSend || !chatMessages) {
        console.warn('Chat elements not found');
        return;
    }

    const demoResponses = {
        'add user': "To add a new user, I'll need a few details: their <strong>full name</strong>, <strong>email address</strong>, and which <strong>team or department</strong> they belong to. I can also assign them to a qualification and send an onboarding invitation automatically. Would you like to proceed?",
        'invitations': "You currently have <strong class=\"cc-teal\">3 pending invitations</strong> awaiting learner acceptance and <strong>12 sent this week</strong>. The pending ones are for the Manchester Customer Service L3 cohort. Would you like me to send a reminder, or would you prefer to create new invitations for a different group?",
        'agent 13': "Agent 13 is currently monitoring <strong class=\"cc-teal\">1,247 active learners</strong> in real time. Two learners have been flagged:<br><br><strong>Sarah Chen</strong> (Digital Skills L2) — flow score dropped to 0.28 over 3 sessions. Recommend switching to the Coach character for encouragement.<br><br><strong>James Okonkwo</strong> (Health &amp; Safety L2) — flow score at 0.31, showing signs of cognitive overload on the Analyse phase. Recommend scaffolding back to Apply-level content.",
        'allocate': "Here's your current allocation overview:<br><br><strong>Fully allocated:</strong> Health &amp; Safety L2 (342 learners), Customer Service L3 (287 learners)<br><strong>Partially allocated:</strong> Leadership &amp; Mgmt L5 (198 of 250 seats filled)<br><strong>Unassigned learners:</strong> <strong class=\"cc-teal\">23 new starters</strong> with no courses allocated yet<br><br>Would you like me to suggest courses for the unassigned learners based on their role profiles?",
        'skills': "Across the organisation, your strongest skill areas are <strong>Communication</strong> (82% mastery) and <strong>Health &amp; Safety Compliance</strong> (79%). The biggest gaps are in <strong class=\"cc-teal\">Data Analysis</strong> (34% mastery) and <strong class=\"cc-teal\">Project Management</strong> (41%). Would you like me to recommend qualification pathways to close these gaps?",
        'default': "I can see <strong class=\"cc-teal\">1,247 active learners</strong> today with an overall engagement rate of <strong>78%</strong>. The top-performing cohort is Customer Service L3 in London at 87% completion. Is there a specific area you'd like me to dig into — team performance, qualification progress, sentiment trends, or learner alerts?"
    };

    function addMsg(text, sender) {
        const msg = document.createElement('div');
        msg.className = 'cc-chat-msg ' + sender;
        // Use innerHTML for our own demo responses (HTML formatting is intentional)
        msg.innerHTML = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getResponse(input) {
        const lower = input.toLowerCase();
        if (lower.includes('add') && lower.includes('user')) return demoResponses['add user'];
        if (lower.includes('invit')) return demoResponses['invitations'];
        if (lower.includes('agent') || lower.includes('flow') || lower.includes('flag')) return demoResponses['agent 13'];
        if (lower.includes('allocat') || lower.includes('course') || lower.includes('assign')) return demoResponses['allocate'];
        if (lower.includes('skill') || lower.includes('gap')) return demoResponses['skills'];
        return demoResponses['default'];
    }

    function handleSend(text) {
        const msg = text || chatInput.value.trim();
        if (!msg) return;

        // Add user message — use textContent for safety
        const userMsg = document.createElement('div');
        userMsg.className = 'cc-chat-msg user';
        userMsg.textContent = msg;
        chatMessages.appendChild(userMsg);

        chatInput.value = '';

        // Show typing indicator
        if (typingIndicator) {
            typingIndicator.classList.add('visible');
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate response delay
        setTimeout(function() {
            if (typingIndicator) {
                typingIndicator.classList.remove('visible');
            }
            addMsg(getResponse(msg), 'zavmo');
        }, 1200 + Math.random() * 800);
    }

    chatSend.addEventListener('click', function() {
        handleSend();
    });

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    });
}

// ══════════════════════════════════════════════════════════════════
// SCROLLING INSIGHTS — JARVIS-style smooth transitions
// ══════════════════════════════════════════════════════════════════

function initScrollingInsights() {
    const insights = document.querySelectorAll('.cc-insight-line');
    if (insights.length === 0) return;

    let total = insights.length;
    let current = 0;
    const visibleCount = 3;

    function showNextBatch() {
        // Gracefully fade out current batch first
        insights.forEach(function(el) {
            el.classList.remove('visible');
        });

        // Wait for fade-out to complete, then fade in new batch
        setTimeout(function() {
            for (let i = 0; i < visibleCount; i++) {
                const idx = (current + i) % total;
                (function(el, delay) {
                    setTimeout(function() {
                        el.classList.add('visible');
                    }, delay);
                })(insights[idx], i * 600);
            }
            current = (current + visibleCount) % total;
        }, 1000);
    }

    // Initial reveal — gentle stagger on load
    setTimeout(function() {
        for (let i = 0; i < visibleCount; i++) {
            (function(el, delay) {
                setTimeout(function() {
                    el.classList.add('visible');
                }, delay);
            })(insights[i], i * 800);
        }
        current = visibleCount;
    }, 800);

    // Rotate every 10 seconds — unhurried, confident
    setInterval(function() {
        showNextBatch();
    }, 10000);
}

// ══════════════════════════════════════════════════════════════════
// NEURAL NETWORK ANIMATION
// ══════════════════════════════════════════════════════════════════

function initNeuralNetwork() {
    const canvas = document.getElementById('cc-neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = [];
    const nodeCount = 60;
    const connectionDist = 160;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Create nodes with random positions and velocities
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI * 2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections between nearby nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    const alpha = (1 - dist / connectionDist) * 0.3;
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(0, 217, 192, ' + alpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw and update nodes
        for (let k = 0; k < nodes.length; k++) {
            const n = nodes[k];
            n.pulse += 0.02;
            const glow = 0.4 + Math.sin(n.pulse) * 0.3;

            // Node dot with pulsing glow
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 217, 192, ' + glow + ')';
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();

            // Move nodes
            n.x += n.vx;
            n.y += n.vy;

            // Bounce off edges softly
            if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        }

        requestAnimationFrame(draw);
    }

    draw();
}

// ══════════════════════════════════════════════════════════════════
// TEACHING PROMPTS PAGE — collapsible charter toggle
// ══════════════════════════════════════════════════════════════════

function initChartersToggle() {
    const toggle = document.getElementById('charter-toggle');
    const body = document.getElementById('charter-body');
    if (!toggle || !body) return;

    // Avoid binding multiple times
    if (toggle.dataset.bound === 'true') return;
    toggle.dataset.bound = 'true';

    toggle.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!expanded));
        body.classList.toggle('cc-collapsed', expanded);
    });

    // Keyboard accessibility — Enter or Space to toggle
    toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
}

// ══════════════════════════════════════════════════════════════════
// CONTENT PAGE — Sub-tab switching (Browse / Create / Upload)
// ══════════════════════════════════════════════════════════════════

let lsModeBound = false;

function initContentPageTabs() {
    if (lsModeBound) return;
    lsModeBound = true;

    const tabContainer = document.getElementById('ls-mode-tabs');
    if (!tabContainer) return;

    const browseMode = document.getElementById('ls-browse-mode');
    const createMode = document.getElementById('ls-create-mode');
    const uploadMode = document.getElementById('ls-upload-mode');

    tabContainer.querySelectorAll('.cc-sub-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Update active tab
            tabContainer.querySelectorAll('.cc-sub-tab').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            const mode = this.getAttribute('data-ls-mode');

            // Show/hide modes
            if (browseMode) browseMode.style.display = mode === 'browse' ? 'block' : 'none';
            if (createMode) createMode.style.display = mode === 'create' ? 'block' : 'none';
            if (uploadMode) uploadMode.style.display = mode === 'upload' ? 'block' : 'none';
        });
    });

    // Wire up Add Unit button
    const addUnitBtn = document.getElementById('ls-add-unit-btn');
    if (addUnitBtn) {
        addUnitBtn.addEventListener('click', addNewUnit);
    }

    // Wire up upload zone click
    const uploadZone = document.getElementById('ls-upload-zone');
    const fileInput = document.getElementById('ls-file-input');
    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', function () {
            fileInput.click();
        });
        // Drag and drop visual feedback
        uploadZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(0, 217, 192, 0.5)';
            this.style.background = 'rgba(0, 217, 192, 0.05)';
        });
        uploadZone.addEventListener('dragleave', function () {
            this.style.borderColor = '';
            this.style.background = '';
        });
        uploadZone.addEventListener('drop', function (e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.background = '';
            // Future: handle file upload
            if (typeof showToast === 'function') {
                showToast('File upload will be available once the backend endpoint is ready.', 'info');
            }
        });
    }

    // Delegate Add LO / Add AC / Remove buttons inside units container
    const unitsContainer = document.getElementById('ls-units-container');
    if (unitsContainer) {
        unitsContainer.addEventListener('click', function (e) {
            const target = e.target;
            if (target.classList.contains('cc-add-lo-btn')) {
                addLORow(target.closest('.cc-unit-card'));
            } else if (target.classList.contains('cc-add-ac-btn')) {
                addACRow(target.closest('.cc-unit-card'));
            } else if (target.classList.contains('cc-remove-lo')) {
                removeLOACRow(target);
            } else if (target.classList.contains('cc-remove-ac')) {
                removeLOACRow(target);
            }
        });
    }
}

/**
 * Add a new unit card to the create form.
 */
function addNewUnit() {
    const container = document.getElementById('ls-units-container');
    if (!container) return;

    const unitCount = container.querySelectorAll('.cc-unit-card').length + 1;
    const unitHTML = `
        <div class="cc-unit-card" data-unit-index="${unitCount - 1}">
            <div class="cc-unit-header">
                <span class="cc-unit-badge">Unit ${unitCount}</span>
                <input type="text" class="cc-form-input cc-unit-title-input" placeholder="Unit title" data-field="title">
                <div class="cc-unit-meta-inputs">
                    <input type="number" class="cc-form-input-sm" placeholder="Credits" data-field="credits">
                    <input type="number" class="cc-form-input-sm" placeholder="GLH" data-field="glh">
                    <select class="cc-form-select-sm" data-field="mandatory">
                        <option value="mandatory">Mandatory</option>
                        <option value="optional">Optional</option>
                    </select>
                    <button class="cc-btn-icon cc-remove-unit" title="Remove unit">&times;</button>
                </div>
            </div>
            <div class="cc-lo-section">
                <div class="cc-lo-header">
                    <span class="cc-lo-label">Learning Outcomes</span>
                    <button class="cc-btn-sm cc-add-lo-btn">+ Add LO</button>
                </div>
                <div class="cc-lo-list" data-lo-list>
                    <div class="cc-lo-row">
                        <span class="cc-lo-num">LO1</span>
                        <input type="text" class="cc-form-input" placeholder="Learning outcome..." data-lo-input>
                        <button class="cc-btn-icon cc-remove-lo" title="Remove">&times;</button>
                    </div>
                </div>
            </div>
            <div class="cc-ac-section">
                <div class="cc-ac-header">
                    <span class="cc-ac-label">Assessment Criteria</span>
                    <button class="cc-btn-sm cc-add-ac-btn">+ Add AC</button>
                </div>
                <div class="cc-ac-list" data-ac-list>
                    <div class="cc-ac-row">
                        <span class="cc-ac-num">AC1.1</span>
                        <input type="text" class="cc-form-input" placeholder="Assessment criterion..." data-ac-input>
                        <select class="cc-form-select-sm" data-ac-lo-link title="Link to LO">
                            <option value="1">LO1</option>
                        </select>
                        <button class="cc-btn-icon cc-remove-ac" title="Remove">&times;</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', unitHTML);
}

/**
 * Add a Learning Outcome row to a unit card.
 */
function addLORow(unitCard) {
    if (!unitCard) return;
    const loList = unitCard.querySelector('[data-lo-list]');
    if (!loList) return;
    const count = loList.querySelectorAll('.cc-lo-row').length + 1;
    const html = `
        <div class="cc-lo-row">
            <span class="cc-lo-num">LO${count}</span>
            <input type="text" class="cc-form-input" placeholder="Learning outcome..." data-lo-input>
            <button class="cc-btn-icon cc-remove-lo" title="Remove">&times;</button>
        </div>
    `;
    loList.insertAdjacentHTML('beforeend', html);
    // Update AC LO-link dropdowns for this unit
    updateACLinkDropdowns(unitCard);
}

/**
 * Add an Assessment Criterion row to a unit card.
 */
function addACRow(unitCard) {
    if (!unitCard) return;
    const acList = unitCard.querySelector('[data-ac-list]');
    const loList = unitCard.querySelector('[data-lo-list]');
    if (!acList) return;

    const loCount = loList ? loList.querySelectorAll('.cc-lo-row').length : 1;
    const acRows = acList.querySelectorAll('.cc-ac-row');
    const nextNum = acRows.length + 1;

    // Build LO options
    let loOptions = '';
    for (let i = 1; i <= loCount; i++) {
        loOptions += `<option value="${i}">LO${i}</option>`;
    }

    const html = `
        <div class="cc-ac-row">
            <span class="cc-ac-num">AC${nextNum}.1</span>
            <input type="text" class="cc-form-input" placeholder="Assessment criterion..." data-ac-input>
            <select class="cc-form-select-sm" data-ac-lo-link title="Link to LO">
                ${loOptions}
            </select>
            <button class="cc-btn-icon cc-remove-ac" title="Remove">&times;</button>
        </div>
    `;
    acList.insertAdjacentHTML('beforeend', html);
}

/**
 * Remove a LO or AC row.
 */
function removeLOACRow(btn) {
    if (!btn) return;
    const row = btn.closest('.cc-lo-row, .cc-ac-row');
    if (row) row.remove();
}

/**
 * Update the LO-link dropdowns in AC rows when LOs change.
 */
function updateACLinkDropdowns(unitCard) {
    if (!unitCard) return;
    const loRows = unitCard.querySelectorAll('[data-lo-list] .cc-lo-row');
    const acSelects = unitCard.querySelectorAll('[data-ac-lo-link]');
    const loCount = loRows.length;

    acSelects.forEach(function (sel) {
        const current = sel.value;
        sel.innerHTML = '';
        for (let i = 1; i <= loCount; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = 'LO' + i;
            sel.appendChild(opt);
        }
        if (current && parseInt(current) <= loCount) {
            sel.value = current;
        }
    });
}

// ══════════════════════════════════════════════════════════════════
// ORG PULSE PAGE (placeholder for future expansion)
// ══════════════════════════════════════════════════════════════════

function initOrgPulsePage() {
    // Placeholder for future Org Pulse functionality
    // Current implementation uses static HTML from index.html
}
