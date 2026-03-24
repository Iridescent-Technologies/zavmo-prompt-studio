/**
 * Zavmo Character Interactions Section
 * Renders learning interaction templates below each character's system prompt
 * in the Characters page of the Command Centre.
 *
 * This module is loaded alongside data-characters.js and app-core.js.
 * When the character dropdown changes, updateInteractionsSection() is called
 * to display the selected character's interaction templates.
 *
 * @module character-interactions
 * @version 1.0.0
 * @author Juliette Denny / Claude
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** Bloom's Taxonomy level colour mappings for badge styling */
const BLOOM_COLOURS = {
    'Remember':    '#a855f7',
    'Understand':  '#ec4899',
    'Apply':       '#22c55e',
    'Analyse':     '#f59e0b',
    'Evaluate':    '#3b82f6',
    'Create':      '#ef4444',
    'Synthesise':  '#26c6da'
};

/** Bloom's Taxonomy level background colours (low opacity) for badges */
const BLOOM_BG_COLOURS = {
    'Remember':    'rgba(168, 85, 247, 0.15)',
    'Understand':  'rgba(236, 72, 153, 0.15)',
    'Apply':       'rgba(34, 197, 94, 0.15)',
    'Analyse':     'rgba(245, 158, 11, 0.15)',
    'Evaluate':    'rgba(59, 130, 246, 0.15)',
    'Create':      'rgba(239, 68, 68, 0.15)',
    'Synthesise':  'rgba(38, 198, 218, 0.15)'
};

/**
 * Complete interaction library — 54 templates across 10 teaching characters.
 * Each interaction is a reusable template that AI populates from the current
 * Learning Objective, Assessment Criteria, and learner context.
 *
 * Keys match the character-select dropdown values in index.html.
 */
const CHARACTER_INTERACTIONS = {
    'foundation-builder': {
        name: 'The Builder',
        subtitle: 'Foundation Expert',
        colour: '#7c3aed',
        blooms: ['Remember', 'Understand'],
        stages: '1\u20132',
        interactions: [
            { id: 'term-matching', name: 'Term Matching', bloom: 'Remember', desc: 'Match key terms to their definitions or workplace applications. AI generates pairs from the Learning Objective\u2019s core terminology and contextualises definitions to the learner\u2019s role.', ui: 'Two-column drag-to-match', time: '2\u20133 min', example: 'Match each GDPR principle to what it means when you\u2019re reviewing a client\u2019s data handling procedures.' },
            { id: 'sequence-builder', name: 'Sequence Builder', bloom: 'Remember', desc: 'Put steps of a process or procedure into the correct order. AI extracts procedural sequences from the Assessment Criteria and shuffles them for the learner to reconstruct.', ui: 'Drag-to-reorder list', time: '2\u20133 min', example: 'Put these safeguarding steps in the right order \u2014 from first noticing a concern to completing the referral.' },
            { id: 'fill-the-gap', name: 'Fill the Gap', bloom: 'Remember', desc: 'Complete sentences with missing key terms selected from a word bank. AI generates contextualised sentences from the teaching content with strategically placed blanks.', ui: 'Text with selectable word bank', time: '2\u20134 min', example: 'The _______ methodology divides a project into short cycles called _______, typically lasting 1\u20134 weeks.' },
            { id: 'rapid-recall', name: 'Rapid Recall', bloom: 'Remember', desc: 'Timed true/false statements about core concepts. Tests quick recognition of accurate vs inaccurate information. Tracks personal best times.', ui: 'Statement cards with T/F buttons + timer', time: '1\u20132 min', example: 'True or false: A/B testing requires at least three variants to be statistically valid.' },
            { id: 'concept-sort', name: 'Concept Sort', bloom: 'Understand', desc: 'Categorise items into the correct groups. AI generates items from the LO domain and creates meaningful categories that test conceptual boundaries.', ui: 'Cards with category drop zones', time: '2\u20133 min', example: 'Sort these into \u2018Statutory Right\u2019 vs \u2018Contractual Benefit\u2019: holiday pay, company car, minimum wage, pension auto-enrolment.' },
            { id: 'odd-one-out', name: 'Odd One Out', bloom: 'Understand', desc: 'Identify which item doesn\u2019t belong in a group and explain why. Goes beyond memorisation \u2014 requires understanding the underlying principle.', ui: 'Grid of 4 items + selection + explanation', time: '2\u20133 min', example: 'Which doesn\u2019t belong: Stakeholder Map, RACI Matrix, Gantt Chart, Power/Interest Grid? Why?' },
            { id: 'knowledge-bricks', name: 'Knowledge Bricks', bloom: 'Understand', desc: 'Build up a concept layer by layer \u2014 each \u201cbrick\u201d is a fact or principle that stacks on the previous one. Scaffolded recall mirroring the Builder\u2019s construction metaphor.', ui: 'Progressive reveal with confirmation', time: '3\u20135 min', example: 'Brick 1: What is encryption? \u2192 Brick 2: How does symmetric differ from asymmetric? \u2192 Brick 3: When would you use each?' },
            { id: 'spotlight-check', name: 'Spotlight Check', bloom: 'Understand', desc: 'A single focused comprehension question mid-teaching. Quick pulse check before moving on. Low-stakes, high-frequency.', ui: 'Single question card, MC or short text', time: '30s\u20131 min', example: 'Quick check: In your own words, what\u2019s the main difference between a policy and a procedure?' }
        ]
    },
    'challenge-coach': {
        name: 'The Coach',
        subtitle: 'Application Expert',
        colour: '#22c55e',
        blooms: ['Apply', 'Analyse'],
        stages: '3\u20134',
        interactions: [
            { id: 'scenario-response', name: 'Scenario Response', bloom: 'Apply', desc: 'A realistic workplace scenario contextualised to the learner\u2019s role. They choose how to respond, then see consequences unfold.', ui: 'Scenario card with branching choices', time: '3\u20135 min', example: 'Your biggest client emails saying they\u2019re considering a competitor. You have a quarterly review in 2 days. What do you do first?' },
            { id: 'fix-the-mistake', name: 'Fix the Mistake', bloom: 'Apply', desc: 'Spot and correct errors in a workplace document, process, or decision. AI generates a flawed example with 3\u20135 deliberate errors.', ui: 'Highlighted text with edit controls', time: '3\u20135 min', example: 'This risk assessment has 4 errors. Find them: \u201cThe annual review was completed by the same person who wrote the policy...\u201d' },
            { id: 'escalation-drill', name: 'Escalation Drill', bloom: 'Apply', desc: 'A situation that progressively gets more complex across 3\u20134 levels. At each stage, the learner decides how to handle it.', ui: 'Multi-stage scenario with choices per level', time: '4\u20136 min', example: 'Level 1: A team member is 10 minutes late. \u2192 Level 2: Third time this week. \u2192 Level 3: They\u2019re dealing with a personal issue.' },
            { id: 'process-walkthrough', name: 'Process Walkthrough', bloom: 'Apply', desc: 'Step through a real procedure, making decisions at each point. AI generates decision points from the Assessment Criteria.', ui: 'Step-by-step wizard with choices', time: '3\u20135 min', example: 'Walk through processing this invoice: Is the PO number valid? \u2192 Does the amount match? \u2192 Who needs to approve it?' },
            { id: 'case-dissection', name: 'Case Dissection', bloom: 'Analyse', desc: 'Break down a case study into its component parts \u2014 identify the problem, stakeholders, contributing factors, and potential solutions.', ui: 'Case text with tagging/annotation', time: '5\u20138 min', example: 'Read this customer complaint case. Tag each element: What\u2019s the root problem? Who\u2019s affected? What process failed?' },
            { id: 'what-changed', name: 'What Changed?', bloom: 'Analyse', desc: 'Two versions of a scenario \u2014 before and after a change. Learner identifies what\u2019s different and analyses the impact.', ui: 'Side-by-side comparison with annotation', time: '4\u20136 min', example: 'Compare these two quarterly reports. What changed in the methodology? How does that affect the conclusions?' },
            { id: 'constraint-challenge', name: 'Constraint Challenge', bloom: 'Apply', desc: 'Apply knowledge under realistic constraints \u2014 limited budget, time pressure, incomplete information, or competing priorities.', ui: 'Scenario with visible constraint indicators', time: '4\u20136 min', example: 'Your venue cancels 48 hours before the event. Budget: \u00a3500. Attendees: 80. Find a solution.' },
            { id: 'root-cause-investigator', name: 'Root Cause Investigator', bloom: 'Analyse', desc: 'Work backwards from a problem to identify its root cause. AI generates a realistic problem chain with red herrings.', ui: 'Problem tree with expandable paths', time: '5\u20138 min', example: 'Customer satisfaction dropped 15% this quarter. Is it delivery times? Product quality? Communication? Investigate.' }
        ]
    },
    'career-navigator': {
        name: 'The Navigator',
        subtitle: 'Career Expert',
        colour: '#0ea5e9',
        blooms: ['Evaluate'],
        stages: '5',
        interactions: [
            { id: 'priority-ranker', name: 'Priority Ranker', bloom: 'Evaluate', desc: 'Rank a set of actions or options by importance, then justify the ranking. Quality of reasoning matters more than a single correct answer.', ui: 'Drag-to-rank list with justification fields', time: '4\u20136 min', example: 'Rank these classroom management priorities for your first week: building relationships, establishing routines, assessing prior knowledge.' },
            { id: 'trade-off-tribunal', name: 'Trade-Off Tribunal', bloom: 'Evaluate', desc: 'Weigh two or more competing options against explicit criteria. Make a recommendation and defend it.', ui: 'Option cards with weighted criteria sliders', time: '5\u20137 min', example: 'Supplier A: cheaper but longer lead times. Supplier B: more expensive but ISO certified. Evaluate against your criteria.' },
            { id: 'risk-radar', name: 'Risk Radar', bloom: 'Evaluate', desc: 'Assess a set of risks by likelihood and impact, then recommend mitigations. Contextualised to the learner\u2019s workplace.', ui: 'Risk items with L/I selectors + mitigation text', time: '5\u20138 min', example: 'Assess these 5 workplace hazards: likelihood (1\u20135), impact (1\u20135), and recommend one mitigation for each.' },
            { id: 'stakeholder-lens', name: 'Stakeholder Lens', bloom: 'Evaluate', desc: 'Evaluate a decision from multiple stakeholder perspectives. What does the manager think? The customer? The regulator?', ui: 'Perspective cards with viewpoint responses', time: '5\u20138 min', example: 'The board wants to restructure your department. How would the CEO, frontline staff, customers, and the union each view this?' },
            { id: 'decision-defence', name: 'Decision Defence', bloom: 'Evaluate', desc: 'Make a recommendation, then defend it against counter-arguments generated by the AI. Tests depth of evaluative thinking.', ui: 'Recommendation card + AI challenge/response', time: '5\u20138 min', example: 'You\u2019ve recommended Option B. But what about the cost implications? And the accessibility concerns?' },
            { id: 'evidence-weigher', name: 'Evidence Weigher', bloom: 'Evaluate', desc: 'Given a set of evidence items, decide which are most relevant and reliable for making a specific decision.', ui: 'Evidence cards with relevance/reliability ratings', time: '3\u20135 min', example: 'Rank these sources by reliability: a peer-reviewed study, a blog post, an industry report, a government statistic.' }
        ]
    },
    'experiment-space': {
        name: 'The Explorer',
        subtitle: 'Innovation Expert',
        colour: '#dc2626',
        blooms: ['Create'],
        stages: '6',
        interactions: [
            { id: 'innovation-sprint', name: 'Innovation Sprint', bloom: 'Create', desc: 'Design a solution to a workplace challenge within constraints. Learner proposes: problem restatement, solution, implementation steps, and success measures.', ui: 'Brief card + structured response fields', time: '6\u201310 min', example: 'Your budget\u2019s been cut by 40% but targets haven\u2019t changed. Design a campaign strategy using organic content.' },
            { id: 'what-if-laboratory', name: 'What-If Laboratory', bloom: 'Create', desc: 'Change one variable in a scenario and predict the ripple effects. Then change another. Explore cause and effect creatively.', ui: 'Scenario with adjustable variable toggles', time: '5\u20138 min', example: 'What if your main supplier switched to a 4-day week? Toggle: delivery frequency, stock levels, customer expectations.' },
            { id: 'process-redesigner', name: 'Process Redesigner', bloom: 'Create', desc: 'Given an existing process, redesign it to be more efficient, inclusive, or compliant. Add, remove, or reorder steps and justify each change.', ui: 'Process steps with edit/add/remove controls', time: '6\u201310 min', example: 'Here\u2019s the current onboarding process (8 steps). Redesign it to be fully remote-friendly whilst maintaining compliance.' },
            { id: 'pitch-builder', name: 'Pitch Builder', bloom: 'Create', desc: 'Create and present an idea in a structured format \u2014 problem, solution, benefits, risks, and next steps. AI evaluates the pitch.', ui: 'Structured pitch template with guided sections', time: '8\u201312 min', example: 'Pitch a new approach to multi-agency working. Structure: problem, solution, benefits, risks, success measures.' },
            { id: 'future-scenario', name: 'Future Scenario', bloom: 'Create', desc: 'Imagine how a workplace situation might evolve over 1, 3, and 5 years. Consider trends, technology, regulation, and societal changes.', ui: 'Timeline with prediction cards at milestones', time: '6\u201310 min', example: 'How will your organisation\u2019s carbon reporting look in 1 year? 3 years? 5 years?' },
            { id: 'constraint-breaker', name: 'Constraint Breaker', bloom: 'Create', desc: 'Remove one assumed constraint and explore what becomes possible. Encourages creative thinking beyond current limitations.', ui: 'Constraint toggles + open response', time: '5\u20138 min', example: 'What if every citizen had perfect digital literacy? How would you redesign your council\u2019s service delivery?' }
        ]
    },
    'integrator': {
        name: 'The Integrator',
        subtitle: 'Meta-Synthesis',
        colour: '#26C6DA',
        blooms: ['Synthesise'],
        stages: '7',
        interactions: [
            { id: 'cross-lo-challenge', name: 'Cross-LO Challenge', bloom: 'Synthesise', desc: 'A complex scenario requiring knowledge from multiple Learning Objectives. Tests whether the learner can connect concepts across units.', ui: 'Complex scenario with multi-part response', time: '8\u201312 min', example: 'A building audit has revealed issues spanning health & safety, environmental compliance, and budget management. Create a prioritised action plan.' },
            { id: 'reflection-journal', name: 'Reflection Journal', bloom: 'Synthesise', desc: 'Structured reflection on what was learnt, how it connects to prior knowledge, and how it applies to career goals.', ui: 'Guided reflection prompts with text fields', time: '5\u20138 min', example: 'What surprised you most? \u2192 How does this connect to what you already knew? \u2192 What will you do differently at work tomorrow?' },
            { id: 'concept-web', name: 'Concept Web', bloom: 'Synthesise', desc: 'Map connections between concepts from different lessons and units. Visualise how knowledge areas relate to each other.', ui: 'Node-and-link concept map builder', time: '6\u201310 min', example: 'Connect these concepts: patient consent, mental capacity, safeguarding, confidentiality, duty of care. Label the relationships.' },
            { id: 'career-application-map', name: 'Career Application Map', bloom: 'Synthesise', desc: 'Map what\u2019s been learnt to specific career competencies and goals. Self-assessment with evidence linking.', ui: 'Competency grid with self-assessment', time: '8\u201312 min', example: 'Map each skill area to your career goal. Rate your confidence (1\u20135). Link evidence from your interactions.' }
        ]
    },
    'systems-analyst': {
        name: 'The Analyst',
        subtitle: 'Systems Thinker',
        colour: '#f59e0b',
        blooms: ['Analyse'],
        stages: 'Peer',
        interactions: [
            { id: 'pattern-spotter', name: 'Pattern Spotter', bloom: 'Analyse', desc: 'Identify patterns, trends, or recurring themes in a set of data, scenarios, or case studies.', ui: 'Data cards with pattern annotation', time: '5\u20138 min', example: 'Here are 6 months of customer feedback summaries. What patterns do you see? Which are getting worse?' },
            { id: 'system-mapper', name: 'System Mapper', bloom: 'Analyse', desc: 'Map the components of a system and their relationships \u2014 inputs, outputs, feedback loops, dependencies.', ui: 'System diagram builder with connection types', time: '6\u201310 min', example: 'Map the system around childhood obesity: schools, parents, food industry, NHS, local council. What are the feedback loops?' },
            { id: 'compare-contrast-matrix', name: 'Compare & Contrast Matrix', bloom: 'Analyse', desc: 'Fill in a comparison matrix for 2\u20134 items across multiple criteria. Identify similarities, differences, and implications.', ui: 'Interactive comparison matrix', time: '4\u20136 min', example: 'Compare civil and criminal proceedings across: burden of proof, courts used, possible outcomes, timescales.' },
            { id: 'data-interpreter', name: 'Data Interpreter', bloom: 'Analyse', desc: 'Given a set of data, interpret what it means for the workplace context. Draw conclusions and identify remaining questions.', ui: 'Data display with interpretation fields', time: '4\u20136 min', example: 'Q3 conversion rates: Inbound 12%, Outbound 3%, Referral 28%. Average deal size down 15%. What story does this tell?' }
        ]
    },
    'pattern-connector': {
        name: 'The Connector',
        subtitle: 'Relationship Builder',
        colour: '#ec4899',
        blooms: ['Understand'],
        stages: 'Peer',
        interactions: [
            { id: 'analogy-maker', name: 'Analogy Maker', bloom: 'Understand', desc: 'Create analogies that explain a complex concept in simple terms. Learner generates the analogy and explains why it works.', ui: 'Analogy frame with explanation field', time: '3\u20135 min', example: 'Explain regression testing using an analogy from everyday life. Why does your analogy capture the essential idea?' },
            { id: 'prior-knowledge-bridge', name: 'Prior Knowledge Bridge', bloom: 'Understand', desc: 'Connect new learning to what the learner already knows. AI builds bridges between existing and new concepts.', ui: 'Free text + AI-generated connections', time: '3\u20135 min', example: 'Before we dive in \u2014 what do you already know about risk assessment? Tell me 3 things.' },
            { id: 'cross-domain-linker', name: 'Cross-Domain Linker', bloom: 'Understand', desc: 'Find connections between the current topic and a completely different field. Encourages transfer learning.', ui: 'Two-domain comparison with linking prompts', time: '3\u20135 min', example: 'How does the concept of \u2018triage\u2019 in your field relate to how a product manager prioritises a backlog?' },
            { id: 'personal-relevance-finder', name: 'Personal Relevance Finder', bloom: 'Understand', desc: 'Identify how a concept directly applies to the learner\u2019s current work. Moves from abstract to personal.', ui: 'Weekly planner with concept mapping', time: '3\u20135 min', example: 'Think about your typical Monday. At which three points would data protection principles directly affect what you\u2019re doing?' }
        ]
    },
    'collaboration-guide': {
        name: 'The Collaborator',
        subtitle: 'Discussion Partner',
        colour: '#8b5cf6',
        blooms: ['Understand', 'Analyse'],
        stages: 'Peer',
        interactions: [
            { id: 'idea-exploration', name: 'Idea Exploration', bloom: 'Understand', desc: 'Explore an idea through guided back-and-forth dialogue. The Collaborator builds on the learner\u2019s ideas progressively.', ui: 'Conversational exchange (3\u20134 rounds)', time: '4\u20136 min', example: 'You mentioned early intervention is key. Tell me more \u2014 what does \u2018early\u2019 look like in your context?' },
            { id: 'perspective-swap', name: 'Perspective Swap', bloom: 'Analyse', desc: 'Take on a different role\u2019s perspective and argue their viewpoint. Together they explore how the same situation looks from different angles.', ui: 'Role-play dialogue with perspective labels', time: '5\u20138 min', example: 'I\u2019ll be the customer. You be the complaints manager. Let\u2019s work through this scenario.' },
            { id: 'collaborative-summary', name: 'Collaborative Summary', bloom: 'Understand', desc: 'Build a summary together. The learner writes key points, the Collaborator adds what\u2019s missing and challenges inaccuracies.', ui: 'Text input with AI feedback rounds', time: '4\u20136 min', example: 'Write me 3 key takeaways from this lesson. I\u2019ll tell you what you\u2019ve captured well and what\u2019s missing.' },
            { id: 'joint-problem-solving', name: 'Joint Problem-Solving', bloom: 'Analyse', desc: 'Tackle a problem together \u2014 the learner proposes, the Collaborator builds or suggests alternatives.', ui: 'Alternating contribution panels', time: '5\u20138 min', example: 'Users keep ignoring the password policy. What if we made it easier? How could we make strong passwords less painful?' }
        ]
    },
    'creative-catalyst': {
        name: 'The Catalyst',
        subtitle: 'Creative Innovator',
        colour: '#f97316',
        blooms: ['Create'],
        stages: 'Peer',
        interactions: [
            { id: 'disruptive-thinking', name: 'Disruptive Thinking', bloom: 'Create', desc: 'Challenge assumptions about how things are currently done. The Catalyst pushes the learner to question established practices.', ui: 'Assumption list with challenge prompts', time: '4\u20136 min', example: 'Annual appraisals have been standard for decades. What if you scrapped them entirely? What would you replace them with?' },
            { id: 'boundary-breaker', name: 'Boundary Breaker', bloom: 'Create', desc: 'Take a concept to its extreme. What would happen if you applied this principle to its logical maximum?', ui: 'Extreme scenario with consequence mapping', time: '4\u20136 min', example: 'What if every piece of training was completely personalised \u2014 no two learners ever saw the same content? What breaks?' },
            { id: 'reverse-engineering', name: 'Reverse Engineering', bloom: 'Create', desc: 'Start from the ideal outcome and work backwards. Tests creative planning.', ui: 'Outcome card with reverse-step builder', time: '5\u20138 min', example: 'Imagine the project launched perfectly \u2014 on time, under budget, everyone delighted. What decisions made that happen?' },
            { id: 'innovation-challenge', name: 'Innovation Challenge', bloom: 'Create', desc: 'A time-boxed creative challenge: come up with as many solutions as possible. Quantity first, then refine.', ui: 'Rapid idea input + timer + selection', time: '5\u20137 min', example: '5 minutes: How many ways can you teach phonics without using a worksheet? Now pick your top 3 and tell me why.' }
        ]
    },
    'practical-builder': {
        name: 'The Practitioner',
        subtitle: 'Hands-On Specialist',
        colour: '#14b8a6',
        blooms: ['Apply'],
        stages: 'Peer',
        interactions: [
            { id: 'hands-on-simulation', name: 'Hands-On Simulation', bloom: 'Apply', desc: 'A step-by-step practical simulation where the learner \u201cdoes\u201d a workplace task. Each step requires a decision or action.', ui: 'Multi-step action wizard', time: '5\u201310 min', example: 'A patient presents with two prescriptions. Walk through: check labels, verify interactions, prepare dispensing, counsel the patient.' },
            { id: 'tool-selection', name: 'Tool Selection', bloom: 'Apply', desc: 'Given a workplace task, select the right tool, method, or approach from a set of options and explain why.', ui: 'Task card with tool selection + justification', time: '3\u20135 min', example: 'A client needs a contact form with file upload, validation, and email notification. Which tools would you use? Why?' },
            { id: 'troubleshooter', name: 'Troubleshooter', bloom: 'Apply', desc: 'Something\u2019s gone wrong \u2014 diagnose and fix it. The learner receives symptoms and must systematically work through diagnostic steps.', ui: 'Symptom card + diagnostic step builder', time: '5\u20138 min', example: 'Users in Building B can\u2019t access the shared drive. Users in Building A are fine. Internet works everywhere. Diagnose.' },
            { id: 'quality-check', name: 'Quality Check', bloom: 'Apply', desc: 'Review a piece of work against quality criteria and provide structured feedback. Learner applies quality standards from the LO.', ui: 'Work sample with annotation + checklist', time: '5\u20138 min', example: 'Review this press release against the style guide. Mark issues, categorise them (grammar, tone, accuracy, brand), suggest corrections.' }
        ]
    }
};


// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Escapes HTML characters to prevent XSS when inserting developer-controlled strings.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Updates the interactions section for the currently selected character.
 * Called when the character dropdown changes, and on initial page load.
 *
 * @param {string} characterId - The character-select dropdown value (e.g. 'foundation-builder')
 */
function updateInteractionsSection(characterId) {
    const container = document.getElementById('interactions-container');
    if (!container) return;

    const charData = CHARACTER_INTERACTIONS[characterId];

    // If this character has no interactions defined, show a placeholder
    if (!charData || !charData.interactions || charData.interactions.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 13px; padding: 16px 0;">No interaction templates defined for this character yet.</p>';
        // Update the count badge
        const countBadge = document.getElementById('interactions-count-badge');
        if (countBadge) countBadge.textContent = '0';
        return;
    }

    const interactions = charData.interactions;
    const colour = charData.colour;

    // Update the count badge
    const countBadge = document.getElementById('interactions-count-badge');
    if (countBadge) countBadge.textContent = interactions.length.toString();

    // Update the subtitle
    const subtitleEl = document.getElementById('interactions-subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = charData.blooms.join(' \u00b7 ') + ' \u2014 Stage ' + charData.stages;
    }

    // Build the interaction cards grid
    var cardsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px;">';

    interactions.forEach(function(interaction) {
        var bloomColour = BLOOM_COLOURS[interaction.bloom] || '#6b7c93';
        var bloomBg = BLOOM_BG_COLOURS[interaction.bloom] || 'rgba(107, 124, 147, 0.15)';
        var borderColour = colour + '40'; // 25% opacity

        cardsHtml += '\
        <div class="int-card" style="background: rgba(13, 30, 54, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(26, 58, 92, 0.5); border-left: 3px solid ' + escapeHtml(colour) + '; border-radius: 12px; padding: 16px; transition: all 0.3s ease;">\
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">\
                <span style="color: #ffffff; font-size: 14px; font-weight: 600;">' + escapeHtml(interaction.name) + '</span>\
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 4px; background: ' + bloomBg + '; color: ' + bloomColour + '; flex-shrink: 0; margin-left: 8px;">' + escapeHtml(interaction.bloom) + '</span>\
            </div>\
            <p style="color: #b8c5d6; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">' + escapeHtml(interaction.desc) + '</p>\
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 8px 10px; margin-bottom: 10px;">\
                <span style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Example</span>\
                <span style="color: #6b7c93; font-size: 11px; font-style: italic; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">' + escapeHtml(interaction.example) + '</span>\
            </div>\
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.04);">\
                <div style="display: flex; align-items: center; gap: 4px;">\
                    <span style="width: 4px; height: 4px; border-radius: 50%; background: rgba(0, 217, 192, 0.6);"></span>\
                    <span style="font-size: 11px; color: rgba(0, 217, 192, 0.6); font-weight: 500;">' + escapeHtml(interaction.ui) + '</span>\
                </div>\
                <span style="font-size: 11px; color: #6b7c93;">' + escapeHtml(interaction.time) + '</span>\
            </div>\
            <div style="display: flex; gap: 6px; margin-top: 10px;">\
                <button onclick="handleEditInteractionPrompt(\'' + escapeHtml(interaction.id) + '\')" style="flex: 1; background: rgba(0,217,192,0.1); border: 1px solid rgba(0,217,192,0.25); color: #00d9c0; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-family: inherit; transition: all 0.3s ease;">Edit Template</button>\
                <button onclick="handlePreviewInteraction(\'' + escapeHtml(interaction.id) + '\')" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-family: inherit; transition: all 0.3s ease;">Preview</button>\
            </div>\
        </div>';
    });

    cardsHtml += '</div>';
    container.innerHTML = cardsHtml;
}

/**
 * Handles the "Edit Template" button click for an interaction.
 * Currently shows a toast — will open a prompt editor in a future release.
 * @param {string} interactionId - The interaction template ID
 */
function handleEditInteractionPrompt(interactionId) {
    if (typeof showToast === 'function') {
        showToast('Prompt template editor for \u201c' + interactionId + '\u201d \u2014 coming soon in Phase 2', 'info');
    }
}

/**
 * Handles the "Preview" button click for an interaction.
 * Currently shows a toast — will generate a sample interaction in a future release.
 * @param {string} interactionId - The interaction template ID
 */
function handlePreviewInteraction(interactionId) {
    if (typeof showToast === 'function') {
        showToast('Interaction preview for \u201c' + interactionId + '\u201d \u2014 coming soon in Phase 2', 'info');
    }
}

/**
 * Toggles the expanded/collapsed state of the interactions section.
 */
function toggleInteractionsSection() {
    var container = document.getElementById('interactions-container');
    var toggleBtn = document.getElementById('interactions-toggle-btn');
    if (!container || !toggleBtn) return;

    var isHidden = container.style.display === 'none';
    container.style.display = isHidden ? 'block' : 'none';
    toggleBtn.textContent = isHidden ? '\u25B2' : '\u25BC';

    // Store state in localStorage
    try {
        localStorage.setItem('zavmo_interactions_expanded', isHidden ? 'true' : 'false');
    } catch (e) {
        // localStorage may be unavailable — fail silently
    }
}

/**
 * Initialises the interactions section on page load.
 * Hooks into the character-select dropdown change event.
 */
function initInteractionsSection() {
    var characterSelect = document.getElementById('character-select');
    if (!characterSelect) return;

    // Render for the initially selected character
    updateInteractionsSection(characterSelect.value);

    // Listen for character changes (use capture to ensure we run after other handlers)
    characterSelect.addEventListener('change', function() {
        updateInteractionsSection(this.value);
    });

    // Restore expanded/collapsed state
    try {
        var stored = localStorage.getItem('zavmo_interactions_expanded');
        if (stored === 'false') {
            var container = document.getElementById('interactions-container');
            var toggleBtn = document.getElementById('interactions-toggle-btn');
            if (container) container.style.display = 'none';
            if (toggleBtn) toggleBtn.textContent = '\u25BC';
        }
    } catch (e) {
        // localStorage may be unavailable
    }
}
