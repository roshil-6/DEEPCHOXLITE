// ============================================
// DEEPCHOX - Personal Execution OS
// COMPLETELY REDESIGNED - Clean Architecture
// ============================================

// Global AppState - All methods use AppState directly (no 'this' binding issues)
const AppState = {
    // State
    currentSection: 'dashboard',
    currentContext: null,
    rawTasks: [],
    organisedTasks: [],
    workflows: [],
    workflowVersions: {},
    activeWorkflow: null,
    executionHistory: [],
    calendarData: {},
    dailyCommitment: '',
    todayWorkSummary: null,
    documentationHistory: {},
    aiMode: true,
    
    // ============================================
    // CORE METHODS
    // ============================================
    
    init() {
        console.log('🚀 Deepchox Initializing...');
        
        try {
            // Show dashboard immediately
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.style.display = 'block';
                dashboard.style.setProperty('display', 'block', 'important');
                dashboard.classList.add('active');
            }
            
            // Load data
            AppState.loadFromStorage();
            
            // Setup all sections
            AppState.setupNavigation();
            AppState.setupDashboardSection();
            AppState.setupSnapshotSection();
            AppState.setupTodaySection();
            AppState.setupWorkflowSection();
            AppState.setupWorkloadSection();
            AppState.setupAnalyzerSection();
            AppState.setupCalendarSection();
            AppState.setupInsightsSection();
            AppState.setupDocumentationSection();
            AppState.setupQuickViewSection();
            AppState.setupFeaturesPage();
            AppState.initParticleCanvas();
            AppState.initFlowMind();
            
            // Initial render
            setTimeout(() => {
                AppState.switchSection('dashboard');
                AppState.updateAllSectionsGlobally();
            }, 100);
            
            console.log('✅ Deepchox Ready');
        } catch (error) {
            console.error('❌ Init Error:', error);
            alert('App initialization error. Please refresh.');
        }
    },
    
    saveToStorage() {
        try {
            const data = {
                rawTasks: AppState.rawTasks,
                organisedTasks: AppState.organisedTasks,
                workflows: AppState.workflows,
                workflowVersions: AppState.workflowVersions,
                activeWorkflow: AppState.activeWorkflow,
                executionHistory: AppState.executionHistory,
                calendarData: AppState.calendarData,
                dailyCommitment: AppState.dailyCommitment || '',
                todayWorkSummary: AppState.todayWorkSummary,
                documentationHistory: AppState.documentationHistory,
                aiMode: AppState.aiMode
            };
            localStorage.setItem('deepchox', JSON.stringify(data));
        } catch (e) {
            console.error('Save error:', e);
        }
    },
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('deepchox');
            if (stored) {
                const data = JSON.parse(stored);
                AppState.rawTasks = (data.rawTasks || []).map(t => AppState.enrichTask(t));
                AppState.organisedTasks = data.organisedTasks || [];
                AppState.workflows = data.workflows || [];
                AppState.workflowVersions = data.workflowVersions || {};
                AppState.activeWorkflow = data.activeWorkflow || null;
                AppState.executionHistory = data.executionHistory || [];
                AppState.calendarData = data.calendarData || {};
                AppState.dailyCommitment = data.dailyCommitment || '';
                AppState.todayWorkSummary = data.todayWorkSummary || null;
                AppState.documentationHistory = data.documentationHistory || {};
                AppState.aiMode = data.aiMode !== undefined ? data.aiMode : true;
            }
        } catch (e) {
            console.error('Load error:', e);
        }
    },
    
    enrichTask(task) {
        try {
            if (!task.metadata) {
                if (AppState.aiMode && typeof FlowMind !== 'undefined' && FlowMind && FlowMind.analyzeTask) {
                    task.metadata = FlowMind.analyzeTask(task);
                } else {
                    task.metadata = {
                        clarity: 0.7,
                        effort: 'medium',
                        executionType: 'do',
                        readiness: 0.5
                    };
                }
            }
            if (!task.editCount) task.editCount = 0;
            if (!task.skipCount) task.skipCount = 0;
            if (!task.status) task.status = 'pending';
            if (!task.completionState) task.completionState = 'pending';
            return task;
        } catch (error) {
            console.error('Enrich error:', error);
            task.metadata = { clarity: 0.7, effort: 'medium', executionType: 'do', readiness: 0.5 };
            task.editCount = 0;
            task.skipCount = 0;
            task.status = 'pending';
            task.completionState = 'pending';
            return task;
        }
    },
    
    // ============================================
    // NAVIGATION - REDESIGNED
    // ============================================
    
    switchSection(sectionId) {
        if (!sectionId) {
            console.warn('switchSection: No sectionId provided');
            return;
        }
        
        console.log(`📍 Switching to: ${sectionId}`);
        
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(sec => {
            sec.classList.remove('active');
            sec.style.display = 'none';
        });
        
        // Show target section
        const target = document.getElementById(sectionId);
        if (!target) {
            console.error(`Section "${sectionId}" not found!`);
            return;
        }
        
        target.classList.add('active');
        target.style.display = 'block';
        target.style.setProperty('display', 'block', 'important');
        AppState.currentSection = sectionId;
        
        // Update navigation
        if (AppState.updateFloatingNavigation) AppState.updateFloatingNavigation();
        if (AppState.updateFloatingMenu) AppState.updateFloatingMenu();
        if (AppState.updateBackButtons) AppState.updateBackButtons();
        
        // Update section content
        setTimeout(() => {
            AppState.updateAllSections();
            if (sectionId === 'features' && AppState.updateFeaturesPage) {
                AppState.updateFeaturesPage();
            }
            if (sectionId === 'dashboard' && AppState.renderMainCalendarWidget) {
                AppState.renderMainCalendarWidget();
            }
        }, 50);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // ============================================
    // DASHBOARD SECTION - REDESIGNED
    // ============================================
    
    setupDashboardSection() {
        console.log('Setting up Dashboard...');
        
        // Add Task Button
        const mainAddTaskBtn = document.getElementById('mainAddTaskBtn');
        const mainTaskInput = document.getElementById('mainTaskInput');
        
        const handleAddTask = () => {
            if (!mainTaskInput) return;
            const text = mainTaskInput.value.trim();
            if (!text) return;
            
            console.log('➕ Adding task:', text);
            
            const task = AppState.enrichTask({
                text,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                completionState: 'pending',
                status: 'pending'
            });
            
            AppState.rawTasks.push(task);
            AppState.saveToStorage();
            mainTaskInput.value = '';
            
            // Update UI
            AppState.renderMainTasks();
            AppState.updateAllSectionsGlobally();
            
            // Visual feedback
            if (mainAddTaskBtn) {
                mainAddTaskBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (mainAddTaskBtn) mainAddTaskBtn.style.transform = '';
                }, 150);
            }
        };
        
        if (mainAddTaskBtn) {
            mainAddTaskBtn.onclick = handleAddTask;
            mainAddTaskBtn.ontouchend = (e) => {
                e.preventDefault();
                handleAddTask();
            };
        }
        
        if (mainTaskInput) {
            mainTaskInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                }
            };
        }
        
        // Quick Notes
        const saveQuickNotesBtn = document.getElementById('saveQuickNotesBtn');
        const mainQuickNotes = document.getElementById('mainQuickNotes');
        
        if (saveQuickNotesBtn && mainQuickNotes) {
            saveQuickNotesBtn.onclick = () => {
                localStorage.setItem('deepchox_quickNotes', mainQuickNotes.value);
                saveQuickNotesBtn.textContent = 'Saved!';
                setTimeout(() => {
                    saveQuickNotesBtn.textContent = 'Save Notes';
                }, 2000);
            };
        }
        
        // Load saved notes
        if (mainQuickNotes) {
            const saved = localStorage.getItem('deepchox_quickNotes');
            if (saved) mainQuickNotes.value = saved;
            
            const notesCharCount = document.getElementById('notesCharCount');
            if (notesCharCount) {
                mainQuickNotes.oninput = () => {
                    notesCharCount.textContent = mainQuickNotes.value.length + ' characters';
                };
            }
        }
        
        // Navigation Buttons
        AppState.attachButton('mainViewDocsBtn', () => AppState.switchSection('documentation'));
        AppState.attachButton('mainViewAnalyzerBtn', () => AppState.switchSection('analyzer'));
        AppState.attachButton('mainViewWorkflowBtn', () => AppState.switchSection('workflow'));
        AppState.attachButton('viewMoreFeaturesBtn', () => AppState.switchSection('features'));
        
        // AI Organizer
        const mainOrganizeBtn = document.getElementById('mainOrganizeBtn');
        if (mainOrganizeBtn) {
            mainOrganizeBtn.onclick = () => {
                if (AppState.rawTasks.length === 0) {
                    alert('Please add tasks first');
                    return;
                }
                AppState.organiseTasks();
                setTimeout(() => AppState.switchSection('workflow'), 100);
            };
        }
        
        // Initial render
        AppState.renderMainTasks();
        AppState.updateMainDashboard();
    },
    
    // Universal button attachment helper
    attachButton(id, handler) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler();
            };
            btn.ontouchend = (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler();
            };
        }
    },
    
    // Render main tasks list
    renderMainTasks() {
        const list = document.getElementById('mainTasksList');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (AppState.rawTasks.length === 0) {
            list.innerHTML = '<p class="empty-state-small">No tasks yet</p>';
            return;
        }
        
        AppState.rawTasks.forEach((task, index) => {
            const item = document.createElement('div');
            item.className = 'main-task-item';
            item.innerHTML = `
                <span class="task-number">${index + 1}.</span>
                <span class="task-text">${task.text}</span>
                <button class="task-delete-btn" data-task-id="${task.id}">×</button>
            `;
            
            const deleteBtn = item.querySelector('.task-delete-btn');
            if (deleteBtn) {
                deleteBtn.onclick = () => {
                    AppState.rawTasks = AppState.rawTasks.filter(t => t.id !== task.id);
                    AppState.saveToStorage();
                    AppState.renderMainTasks();
                    AppState.updateAllSectionsGlobally();
                };
            }
            
            list.appendChild(item);
        });
    },
    
    // Render calendar widget
    renderMainCalendarWidget() {
        const widget = document.getElementById('mainCalendarWidget');
        if (!widget) return;
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        widget.innerHTML = '';
        
        // Month header
        const header = document.createElement('div');
        header.className = 'main-calendar-header';
        header.textContent = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        widget.appendChild(header);
        
        // Day headers
        const dayHeaders = document.createElement('div');
        dayHeaders.className = 'main-calendar-day-headers';
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
            const h = document.createElement('div');
            h.className = 'main-calendar-day-header';
            h.textContent = day;
            dayHeaders.appendChild(h);
        });
        widget.appendChild(dayHeaders);
        
        // Grid
        const grid = document.createElement('div');
        grid.className = 'main-calendar-grid';
        
        // Empty cells
        for (let i = 0; i < startingDayOfWeek; i++) {
            const empty = document.createElement('div');
            empty.className = 'main-calendar-day empty';
            grid.appendChild(empty);
        }
        
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'main-calendar-day';
            dayEl.textContent = day;
            
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayEl.classList.add('today');
            }
            
            if (AppState.calendarData[dateKey]) {
                dayEl.classList.add('has-activity');
            }
            
            dayEl.onclick = () => AppState.switchSection('calendar');
            dayEl.ontouchend = (e) => {
                e.preventDefault();
                AppState.switchSection('calendar');
            };
            
            grid.appendChild(dayEl);
        }
        
        widget.appendChild(grid);
    },
    
    // Update main dashboard
    updateMainDashboard() {
        const dashTasksCount = document.getElementById('dashTasksCount');
        if (dashTasksCount) dashTasksCount.textContent = AppState.rawTasks.length;
        
        AppState.renderMainTasks();
        AppState.renderMainCalendarWidget();
        
        const mainOrganizerStatus = document.getElementById('mainOrganizerStatus');
        if (mainOrganizerStatus) {
            if (AppState.rawTasks.length > 0) {
                mainOrganizerStatus.innerHTML = `<p>${AppState.rawTasks.length} task${AppState.rawTasks.length !== 1 ? 's' : ''} ready to organize</p>`;
            } else {
                mainOrganizerStatus.innerHTML = '<p>Ready to organize tasks</p>';
            }
        }
        
        const mainMomentum = document.getElementById('mainMomentum');
        const mainProgress = document.getElementById('mainProgress');
        if (mainMomentum) {
            const history = AppState.executionHistory || [];
            const recent = history.slice(-10);
            const completes = recent.filter(e => e.type === 'task_complete').length;
            if (completes >= 4) mainMomentum.textContent = 'High';
            else if (completes >= 2) mainMomentum.textContent = 'Stable';
            else mainMomentum.textContent = 'Low';
        }
        if (mainProgress) {
            const total = AppState.rawTasks.length;
            const completed = AppState.rawTasks.filter(t => t.status === 'completed').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            mainProgress.textContent = progress + '%';
        }
        
        const mainDocsSummary = document.getElementById('mainDocsSummary');
        if (mainDocsSummary) {
            const today = new Date().toDateString();
            const todayDoc = AppState.documentationHistory && AppState.documentationHistory[today];
            if (todayDoc) {
                mainDocsSummary.innerHTML = `<p class="docs-text">Today's work documented</p>`;
            } else {
                mainDocsSummary.innerHTML = `<p class="docs-text">No documentation yet</p>`;
            }
        }
    },
    
    updateDashboardStats() {
        AppState.updateMainDashboard();
        
        const dashTasksCount = document.getElementById('dashTasksCount');
        const dashCompletedCount = document.getElementById('dashCompletedCount');
        const dashProgress = document.getElementById('dashProgress');
        const dashMomentum = document.getElementById('dashMomentum');
        
        if (dashTasksCount) dashTasksCount.textContent = AppState.rawTasks.length;
        
        const totalTasks = AppState.rawTasks.length;
        const completedTasks = AppState.rawTasks.filter(t => t.completionState === 'completed').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        if (dashCompletedCount) dashCompletedCount.textContent = completedTasks;
        if (dashProgress) dashProgress.textContent = progress + '%';
        
        if (dashMomentum) {
            const recentCompletions = AppState.executionHistory.filter(e => 
                e.type === 'task_complete' && Date.now() - e.timestamp < 3600000
            ).length;
            
            if (recentCompletions > 3) dashMomentum.textContent = 'High';
            else if (recentCompletions > 1) dashMomentum.textContent = 'Good';
            else dashMomentum.textContent = 'Low';
        }
    },
    
    // ============================================
    // NAVIGATION SETUP - REDESIGNED
    // ============================================
    
    setupNavigation() {
        AppState.setupFloatingNavigation();
        AppState.setupFloatingMenu();
        AppState.setupSwipeGestures();
        AppState.setupBackButtons();
    },
    
    setupFloatingNavigation() {
        const sections = ['dashboard', 'snapshot', 'today', 'workflow', 'analyzer', 'calendar', 'insights', 'documentation', 'features'];
        const navDots = document.getElementById('navDots');
        const navPrev = document.getElementById('navPrev');
        const navNext = document.getElementById('navNext');
        
        if (!navDots || !navPrev || !navNext) return;
        
        navDots.innerHTML = '';
        
        sections.forEach((sectionId, index) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.dataset.section = sectionId;
            dot.dataset.index = index;
            dot.onclick = () => AppState.switchSection(sectionId);
            dot.ontouchend = (e) => {
                e.preventDefault();
                AppState.switchSection(sectionId);
            };
            navDots.appendChild(dot);
        });
        
        navPrev.onclick = () => {
            const currentIndex = sections.indexOf(AppState.currentSection);
            if (currentIndex > 0) AppState.switchSection(sections[currentIndex - 1]);
        };
        
        navNext.onclick = () => {
            const currentIndex = sections.indexOf(AppState.currentSection);
            if (currentIndex < sections.length - 1) AppState.switchSection(sections[currentIndex + 1]);
        };
        
        AppState.updateFloatingNavigation = () => {
            const dots = navDots.querySelectorAll('.nav-dot');
            dots.forEach(dot => {
                dot.classList.toggle('active', dot.dataset.section === AppState.currentSection);
            });
        };
    },
    
    setupFloatingMenu() {
        const menuBtn = document.getElementById('floatingMenuBtn');
        const menu = document.getElementById('floatingMenu');
        const menuClose = document.getElementById('menuClose');
        const menuItems = document.getElementById('menuItems');
        
        if (!menuBtn || !menu) return;
        
        const sections = [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'snapshot', label: 'Snapshot', icon: '📸' },
            { id: 'today', label: 'Today', icon: '📝' },
            { id: 'workflow', label: 'Workflow', icon: '⚙️' },
            { id: 'analyzer', label: 'Analyzer', icon: '📊' },
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'insights', label: 'Insights', icon: '💡' },
            { id: 'documentation', label: 'Documentation', icon: '📚' },
            { id: 'features', label: 'Features', icon: '🔧' }
        ];
        
        menuItems.innerHTML = '';
        sections.forEach(section => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.innerHTML = `
                <div class="menu-item-icon">${section.icon}</div>
                <div class="menu-item-label">${section.label}</div>
            `;
            item.onclick = () => {
                AppState.switchSection(section.id);
                AppState.toggleFloatingMenu();
            };
            menuItems.appendChild(item);
        });
        
        AppState.toggleFloatingMenu = () => {
            menu.classList.toggle('active');
        };
        
        menuBtn.onclick = AppState.toggleFloatingMenu;
        if (menuClose) menuClose.onclick = AppState.toggleFloatingMenu;
        
        AppState.updateFloatingMenu = () => {
            // Update menu icon based on current section
            const current = sections.find(s => s.id === AppState.currentSection);
            if (current && menuBtn) {
                menuBtn.querySelector('.menu-icon').textContent = current.icon;
            }
        };
        
        // Double-tap for next section
        let lastClick = 0;
        menuBtn.ondblclick = () => {
            const sections = ['dashboard', 'snapshot', 'today', 'workflow', 'analyzer', 'calendar', 'insights', 'documentation', 'features'];
            const currentIndex = sections.indexOf(AppState.currentSection);
            const nextIndex = (currentIndex + 1) % sections.length;
            AppState.switchSection(sections[nextIndex]);
        };
    },
    
    setupSwipeGestures() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        mainContent.ontouchstart = (e) => {
            if (e.target.closest('button, input, textarea, canvas')) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        };
        
        mainContent.ontouchend = (e) => {
            if (e.target.closest('button, input, textarea, canvas')) return;
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                const sections = ['dashboard', 'snapshot', 'today', 'workflow', 'analyzer', 'calendar', 'insights', 'documentation', 'features'];
                const currentIndex = sections.indexOf(AppState.currentSection);
                if (deltaX > 0 && currentIndex > 0) {
                    AppState.switchSection(sections[currentIndex - 1]);
                } else if (deltaX < 0 && currentIndex < sections.length - 1) {
                    AppState.switchSection(sections[currentIndex + 1]);
                }
            }
        };
    },
    
    setupBackButtons() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            if (section.id === 'dashboard') return;
            
            let backBtn = section.querySelector('.section-back-btn');
            if (!backBtn) {
                backBtn = document.createElement('button');
                backBtn.className = 'section-back-btn';
                backBtn.innerHTML = '← Back';
                const sectionInner = section.querySelector('.section-inner');
                if (sectionInner) {
                    sectionInner.insertBefore(backBtn, sectionInner.firstChild);
                }
            }
            
            backBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                AppState.switchSection('dashboard');
            };
        });
        
        AppState.updateBackButtons = () => {
            const backButtons = document.querySelectorAll('.section-back-btn');
            backButtons.forEach(btn => {
                const section = btn.closest('.section');
                if (section && section.classList.contains('active') && section.id !== 'dashboard') {
                    btn.style.display = 'flex';
                } else {
                    btn.style.display = 'none';
                }
            });
        };
    },
    
    // ============================================
    // FEATURES PAGE - REDESIGNED
    // ============================================
    
    setupFeaturesPage() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            const sectionId = card.dataset.section;
            if (!sectionId) return;
            
            card.onclick = () => AppState.switchSection(sectionId);
            card.ontouchend = (e) => {
                e.preventDefault();
                AppState.switchSection(sectionId);
            };
        });
        
        AppState.updateFeaturesPage = () => {
            const featureTodayCount = document.getElementById('featureTodayCount');
            if (featureTodayCount) featureTodayCount.textContent = AppState.rawTasks.length;
            
            const featureWorkflowStatus = document.getElementById('featureWorkflowStatus');
            if (featureWorkflowStatus) {
                const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
                if (workflow) {
                    const allTasks = [...(workflow.phases.planning || []), ...(workflow.phases.execution || []), ...(workflow.phases.cooldown || [])];
                    const completed = allTasks.filter(t => t.status === 'completed').length;
                    const total = allTasks.length;
                    featureWorkflowStatus.textContent = total > 0 ? `${completed}/${total} tasks` : 'No workflow';
                } else {
                    featureWorkflowStatus.textContent = 'No workflow';
                }
            }
            
            const featureCalendarDays = document.getElementById('featureCalendarDays');
            if (featureCalendarDays) {
                featureCalendarDays.textContent = Object.keys(AppState.calendarData).length;
            }
            
            const featureDocsCount = document.getElementById('featureDocsCount');
            if (featureDocsCount) {
                featureDocsCount.textContent = Object.keys(AppState.documentationHistory).length;
            }
        };
    },
    
    // ============================================
    // PLACEHOLDER SECTIONS (Keep existing functionality)
    // ============================================
    
    // ============================================
    // SNAPSHOT SECTION
    // ============================================
    
    setupSnapshotSection() {
        AppState.renderSnapshot = () => {
            const snapshotDate = document.getElementById('snapshotDate');
            if (snapshotDate) {
                const today = new Date();
                snapshotDate.textContent = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
            }
            
            // Focus areas
            const focusPills = document.getElementById('focusPills');
            if (focusPills) {
                focusPills.innerHTML = '';
                if (AppState.currentContext) {
                    const contexts = {
                        focus: 'Focus & Think',
                        build: 'Make & Build',
                        learn: 'Learn & Explore',
                        light: 'Light & Easy',
                        organise: 'Organise',
                        rest: 'Rest & Reset'
                    };
                    const pill = document.createElement('div');
                    pill.className = 'focus-pill';
                    pill.textContent = contexts[AppState.currentContext] || AppState.currentContext;
                    focusPills.appendChild(pill);
                }
            }
            
            // Load
            const loadPercentage = document.getElementById('loadPercentage');
            const loadBarFill = document.getElementById('loadBarFill');
            const loadMessage = document.getElementById('loadMessage');
            
            if (loadPercentage && loadBarFill && loadMessage) {
                const total = AppState.rawTasks.length;
                const load = Math.min((total / 10) * 100, 100);
                loadPercentage.textContent = Math.round(load) + '%';
                loadBarFill.style.width = load + '%';
                
                if (load > 80) loadMessage.textContent = 'Heavy day, pace yourself';
                else if (load > 50) loadMessage.textContent = 'Balanced workload';
                else loadMessage.textContent = 'Light day';
            }
            
            // Planned blocks
            const blocksTimeline = document.getElementById('blocksTimeline');
            const blocksCount = document.getElementById('blocksCount');
            if (blocksTimeline) {
                blocksTimeline.innerHTML = '';
                const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
                if (workflow) {
                    const allTasks = [...(workflow.phases.planning || []), ...(workflow.phases.execution || []), ...(workflow.phases.cooldown || [])];
                    if (blocksCount) blocksCount.textContent = allTasks.length;
                    
                    allTasks.slice(0, 5).forEach((task, i) => {
                        const block = document.createElement('div');
                        block.className = 'block-item';
                        block.innerHTML = `
                            <div class="block-time">${String(9 + i).padStart(2, '0')}:00</div>
                            <div class="block-content">
                                <div class="block-title">${task.text}</div>
                                <div class="block-phase">${i < 2 ? 'Planning' : i < 4 ? 'Execution' : 'Cooldown'}</div>
                            </div>
                        `;
                        blocksTimeline.appendChild(block);
                    });
                } else {
                    if (blocksCount) blocksCount.textContent = '0';
                }
            }
        };
        
        AppState.attachButton('snapshotEditBtn', () => AppState.switchSection('workflow'));
        AppState.attachButton('snapshotCloseBtn', () => AppState.switchSection('dashboard'));
    },
    
    setupTodaySection() {
        // Keep existing today section setup
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        
        if (addTaskBtn && taskInput) {
            const addTask = () => {
                const text = taskInput.value.trim();
                if (!text) return;
                
                const task = AppState.enrichTask({
                    id: Date.now().toString(),
                    text,
                    timestamp: new Date().toISOString(),
                    completionState: 'pending'
                });
                
                AppState.rawTasks.push(task);
                AppState.saveToStorage();
                taskInput.value = '';
                AppState.renderRawTasks();
                AppState.updateAllSectionsGlobally();
            };
            
            addTaskBtn.onclick = addTask;
            taskInput.onkeypress = (e) => {
                if (e.key === 'Enter') addTask();
            };
        }
        
        AppState.renderRawTasks = () => {
            const list = document.getElementById('rawTasksList');
            if (!list) return;
            list.innerHTML = '';
            
            if (AppState.rawTasks.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No tasks yet. Add your first task above.</p>';
                return;
            }
            
            AppState.rawTasks.forEach((task, index) => {
                const item = document.createElement('div');
                item.className = 'task-item';
                item.innerHTML = `
                    <span class="task-number">${index + 1}.</span>
                    <span class="task-text">${task.text}</span>
                    <button class="task-delete-btn" data-task-id="${task.id}">×</button>
                `;
                
                const deleteBtn = item.querySelector('.task-delete-btn');
                if (deleteBtn) {
                    deleteBtn.onclick = () => {
                        AppState.rawTasks = AppState.rawTasks.filter(t => t.id !== task.id);
                        AppState.saveToStorage();
                        AppState.renderRawTasks();
                        AppState.updateAllSectionsGlobally();
                    };
                }
                
                list.appendChild(item);
            });
        };
    },
    // ============================================
    // WORKFLOW SECTION - FULL FUNCTIONALITY
    // ============================================
    
    setupWorkflowSection() {
        // Mode toggle
        const aiModeBtn = document.getElementById('aiModeBtn');
        const manualModeBtn = document.getElementById('manualModeBtn');
        
        const updateModeUI = () => {
            if (aiModeBtn && manualModeBtn) {
                if (AppState.aiMode) {
                    aiModeBtn.classList.add('active');
                    manualModeBtn.classList.remove('active');
                } else {
                    manualModeBtn.classList.add('active');
                    aiModeBtn.classList.remove('active');
                }
            }
            const modeIndicator = document.getElementById('currentModeText');
            if (modeIndicator) {
                modeIndicator.textContent = AppState.aiMode ? 'AI Mode' : 'Manual Mode';
            }
        };
        
        if (aiModeBtn) {
            aiModeBtn.onclick = () => {
                AppState.aiMode = true;
                AppState.saveToStorage();
                updateModeUI();
            };
        }
        
        if (manualModeBtn) {
            manualModeBtn.onclick = () => {
                AppState.aiMode = false;
                AppState.saveToStorage();
                updateModeUI();
            };
        }
        
        updateModeUI();
        
        // Quick notes
        const createManualWorkflowBtn = document.getElementById('createManualWorkflowBtn');
        const clearNotesBtn = document.getElementById('clearNotesBtn');
        const quickNotesInput = document.getElementById('quickNotesInput');
        
        if (createManualWorkflowBtn) {
            createManualWorkflowBtn.onclick = () => {
                if (quickNotesInput && quickNotesInput.value.trim()) {
                    AppState.createWorkflowFromOrganisedTasks();
                    AppState.renderWorkflowPhases();
                    AppState.renderWorkflowGraph();
                }
            };
        }
        
        if (clearNotesBtn && quickNotesInput) {
            clearNotesBtn.onclick = () => {
                quickNotesInput.value = '';
            };
        }
        
        // End phase button
        AppState.attachButton('endPhaseBtn', () => {
            if (confirm('Save work and document today?')) {
                AppState.updateCalendarData();
                AppState.switchSection('documentation');
            }
        });
        
        // Workflow tabs
        const workflowTabs = document.querySelectorAll('.workflow-tab');
        workflowTabs.forEach(tab => {
            tab.onclick = () => {
                const tabName = tab.dataset.tab;
                workflowTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const contents = document.querySelectorAll('.workflow-tab-content');
                contents.forEach(c => c.classList.remove('active'));
                const target = document.getElementById(tabName + 'Tab');
                if (target) {
                    target.classList.add('active');
                    // Update workload when switching to workload tab
                    if (tabName === 'workload' && AppState.updateWorkload) {
                        setTimeout(() => AppState.updateWorkload(), 100);
                    }
                }
            };
        });
        
        // Render functions
        AppState.renderWorkflowPhases = () => {
            const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
            if (!workflow) return;
            
            const phases = ['planning', 'execution', 'cooldown'];
            phases.forEach(phase => {
                const tasks = workflow.phases[phase] || [];
                const tasksContainer = document.getElementById(phase + 'Tasks');
                const countEl = document.getElementById(phase + 'Count');
                const progressEl = document.getElementById(phase + 'Progress');
                
                if (countEl) countEl.textContent = `${tasks.length} tasks`;
                
                const completed = tasks.filter(t => t.status === 'completed').length;
                const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
                if (progressEl) progressEl.textContent = progress + '%';
                
                if (tasksContainer) {
                    tasksContainer.innerHTML = '';
                    if (tasks.length === 0) {
                        tasksContainer.innerHTML = '<p class="empty-phase">No tasks in this phase</p>';
                    } else {
                        tasks.forEach((task, i) => {
                            const taskEl = document.createElement('div');
                            taskEl.className = 'phase-task-item';
                            taskEl.innerHTML = `
                                <span class="task-status ${task.status === 'completed' ? 'completed' : ''}">${task.status === 'completed' ? '✓' : '○'}</span>
                                <span class="task-text">${task.text}</span>
                            `;
                            taskEl.onclick = () => {
                                task.status = task.status === 'completed' ? 'pending' : 'completed';
                                AppState.saveToStorage();
                                AppState.renderWorkflowPhases();
                                AppState.renderWorkflowGraph();
                                AppState.updateAllSectionsGlobally();
                            };
                            tasksContainer.appendChild(taskEl);
                        });
                    }
                }
            });
            
            // Update stats
            const allTasks = [...(workflow.phases.planning || []), ...(workflow.phases.execution || []), ...(workflow.phases.cooldown || [])];
            const totalTasksStat = document.getElementById('totalTasksStat');
            const completedStat = document.getElementById('completedStat');
            const progressStat = document.getElementById('progressStat');
            const workflowProgressFill = document.getElementById('workflowProgressFill');
            const workflowStatus = document.getElementById('workflowStatus');
            
            if (totalTasksStat) totalTasksStat.textContent = allTasks.length;
            const completed = allTasks.filter(t => t.status === 'completed').length;
            if (completedStat) completedStat.textContent = completed;
            const progress = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0;
            if (progressStat) progressStat.textContent = progress + '%';
            if (workflowProgressFill) workflowProgressFill.style.width = progress + '%';
            if (workflowStatus) {
                if (progress === 100) workflowStatus.textContent = 'Complete!';
                else if (progress > 50) workflowStatus.textContent = 'In progress';
                else workflowStatus.textContent = 'Ready to start';
            }
        };
        
        AppState.renderWorkflowGraph = () => {
            const canvas = document.getElementById('workflowCanvas');
            if (!canvas) return;
            
            const container = canvas.parentElement;
            if (!container) return;
            
            canvas.width = container.offsetWidth - 40;
            canvas.height = 400;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
            if (!workflow) return;
            
            const phases = [
                { name: 'Planning', tasks: workflow.phases.planning || [] },
                { name: 'Execution', tasks: workflow.phases.execution || [] },
                { name: 'Cooldown', tasks: workflow.phases.cooldown || [] }
            ];
            
            const boxWidth = (canvas.width - 40 * 2 - 30 * 2) / 3;
            const boxHeight = Math.min(300, canvas.height - 100);
            const startX = 40;
            const startY = (canvas.height - boxHeight) / 2;
            
            phases.forEach((phase, i) => {
                const x = startX + i * (boxWidth + 30);
                const y = startY;
                
                const completed = phase.tasks.filter(t => t.status === 'completed').length;
                const progress = phase.tasks.length > 0 ? completed / phase.tasks.length : 0;
                
                // Box
                ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                ctx.fillRect(x, y, boxWidth, boxHeight);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, boxWidth, boxHeight);
                
                // Progress bar
                ctx.fillStyle = '#10b981';
                ctx.fillRect(x + 10, y + boxHeight - 20, (boxWidth - 20) * progress, 5);
                
                // Title
                ctx.fillStyle = '#f9fafb';
                ctx.font = 'bold 16px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText(phase.name, x + boxWidth / 2, y + 30);
                
                // Task count
                ctx.font = '14px system-ui';
                ctx.fillText(`${phase.tasks.length} tasks`, x + boxWidth / 2, y + 55);
                
                // Task previews
                ctx.font = '12px system-ui';
                ctx.fillStyle = '#d1d5db';
                phase.tasks.slice(0, 2).forEach((task, j) => {
                    const status = task.status === 'completed' ? '✓' : '○';
                    ctx.fillText(`${status} ${task.text.substring(0, 20)}`, x + boxWidth / 2, y + 80 + j * 20);
                });
                
                if (phase.tasks.length > 2) {
                    ctx.fillText(`+${phase.tasks.length - 2} more`, x + boxWidth / 2, y + 80 + 2 * 20);
                }
                
                // Connection line
                if (i < phases.length - 1) {
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x + boxWidth, y + boxHeight / 2);
                    ctx.lineTo(x + boxWidth + 30, y + boxHeight / 2);
                    ctx.stroke();
                }
            });
        };
        
        // Initial render
        setTimeout(() => {
            AppState.renderWorkflowPhases();
            AppState.renderWorkflowGraph();
        }, 100);
    },
    
    setupWorkloadSection() {
        // Workload Ring Meter
        AppState.renderWorkloadRing = () => {
            const canvas = document.getElementById('workloadRing');
            if (!canvas) return;
            
            canvas.width = 200;
            canvas.height = 200;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Get workload analysis
            let analysis = { level: 'Balanced', load: 50, explanation: 'No tasks yet' };
            if (typeof FlowMind !== 'undefined' && FlowMind && FlowMind.analyzeWorkload) {
                analysis = FlowMind.analyzeWorkload(AppState);
            } else {
                // Fallback calculation
                const total = AppState.rawTasks.length;
                const load = Math.min((total / 10) * 100, 100);
                analysis.load = load;
                if (load > 80) analysis.level = 'Overloaded';
                else if (load > 60) analysis.level = 'Heavy';
                else if (load > 40) analysis.level = 'Balanced';
                else analysis.level = 'Light';
            }
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 80;
            const lineWidth = 20;
            
            // Background circle
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Progress circle
            const progress = analysis.load / 100;
            let color = '#10b981'; // Green for light/balanced
            if (analysis.level === 'Overloaded') color = '#ef4444';
            else if (analysis.level === 'Heavy') color = '#f59e0b';
            
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
            ctx.stroke();
            
            // Update text
            const workloadLevel = document.getElementById('workloadLevel');
            if (workloadLevel) workloadLevel.textContent = analysis.level;
            
            // Click handler for details
            canvas.onclick = () => {
                const explanation = document.getElementById('workloadExplanation');
                const details = document.getElementById('workloadDetails');
                if (explanation && details) {
                    const isVisible = explanation.style.display !== 'none';
                    explanation.style.display = isVisible ? 'none' : 'block';
                    if (!isVisible) {
                        details.textContent = analysis.explanation || `Current load: ${Math.round(analysis.load)}%. ${analysis.level} workload.`;
                    }
                }
            };
        };
        
        // Load Breakdown
        AppState.renderLoadBreakdown = () => {
            const breakdownItems = document.getElementById('breakdownItems');
            if (!breakdownItems) return;
            
            breakdownItems.innerHTML = '';
            
            const allTasks = [...AppState.rawTasks];
            const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
            if (workflow) {
                const workflowTasks = [...(workflow.phases.planning || []), ...(workflow.phases.execution || []), ...(workflow.phases.cooldown || [])];
                workflowTasks.forEach(task => {
                    if (!allTasks.find(t => t.id === task.id)) {
                        allTasks.push(task);
                    }
                });
            }
            
            const heavy = allTasks.filter(t => (t.metadata?.effort || 'medium') === 'high');
            const medium = allTasks.filter(t => (t.metadata?.effort || 'medium') === 'medium');
            const light = allTasks.filter(t => (t.metadata?.effort || 'medium') === 'low');
            
            const total = allTasks.length;
            
            const categories = [
                { label: 'Heavy', count: heavy.length, tasks: heavy, color: '#f59e0b', class: 'heavy-fill' },
                { label: 'Medium', count: medium.length, tasks: medium, color: '#8b9dc3', class: 'medium-fill' },
                { label: 'Light', count: light.length, tasks: light, color: '#10b981', class: 'light-fill' }
            ];
            
            categories.forEach(category => {
                if (total === 0) return;
                
                const item = document.createElement('div');
                item.className = 'breakdown-item';
                const percentage = (category.count / total) * 100;
                
                item.innerHTML = `
                    <div class="breakdown-header">
                        <span class="breakdown-label">${category.label}</span>
                        <span class="breakdown-count">${category.count}</span>
                    </div>
                    <div class="breakdown-bar">
                        <div class="breakdown-fill ${category.class}" style="width: ${percentage}%"></div>
                    </div>
                `;
                
                item.onclick = () => {
                    AppState.showTasksByEffort(category.label.toLowerCase());
                };
                
                breakdownItems.appendChild(item);
            });
        };
        
        // Task Lists by Effort
        AppState.renderTaskLists = () => {
            const allTasks = [...AppState.rawTasks];
            const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
            if (workflow) {
                const workflowTasks = [...(workflow.phases.planning || []), ...(workflow.phases.execution || []), ...(workflow.phases.cooldown || [])];
                workflowTasks.forEach(task => {
                    if (!allTasks.find(t => t.id === task.id)) {
                        allTasks.push(task);
                    }
                });
            }
            
            const heavy = allTasks.filter(t => (t.metadata?.effort || 'medium') === 'high');
            const medium = allTasks.filter(t => (t.metadata?.effort || 'medium') === 'medium');
            const light = allTasks.filter(t => (t.metadata?.effort || 'medium') === 'low');
            
            // Heavy tasks
            const heavyCount = document.getElementById('heavyTasksCount');
            const heavyList = document.getElementById('heavyTasksList');
            if (heavyCount) heavyCount.textContent = heavy.length;
            if (heavyList) {
                heavyList.innerHTML = '';
                heavy.forEach(task => {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'workload-task-item';
                    taskEl.innerHTML = `
                        <span class="task-status ${task.status === 'completed' ? 'completed' : ''}">${task.status === 'completed' ? '✓' : '○'}</span>
                        <span class="task-text">${task.text}</span>
                        <button class="task-action-btn" data-task-id="${task.id}">→</button>
                    `;
                    taskEl.querySelector('.task-action-btn').onclick = () => {
                        AppState.switchSection('workflow');
                    };
                    taskEl.onclick = () => {
                        task.status = task.status === 'completed' ? 'pending' : 'completed';
                        AppState.saveToStorage();
                        AppState.renderTaskLists();
                        AppState.updateAllSectionsGlobally();
                    };
                    heavyList.appendChild(taskEl);
                });
            }
            
            // Medium tasks
            const mediumCount = document.getElementById('mediumTasksCount');
            const mediumList = document.getElementById('mediumTasksList');
            if (mediumCount) mediumCount.textContent = medium.length;
            if (mediumList) {
                mediumList.innerHTML = '';
                medium.forEach(task => {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'workload-task-item';
                    taskEl.innerHTML = `
                        <span class="task-status ${task.status === 'completed' ? 'completed' : ''}">${task.status === 'completed' ? '✓' : '○'}</span>
                        <span class="task-text">${task.text}</span>
                        <button class="task-action-btn" data-task-id="${task.id}">→</button>
                    `;
                    taskEl.querySelector('.task-action-btn').onclick = () => {
                        AppState.switchSection('workflow');
                    };
                    taskEl.onclick = () => {
                        task.status = task.status === 'completed' ? 'pending' : 'completed';
                        AppState.saveToStorage();
                        AppState.renderTaskLists();
                        AppState.updateAllSectionsGlobally();
                    };
                    mediumList.appendChild(taskEl);
                });
            }
            
            // Light tasks
            const lightCount = document.getElementById('lightTasksCount');
            const lightList = document.getElementById('lightTasksList');
            if (lightCount) lightCount.textContent = light.length;
            if (lightList) {
                lightList.innerHTML = '';
                light.forEach(task => {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'workload-task-item';
                    taskEl.innerHTML = `
                        <span class="task-status ${task.status === 'completed' ? 'completed' : ''}">${task.status === 'completed' ? '✓' : '○'}</span>
                        <span class="task-text">${task.text}</span>
                        <button class="task-action-btn" data-task-id="${task.id}">→</button>
                    `;
                    taskEl.querySelector('.task-action-btn').onclick = () => {
                        AppState.switchSection('workflow');
                    };
                    taskEl.onclick = () => {
                        task.status = task.status === 'completed' ? 'pending' : 'completed';
                        AppState.saveToStorage();
                        AppState.renderTaskLists();
                        AppState.updateAllSectionsGlobally();
                    };
                    lightList.appendChild(taskEl);
                });
            }
        };
        
        AppState.showTasksByEffort = (effort) => {
            // Scroll to the appropriate task group
            const groupId = effort + 'TasksGroup';
            const group = document.getElementById(groupId);
            if (group) {
                group.scrollIntoView({ behavior: 'smooth', block: 'start' });
                group.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    group.style.animation = '';
                }, 500);
            }
        };
        
        // AI Suggestions
        AppState.renderWorkloadSuggestions = () => {
            const suggestionsContainer = document.getElementById('workloadSuggestions');
            const suggestionsList = document.getElementById('suggestionsList');
            if (!suggestionsContainer || !suggestionsList) return;
            
            let analysis = { level: 'Balanced', load: 50 };
            if (typeof FlowMind !== 'undefined' && FlowMind && FlowMind.analyzeWorkload) {
                analysis = FlowMind.analyzeWorkload(AppState);
            }
            
            if (analysis.level === 'Heavy' || analysis.level === 'Overloaded') {
                suggestionsContainer.style.display = 'block';
                suggestionsList.innerHTML = '';
                
                const suggestions = [
                    { text: 'Move some tasks to tomorrow', action: () => alert('Feature: Move tasks') },
                    { text: 'Break down heavy tasks into smaller steps', action: () => AppState.switchSection('workflow') },
                    { text: 'Add an Organise phase to clarify tasks', action: () => AppState.switchSection('today') }
                ];
                
                suggestions.forEach(suggestion => {
                    const item = document.createElement('div');
                    item.className = 'workload-suggestion-item';
                    item.innerHTML = `
                        <span>${suggestion.text}</span>
                        <button class="suggestion-action-btn">Apply</button>
                    `;
                    item.querySelector('.suggestion-action-btn').onclick = suggestion.action;
                    suggestionsList.appendChild(item);
                });
            } else {
                suggestionsContainer.style.display = 'none';
            }
        };
        
        // Daily Commitment
        const commitmentInput = document.getElementById('dailyCommitmentInput');
        const commitmentStatus = document.getElementById('commitmentStatus');
        
        if (commitmentInput) {
            if (AppState.dailyCommitment) {
                commitmentInput.value = AppState.dailyCommitment;
            }
            
            commitmentInput.oninput = () => {
                AppState.dailyCommitment = commitmentInput.value;
                AppState.saveToStorage();
                if (commitmentStatus) {
                    commitmentStatus.textContent = commitmentInput.value ? 'Saved' : '';
                    setTimeout(() => {
                        if (commitmentStatus) commitmentStatus.textContent = '';
                    }, 2000);
                }
            };
            
            commitmentInput.onblur = () => {
                AppState.dailyCommitment = commitmentInput.value;
                AppState.saveToStorage();
            };
        }
        
        // Main update function
        AppState.updateWorkload = () => {
            AppState.renderWorkloadRing();
            AppState.renderLoadBreakdown();
            AppState.renderTaskLists();
            AppState.renderWorkloadSuggestions();
        };
        
        // Initial render
        setTimeout(() => {
            AppState.updateWorkload();
        }, 100);
    },
    
    setupAnalyzerSection() {
        AppState.renderExecutionGraph = () => {
            const canvas = document.getElementById('executionGraph');
            if (!canvas) return;
            
            const container = canvas.parentElement;
            if (!container) return;
            
            canvas.width = container.offsetWidth - 32;
            canvas.height = 240;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const history = AppState.executionHistory || [];
            if (history.length === 0) return;
            
            const padding = 40;
            const graphWidth = canvas.width - padding * 2;
            const graphHeight = canvas.height - padding * 2;
            
            // Draw line
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            history.forEach((event, i) => {
                const x = padding + (i / Math.max(history.length - 1, 1)) * graphWidth;
                const value = event.type === 'task_complete' ? 1 : event.type === 'task_start' ? 0.5 : 0.3;
                const y = padding + graphHeight - (value * graphHeight);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            
            ctx.stroke();
            
            // Fill area
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            ctx.fill();
        };
        
        AppState.renderProductivityMeter = () => {
            const canvas = document.getElementById('productivityMeter');
            if (!canvas) return;
            
            canvas.width = 200;
            canvas.height = 200;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (typeof FlowMind !== 'undefined' && FlowMind && FlowMind.analyzeProductivity) {
                const analysis = FlowMind.analyzeProductivity(AppState);
                const level = analysis.level || 'Stable';
                const productivityLevel = document.getElementById('productivityLevel');
                if (productivityLevel) productivityLevel.textContent = level;
                
                // Draw gauge
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 80;
                
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 20;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, Math.PI, 0);
                ctx.stroke();
            }
        };
        
        AppState.renderMomentumFriction = () => {
            if (typeof FlowMind !== 'undefined' && FlowMind && FlowMind.analyzeMomentumFriction) {
                const analysis = FlowMind.analyzeMomentumFriction(AppState);
                
                const momentumFill = document.getElementById('momentumFill');
                const frictionFill = document.getElementById('frictionFill');
                const momentumValue = document.getElementById('momentumValue');
                const frictionValue = document.getElementById('frictionValue');
                
                if (momentumFill) momentumFill.style.width = (analysis.momentum * 100) + '%';
                if (frictionFill) frictionFill.style.width = (analysis.friction * 100) + '%';
                if (momentumValue) momentumValue.textContent = analysis.momentumText || '—';
                if (frictionValue) frictionValue.textContent = analysis.frictionText || '—';
            }
        };
        
        AppState.updateAnalyzer = () => {
            setTimeout(() => {
                AppState.renderExecutionGraph();
                AppState.renderProductivityMeter();
                AppState.renderMomentumFriction();
            }, 100);
        };
        
        // Rebalance button
        AppState.attachButton('rebalanceTodayBtn', () => {
            AppState.switchSection('workflow');
        });
    },
    
    setupCalendarSection() {
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        
        AppState.renderCalendar = () => {
            const grid = document.getElementById('calendarGrid');
            const monthEl = document.getElementById('currentMonth');
            if (!grid || !monthEl) return;
            
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay();
            
            monthEl.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            grid.innerHTML = '';
            
            // Day headers
            ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
                const header = document.createElement('div');
                header.className = 'calendar-day-header';
                header.textContent = day;
                grid.appendChild(header);
            });
            
            // Empty cells
            for (let i = 0; i < startingDayOfWeek; i++) {
                const empty = document.createElement('div');
                empty.className = 'calendar-day empty';
                grid.appendChild(empty);
            }
            
            // Days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = day;
                
                const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day === today.getDate()) {
                    dayEl.classList.add('today');
                }
                
                if (AppState.calendarData[dateKey]) {
                    dayEl.classList.add('has-activity');
                }
                
                dayEl.onclick = () => {
                    AppState.showDaySummary(dateKey);
                };
                
                grid.appendChild(dayEl);
            }
        };
        
        AppState.showDaySummary = (dateKey) => {
            const sheet = document.getElementById('daySummarySheet');
            const summaryDate = document.getElementById('summaryDate');
            const summaryContent = document.getElementById('summaryContent');
            
            if (!sheet || !summaryDate || !summaryContent) return;
            
            const date = new Date(dateKey);
            summaryDate.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            
            const dayData = AppState.calendarData[dateKey];
            if (dayData) {
                summaryContent.innerHTML = `
                    <div class="summary-item">
                        <strong>Context:</strong> ${dayData.context || 'None'}
                    </div>
                    <div class="summary-item">
                        <strong>Workflow:</strong> ${dayData.workflow || 'None'}
                    </div>
                    <div class="summary-item">
                        <strong>Completion:</strong> ${Math.round(dayData.completion * 100)}%
                    </div>
                    <div class="summary-item">
                        <strong>Summary:</strong> ${dayData.summary || 'No summary'}
                    </div>
                `;
            } else {
                summaryContent.innerHTML = '<p>No data for this day</p>';
            }
            
            sheet.classList.add('active');
        };
        
        AppState.attachButton('prevMonthBtn', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            AppState.renderCalendar();
        });
        
        AppState.attachButton('nextMonthBtn', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            AppState.renderCalendar();
        });
        
        AppState.attachButton('todayBtn', () => {
            const today = new Date();
            currentMonth = today.getMonth();
            currentYear = today.getFullYear();
            AppState.renderCalendar();
        });
        
        AppState.attachButton('closeSummaryBtn', () => {
            const sheet = document.getElementById('daySummarySheet');
            if (sheet) sheet.classList.remove('active');
        });
        
        AppState.updateCalendarData = () => {
            const today = new Date();
            const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
            const allTasks = workflow ? [...(workflow.phases.planning || []), ...(workflow.phases.execution || []), ...(workflow.phases.cooldown || [])] : AppState.rawTasks;
            const completed = allTasks.filter(t => t.status === 'completed' || t.completionState === 'completed').length;
            const total = allTasks.length;
            
            AppState.calendarData[dateKey] = {
                context: AppState.currentContext,
                workflow: workflow ? workflow.name : null,
                completion: total > 0 ? completed / total : 0,
                summary: `${completed} of ${total} tasks completed`
            };
            
            AppState.saveToStorage();
            AppState.renderCalendar();
        };
        
        AppState.renderCalendar();
    },
    
    setupInsightsSection() {
        AppState.updateInsights = () => {
            const patternCards = document.getElementById('patternCards');
            if (!patternCards) return;
            
            if (typeof FlowMind !== 'undefined' && FlowMind && FlowMind.getInsights) {
                const insights = FlowMind.getInsights(AppState);
                patternCards.innerHTML = '';
                
                insights.forEach(insight => {
                    const card = document.createElement('div');
                    card.className = 'pattern-card';
                    card.innerHTML = `
                        <p>${insight.text}</p>
                        <button class="dismiss-btn">×</button>
                    `;
                    card.querySelector('.dismiss-btn').onclick = () => card.remove();
                    patternCards.appendChild(card);
                });
            }
        };
    },
    
    setupDocumentationSection() {
        const saveDocBtn = document.getElementById('saveDocBtn');
        const docReflection = document.getElementById('docReflection');
        
        if (saveDocBtn && docReflection) {
            saveDocBtn.onclick = () => {
                const today = new Date().toDateString();
                const workflow = AppState.workflows.find(w => w.id === AppState.activeWorkflow);
                const allTasks = workflow ? [...(workflow.phases.planning || []), ...(workflow.phases.execution || []), ...(workflow.phases.cooldown || [])] : AppState.rawTasks;
                const completed = allTasks.filter(t => t.status === 'completed' || t.completionState === 'completed');
                
                AppState.documentationHistory[today] = {
                    date: today,
                    context: AppState.currentContext,
                    tasks: allTasks.map(t => t.text),
                    completed: completed.map(t => t.text),
                    reflection: docReflection.value
                };
                
                AppState.saveToStorage();
                alert('Documentation saved!');
                docReflection.value = '';
            };
        }
        
        AppState.renderDocumentation = () => {
            const docHistory = document.getElementById('docHistory');
            if (!docHistory) return;
            
            docHistory.innerHTML = '';
            const entries = Object.values(AppState.documentationHistory).slice(-10).reverse();
            
            entries.forEach(entry => {
                const item = document.createElement('div');
                item.className = 'doc-history-item';
                item.innerHTML = `
                    <h4>${entry.date}</h4>
                    <p>${entry.completed.length} tasks completed</p>
                    <p>${entry.reflection || 'No reflection'}</p>
                `;
                docHistory.appendChild(item);
            });
        };
    },
    
    setupQuickViewSection() {
        // Quick view functionality
    },
    
    initParticleCanvas() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    },
    
    initFlowMind() {
        if (typeof FlowMind !== 'undefined' && FlowMind.init) {
            FlowMind.init(AppState);
        }
    },
    
    // ============================================
    // UPDATE FUNCTIONS
    // ============================================
    
    updateAllSections() {
        if (AppState.currentSection === 'dashboard') {
            AppState.updateMainDashboard();
        } else if (AppState.currentSection === 'snapshot') {
            if (AppState.renderSnapshot) AppState.renderSnapshot();
        } else if (AppState.currentSection === 'today') {
            if (AppState.renderRawTasks) AppState.renderRawTasks();
        } else if (AppState.currentSection === 'workflow') {
            if (AppState.renderWorkflowPhases) AppState.renderWorkflowPhases();
            if (AppState.renderWorkflowGraph) setTimeout(() => AppState.renderWorkflowGraph(), 100);
        } else if (AppState.currentSection === 'analyzer') {
            if (AppState.updateAnalyzer) AppState.updateAnalyzer();
        } else if (AppState.currentSection === 'calendar') {
            if (AppState.renderCalendar) AppState.renderCalendar();
        } else if (AppState.currentSection === 'insights') {
            if (AppState.updateInsights) AppState.updateInsights();
        } else if (AppState.currentSection === 'documentation') {
            if (AppState.renderDocumentation) AppState.renderDocumentation();
        }
    },
    
    updateAllSectionsGlobally() {
        AppState.updateDashboardStats();
        AppState.updateMainDashboard();
        // Add other global updates as needed
    },
    
    // ============================================
    // TASK ORGANIZATION (Simplified)
    // ============================================
    
    organiseTasks() {
        if (AppState.rawTasks.length === 0) return;
        
        if (AppState.aiMode && typeof FlowMind !== 'undefined' && FlowMind && FlowMind.organiseTasks) {
            AppState.organisedTasks = FlowMind.organiseTasks(AppState.rawTasks);
        } else {
            // Simple grouping
            AppState.organisedTasks = [{
                group: 'General',
                tasks: AppState.rawTasks
            }];
        }
        
        AppState.saveToStorage();
        
        // Create workflow if needed
        if (!AppState.activeWorkflow) {
            AppState.createWorkflowFromOrganisedTasks();
        }
    },
    
    createWorkflowFromOrganisedTasks() {
        // Simplified workflow creation
        const workflow = {
            id: Date.now().toString(),
            name: 'Today\'s Workflow',
            phases: {
                planning: [],
                execution: [],
                cooldown: []
            }
        };
        
        // Distribute tasks
        const tasks = AppState.organisedTasks.flatMap(g => g.tasks || []);
        const third = Math.ceil(tasks.length / 3);
        workflow.phases.planning = tasks.slice(0, third);
        workflow.phases.execution = tasks.slice(third, third * 2);
        workflow.phases.cooldown = tasks.slice(third * 2);
        
        AppState.workflows.push(workflow);
        AppState.activeWorkflow = workflow.id;
        AppState.saveToStorage();
    }
};

// ============================================
// INITIALIZATION
// ============================================

(function() {
    function initializeApp() {
        if (typeof AppState !== 'undefined' && AppState.init) {
            AppState.init();
        } else {
            console.error('AppState not found!');
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        setTimeout(initializeApp, 100);
    }
})();

// Force dashboard visible immediately
(function() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        dashboard.style.setProperty('display', 'block', 'important');
        dashboard.classList.add('active');
    }
})();
