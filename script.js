// script.js - Core Controller for Java DSA Learning Hub

// Global App State
const state = {
    activeUnitId: null,
    activeTopicId: null,
    activeView: 'home', // 'home', 'learn', 'cheat', 'dict'
    activeIspoType: null, // 'input', 'storage', 'process', 'output'
    currentVisualizer: null,
    quizScore: 0,
    answeredQuestions: new Set()
};

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    buildSidebar();
    buildSyntaxDictionary();
    setupEventListeners();
    
    // Check initial hash route
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
});

// Build collapsible Sidebar Navigation from data.js
function buildSidebar() {
    const navMenu = document.getElementById('nav-menu-container');
    if (!navMenu) return;
    navMenu.innerHTML = '';

    JavaDSACurriculum.units.forEach((unit, index) => {
        const group = document.createElement('div');
        group.className = 'unit-group';
        group.setAttribute('data-unit-group', unit.id);
        if (index === 0) group.classList.add('open'); // first unit expanded by default

        // Clickable unit header (accordion toggle)
        const header = document.createElement('button');
        header.className = 'unit-header';
        header.innerHTML = `
            <span class="unit-chevron">▸</span>
            <span class="unit-name">${unit.title}</span>
            <span class="unit-count">${unit.topics.length}</span>
        `;
        header.addEventListener('click', () => group.classList.toggle('open'));
        group.appendChild(header);

        // Collapsible topic list
        const topicsWrap = document.createElement('div');
        topicsWrap.className = 'unit-topics';

        unit.topics.forEach(topic => {
            const item = document.createElement('div');
            item.className = 'topic-item';
            item.setAttribute('data-unit', unit.id);
            item.setAttribute('data-topic', topic.id);
            item.textContent = topic.title;

            item.addEventListener('click', () => {
                window.location.hash = `#unit=${unit.id}&topic=${topic.id}`;
            });

            topicsWrap.appendChild(item);
        });

        group.appendChild(topicsWrap);
        navMenu.appendChild(group);
    });

    // "No results" message for search
    const noRes = document.createElement('div');
    noRes.id = 'nav-no-results';
    noRes.textContent = 'No topics match your search.';
    navMenu.appendChild(noRes);
}

// Global Routing
function handleRouting() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    
    const unitId = params.get('unit');
    const topicId = params.get('topic');
    const view = params.get('view') || 'home';

    // Stop current visualizers if running
    if (state.currentVisualizer) {
        state.currentVisualizer.stop();
        state.currentVisualizer = null;
    }

    state.activeIspoType = null;

    if (unitId && topicId) {
        state.activeUnitId = unitId;
        state.activeTopicId = topicId;
        state.activeView = 'learn';
        renderTopicView(unitId, topicId);
        updateSidebarActiveState(unitId, topicId);
        switchView('learn');
    } else if (view === 'cheat') {
        state.activeView = 'cheat';
        renderCheatSheetView();
        switchView('cheat');
    } else if (view === 'dict') {
        state.activeView = 'dict';
        renderDictView();
        switchView('dict');
    } else {
        state.activeView = 'home';
        switchView('home');
    }
}

// Switch between panels
function switchView(viewName) {
    const viewIds = ['home-view', 'learn-view', 'cheat-view', 'dict-view'];
    viewIds.forEach(id => {
        const viewEl = document.getElementById(id);
        if (viewEl) {
            viewEl.style.display = id === `${viewName}-view` ? 'block' : 'none';
        }
    });

    // Update Header tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const targetView = btn.getAttribute('data-view');
        if (targetView === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Clear breadcrumb outside the learn view
    const bc = document.getElementById('breadcrumb');
    if (bc && viewName !== 'learn') bc.textContent = '';
}

// Sidebar Active styling + auto-expand active unit
function updateSidebarActiveState(unitId, topicId) {
    document.querySelectorAll('.topic-item').forEach(item => {
        const u = item.getAttribute('data-unit');
        const t = item.getAttribute('data-topic');
        const isActive = (u === unitId && t === topicId);
        item.classList.toggle('active', isActive);
        if (isActive) {
            const group = item.closest('.unit-group');
            if (group) group.classList.add('open');
            try { item.scrollIntoView({ block: 'nearest' }); } catch (e) { /* no-op */ }
        }
    });
}

// Setup static DOM events
function setupEventListeners() {
    // Header navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-view');
            if (targetView === 'home') {
                window.location.hash = '';
            } else {
                window.location.hash = `#view=${targetView}`;
            }
        });
    });

    // Close dict modal click
    const modalClose = document.getElementById('close-modal-btn');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            const overlay = document.getElementById('dict-modal-overlay');
            if (overlay) overlay.classList.remove('active');
        });
    }

    // Sidebar search (filters topics, hides empty units, auto-expands matches)
    const searchBar = document.getElementById('sidebar-search');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            let anyMatch = false;

            document.querySelectorAll('.unit-group').forEach(group => {
                let groupHasMatch = false;
                group.querySelectorAll('.topic-item').forEach(item => {
                    const match = item.textContent.toLowerCase().includes(query);
                    item.style.display = match ? 'flex' : 'none';
                    if (match) groupHasMatch = true;
                });
                group.style.display = groupHasMatch ? 'block' : 'none';
                if (query) group.classList.toggle('open', groupHasMatch);
                anyMatch = anyMatch || groupHasMatch;
            });

            const noRes = document.getElementById('nav-no-results');
            if (noRes) noRes.style.display = anyMatch ? 'none' : 'block';

            // Restore default collapsed view when the query is cleared
            if (!query) {
                document.querySelectorAll('.unit-group').forEach(g => g.classList.remove('open'));
                const activeItem = document.querySelector('.topic-item.active');
                const groupToOpen = activeItem
                    ? activeItem.closest('.unit-group')
                    : document.querySelector('.unit-group');
                if (groupToOpen) groupToOpen.classList.add('open');
            }
        });
    }

    // Dismiss dict modal on backdrop click or Escape
    const modalOverlay = document.getElementById('dict-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const o = document.getElementById('dict-modal-overlay');
            if (o) o.classList.remove('active');
        }
    });

    // Brand logo returns to home
    const brand = document.querySelector('.brand-section');
    if (brand) {
        brand.style.cursor = 'pointer';
        brand.addEventListener('click', () => { window.location.hash = ''; });
    }
}

// Render active curriculum details
function renderTopicView(unitId, topicId) {
    const unit = JavaDSACurriculum.units.find(u => u.id === unitId);
    if (!unit) return;
    const topic = unit.topics.find(t => t.id === topicId);
    if (!topic) return;

    // Breadcrumb + Title & Badges
    const bc = document.getElementById('breadcrumb');
    if (bc) bc.textContent = `${unit.title}  ›  ${topic.title}`;

    document.getElementById('topic-title').textContent = topic.title;
    document.getElementById('topic-desc').textContent = topic.description;
    document.getElementById('complexity-time').textContent = `Time: ${topic.complexity.time}`;
    document.getElementById('complexity-space').textContent = `Space: ${topic.complexity.space}`;

    // Cheat Sheet Code
    document.getElementById('topic-cheatsheet').textContent = topic.cheatSheet;

    // Code & ISPO highlights loader
    renderCodeExplorer(topic);

    // Initialise Visualizer
    setupTopicVisualizer(topic);

    // Initialise Quiz
    renderQuiz(topic);
}

// Setup Interactive Code Explorer with Line highlights
function renderCodeExplorer(topic) {
    const codeContainer = document.getElementById('code-body-container');
    const ispoControls = document.getElementById('ispo-controls-container');
    if (!codeContainer || !ispoControls) return;

    // Clear previous
    codeContainer.innerHTML = '';
    ispoControls.innerHTML = '';

    // Split code line-by-line and populate spans
    const lines = topic.code.split('\n');
    lines.forEach((line, idx) => {
        const lineSpan = document.createElement('span');
        lineSpan.className = 'code-line';
        lineSpan.setAttribute('data-line', idx + 1);
        lineSpan.textContent = line || ' '; // Keep spacing
        
        // Show tooltip on line click if matched to ISPO
        lineSpan.addEventListener('click', () => {
            const matchedIspo = topic.ispo.find(item => (idx + 1) >= item.start && (idx + 1) <= item.end);
            if (matchedIspo) {
                // Glow type key
                activateIspoType(matchedIspo.type, topic);
            }
        });

        codeContainer.appendChild(lineSpan);
    });

    // Generate ISPO segment selection buttons
    const categories = [
        { type: 'input', label: 'Input', desc: 'Parameters & Data intake' },
        { type: 'storage', label: 'Storage', desc: 'Variables, arrays & memory nodes' },
        { type: 'process', label: 'Process', desc: 'Control loops & logical steps' },
        { type: 'output', label: 'Output', desc: 'Return values & console outputs' }
    ];

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `ispo-btn ${cat.type}-type`;
        btn.innerHTML = `
            <span class="btn-title">${cat.label}</span>
            <span class="btn-desc">${cat.desc}</span>
        `;
        
        btn.addEventListener('click', () => {
            if (state.activeIspoType === cat.type) {
                // Toggle off
                clearIspoHighlights();
                state.activeIspoType = null;
                btn.classList.remove('active');
            } else {
                activateIspoType(cat.type, topic);
            }
        });

        ispoControls.appendChild(btn);
    });
}

// Clear all highlights
function clearIspoHighlights() {
    document.querySelectorAll('.ispo-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.code-line').forEach(line => {
        line.classList.remove('highlight-input', 'highlight-storage', 'highlight-process', 'highlight-output');
    });
    
    // Clear code helper text panel
    const detailPanel = document.getElementById('ispo-detail-text');
    if (detailPanel) {
        detailPanel.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">Click an ISPO aspect above or click directly on any highlighted line of code to see detailed analysis.</span>';
    }
}

// Activate ISPO selection
function activateIspoType(type, topic) {
    clearIspoHighlights();
    state.activeIspoType = type;

    // Highlight button
    const btn = document.querySelector(`.ispo-btn.${type}-type`);
    if (btn) btn.classList.add('active');

    // Highlight line ranges and append helper analysis text
    const segments = topic.ispo.filter(item => item.type === type);
    const detailPanel = document.getElementById('ispo-detail-text');
    if (detailPanel) detailPanel.innerHTML = '';

    if (segments.length === 0) {
        if (detailPanel) {
            detailPanel.innerHTML = `<p style="color: var(--text-muted)">No explicit <strong>${type.toUpperCase()}</strong> lines identified in this code segment.</p>`;
        }
        return;
    }

    // Populate lines & explanations
    segments.forEach(seg => {
        // Line styling
        for (let l = seg.start; l <= seg.end; l++) {
            const el = document.querySelector(`.code-line[data-line="${l}"]`);
            if (el) {
                el.classList.add(`highlight-${type}`);
            }
        }

        // Add paragraph details to side panel
        if (detailPanel) {
            const p = document.createElement('div');
            p.style.marginBottom = '12px';
            p.innerHTML = `
                <p style="font-weight: 700; color: #fff; font-size: 14px; margin-bottom: 4px;">Lines ${seg.start}–${seg.end}:</p>
                <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">${seg.desc}</p>
            `;
            detailPanel.appendChild(p);
        }
    });
}

// Initialise custom Visualizer canvas
function setupTopicVisualizer(topic) {
    const canvas = document.getElementById('visualizer-canvas');
    const container = document.getElementById('visualizer-container');
    if (!canvas || !container) return;

    // Check if visualizer is supported for this topic
    const supportedTopics = ["binary_search", "bubble_sort", "stack_impl", "circular_queue", "reverse_ll", "bst_insert_search"];
    
    if (!supportedTopics.includes(topic.id)) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    // Instantiate visualizer from visualizers.js
    const visualizer = initializeVisualizer(topic.id, 'visualizer-canvas');
    if (visualizer) {
        state.currentVisualizer = visualizer;
        
        // Connect buttons
        const prevBtn = document.getElementById('viz-prev-btn');
        const nextBtn = document.getElementById('viz-next-btn');
        const resetBtn = document.getElementById('viz-reset-btn');

        // Clear previous listeners (cloning nodes replaces them)
        const newPrev = prevBtn.cloneNode(true);
        const newNext = nextBtn.cloneNode(true);
        const newReset = resetBtn.cloneNode(true);

        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        resetBtn.parentNode.replaceChild(newReset, resetBtn);

        newPrev.addEventListener('click', () => visualizer.prev());
        newNext.addEventListener('click', () => visualizer.next());
        newReset.addEventListener('click', () => visualizer.reset());
        
        visualizer.reset();
    }
}

// Render active topic self-assessment Quiz
function renderQuiz(topic) {
    const container = document.getElementById('quiz-body-container');
    if (!container) return;

    container.innerHTML = '';
    
    if (!topic.quiz || topic.quiz.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No quiz questions for this topic.</p>';
        return;
    }

    topic.quiz.forEach((qObj, qIdx) => {
        const qCard = document.createElement('div');
        qCard.style.marginBottom = '20px';
        qCard.innerHTML = `<p style="font-weight: 600; margin-bottom: 12px; font-size: 15px; color: var(--text-main);">${qIdx + 1}. ${qObj.q}</p>`;

        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.flexDirection = 'column';
        optionsContainer.style.gap = '8px';

        qObj.o.forEach((opt, oIdx) => {
            const optEl = document.createElement('div');
            optEl.className = 'quiz-option';
            optEl.textContent = opt;
            
            optEl.addEventListener('click', () => {
                const questionKey = `${topic.id}_q_${qIdx}`;
                if (state.answeredQuestions.has(questionKey)) return; // Allow answering only once

                state.answeredQuestions.add(questionKey);
                
                // Highlight options
                const siblings = optionsContainer.children;
                if (oIdx === qObj.a) {
                    optEl.classList.add('correct');
                } else {
                    optEl.classList.add('wrong');
                    siblings[qObj.a].classList.add('correct'); // Highlight correct sibling
                }
            });

            optionsContainer.appendChild(optEl);
        });

        qCard.appendChild(optionsContainer);
        container.appendChild(qCard);
    });
}

// Render Cheat Sheets tab
function renderCheatSheetView() {
    const listContainer = document.getElementById('cheatsheet-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    JAVA_SYNTAX_DICT.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginBottom = '24px';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="color:var(--primary); font-weight:700;">${item.name}</h3>
                <span class="complexity-badge">${item.type}</span>
            </div>
            <p style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">${item.desc}</p>
            <pre style="background:#0d0b13; padding:16px; border:1px solid var(--border-color); border-radius:8px; font-family:'JetBrains Mono', monospace; font-size:13px; overflow-x:auto; color: #fff;">${item.syntax}</pre>
        `;
        listContainer.appendChild(card);
    });
}

// Build & Populate Syntax Dictionary View
function buildSyntaxDictionary() {
    const dictContainer = document.getElementById('dict-list-container');
    if (!dictContainer) return;
    dictContainer.innerHTML = '';

    // Create cards
    JAVA_SYNTAX_DICT.forEach(item => {
        const card = document.createElement('div');
        card.className = 'dict-card';
        card.innerHTML = `
            <div class="dict-header">
                <span class="dict-title">${item.name}</span>
                <span class="dict-tag">${item.type}</span>
            </div>
            <p class="dict-desc">${item.desc.substring(0, 75)}...</p>
        `;
        
        card.addEventListener('click', () => {
            showDictModal(item);
        });

        dictContainer.appendChild(card);
    });
}

// Dict view search / categories
function renderDictView() {
    // Already loaded by buildSyntaxDictionary on initial load. Let's make sure it handles live search.
    const searchBar = document.getElementById('dict-search-input');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.dict-card').forEach(card => {
                const title = card.querySelector('.dict-title').textContent.toLowerCase();
                const desc = card.querySelector('.dict-desc').textContent.toLowerCase();
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Show overlay details for syntax helper
function showDictModal(item) {
    const overlay = document.getElementById('dict-modal-overlay');
    const modalTitle = document.getElementById('modal-title-text');
    const modalType = document.getElementById('modal-type-tag');
    const modalDesc = document.getElementById('modal-desc-text');
    const modalCode = document.getElementById('modal-code-body');

    if (!overlay || !modalTitle || !modalDesc || !modalCode) return;

    modalTitle.textContent = item.name;
    modalType.textContent = item.type;
    modalDesc.textContent = item.desc;
    modalCode.textContent = item.syntax;

    overlay.classList.add('active');
}
