// ============================================
// FLOWMIND AI SYSTEM
// Deterministic, Rule-Based Intelligence
// ============================================

const FlowMind = {
    // ============================================
    // TASK INTELLIGENCE ENGINE
    // ============================================
    
    analyzeTask(task) {
        return {
            clarity: this.calculateClarity(task.text),
            effort: this.estimateEffort(task.text),
            executionType: this.detectExecutionType(task.text),
            readiness: this.calculateReadiness(task)
        };
    },
    
    calculateClarity(text) {
        const vagueKeywords = ['maybe', 'perhaps', 'think about', 'consider', 'look into', 'figure out'];
        const vagueCount = vagueKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
        const lengthScore = Math.min(text.length / 50, 1);
        const questionCount = (text.match(/\?/g) || []).length;
        
        let clarity = lengthScore * 0.6;
        clarity -= vagueCount * 0.2;
        clarity -= questionCount * 0.1;
        clarity = Math.max(0, Math.min(1, clarity));
        
        return clarity;
    },
    
    estimateEffort(text) {
        const effortKeywords = {
            low: ['quick', 'simple', 'easy', 'just', 'only'],
            high: ['complex', 'detailed', 'comprehensive', 'thorough', 'extensive']
        };
        
        const lowCount = effortKeywords.low.filter(kw => text.toLowerCase().includes(kw)).length;
        const highCount = effortKeywords.high.filter(kw => text.toLowerCase().includes(kw)).length;
        
        if (highCount > lowCount) return 'high';
        if (lowCount > 0) return 'low';
        return 'medium';
    },
    
    detectExecutionType(text) {
        const types = {
            think: ['think', 'plan', 'design', 'consider', 'decide'],
            do: ['do', 'make', 'build', 'create', 'write', 'complete'],
            organize: ['organize', 'sort', 'clean', 'arrange', 'tidy'],
            learn: ['learn', 'read', 'study', 'research', 'explore']
        };
        
        const textLower = text.toLowerCase();
        for (const [type, keywords] of Object.entries(types)) {
            if (keywords.some(kw => textLower.includes(kw))) {
                return type;
            }
        }
        return 'do';
    },
    
    calculateReadiness(task) {
        const clarity = task.metadata?.clarity || this.calculateClarity(task.text);
        const hasContext = !!task.context;
        const hasEffort = !!task.metadata?.effort;
        
        return (clarity * 0.6 + (hasContext ? 0.2 : 0) + (hasEffort ? 0.2 : 0));
    },
    
    // ============================================
    // BEHAVIOR ENGINE
    // ============================================
    
    analyzeBehavior(executionHistory, rawTasks, workflows) {
        return {
            modeSwitching: this.detectModeSwitching(executionHistory),
            stallDetection: this.detectStalls(executionHistory),
            momentum: this.calculateMomentum(executionHistory),
            cognitiveLoad: this.calculateCognitiveLoad(rawTasks, workflows)
        };
    },
    
    detectModeSwitching(history) {
        if (history.length < 3) return { detected: false, frequency: 0 };
        
        const contexts = history.slice(-10).map(e => e.task?.context).filter(Boolean);
        const uniqueContexts = new Set(contexts);
        
        return {
            detected: uniqueContexts.size > 2,
            frequency: uniqueContexts.size / Math.max(contexts.length, 1),
            contexts: Array.from(uniqueContexts)
        };
    },
    
    detectStalls(history) {
        if (history.length < 5) return { detected: false, duration: 0 };
        
        const recent = history.slice(-10);
        const skips = recent.filter(e => e.type === 'task_skip').length;
        const completes = recent.filter(e => e.type === 'task_complete').length;
        
        return {
            detected: skips > completes * 2,
            duration: skips,
            ratio: skips / Math.max(recent.length, 1)
        };
    },
    
    calculateMomentum(history) {
        if (history.length === 0) return 'flowing';
        
        const recent = history.slice(-10);
        const completes = recent.filter(e => e.type === 'task_complete').length;
        const skips = recent.filter(e => e.type === 'task_skip').length;
        const starts = recent.filter(e => e.type === 'task_start').length;
        
        const score = (completes * 2) - (skips * 1.5) + (starts * 0.5);
        
        if (score > 5) return 'flowing';
        if (score < -2) return 'stalled';
        return 'recovering';
    },
    
    calculateCognitiveLoad(rawTasks, workflows) {
        const taskCount = rawTasks.length;
        const activeWorkflow = workflows.find(w => w.status === 'active');
        const workflowTasks = activeWorkflow ? 
            Object.values(activeWorkflow.phases).flat().length : 0;
        
        const vagueTasks = rawTasks.filter(t => {
            const clarity = t.metadata?.clarity || this.calculateClarity(t.text);
            return clarity < 0.5;
        }).length;
        
        const load = (taskCount * 0.3) + (workflowTasks * 0.2) + (vagueTasks * 0.5);
        
        return {
            index: Math.min(load / 10, 1),
            level: load > 7 ? 'high' : load > 4 ? 'medium' : 'low',
            triggers: vagueTasks > 3 ? ['vague_tasks'] : []
        };
    },
    
    // ============================================
    // WORKFLOW INTELLIGENCE
    // ============================================
    
    analyzeWorkflow(workflow, executionHistory) {
        return {
            usage: this.calculateWorkflowUsage(workflow, executionHistory),
            deviations: this.detectDeviations(workflow, executionHistory),
            effectiveness: this.calculateEffectiveness(workflow, executionHistory)
        };
    },
    
    calculateWorkflowUsage(workflow, history) {
        if (!workflow) return 0;
        
        const workflowTasks = Object.values(workflow.phases).flat().map(t => t.id);
        const executedTasks = history.filter(e => 
            workflowTasks.includes(e.task?.id)
        ).length;
        
        return executedTasks / Math.max(workflowTasks.length, 1);
    },
    
    detectDeviations(workflow, history) {
        if (!workflow) return [];
        
        const deviations = [];
        const phaseOrder = ['planning', 'execution', 'cooldown'];
        const executedPhases = new Set();
        
        history.forEach(event => {
            if (event.type === 'task_complete' || event.type === 'task_start') {
                const taskId = event.task?.id;
                Object.entries(workflow.phases).forEach(([phase, tasks]) => {
                    if (tasks.some(t => t.id === taskId)) {
                        executedPhases.add(phase);
                    }
                });
            }
        });
        
        const executedArray = Array.from(executedPhases);
        if (executedArray.length > 1) {
            const order = executedArray.map(p => phaseOrder.indexOf(p));
            if (order.some((val, i) => i > 0 && val < order[i - 1])) {
                deviations.push('phase_skip');
            }
        }
        
        return deviations;
    },
    
    calculateEffectiveness(workflow, history) {
        if (!workflow) return 0;
        
        const allTasks = Object.values(workflow.phases).flat();
        const completed = allTasks.filter(t => t.status === 'completed').length;
        const total = allTasks.length;
        
        if (total === 0) return 0;
        
        const completionRate = completed / total;
        const avgTime = this.calculateAverageCompletionTime(workflow, history);
        const timeScore = avgTime > 0 ? Math.min(1 / (avgTime / 60), 1) : 0.5;
        
        return (completionRate * 0.7) + (timeScore * 0.3);
    },
    
    calculateAverageCompletionTime(workflow, history) {
        const workflowTasks = Object.values(workflow.phases).flat().map(t => t.id);
        const completions = history.filter(e => 
            e.type === 'task_complete' && workflowTasks.includes(e.task?.id)
        );
        
        if (completions.length < 2) return 0;
        
        const times = [];
        for (let i = 1; i < completions.length; i++) {
            const timeDiff = new Date(completions[i].timestamp) - 
                           new Date(completions[i - 1].timestamp);
            times.push(timeDiff / 1000 / 60); // minutes
        }
        
        return times.reduce((a, b) => a + b, 0) / times.length;
    },
    
    // ============================================
    // COGNITIVE LOAD ENGINE
    // ============================================
    
    assessCognitiveLoad(state) {
        const taskLoad = state.rawTasks.length * 0.3;
        const workflowLoad = state.workflows.find(w => w.id === state.activeWorkflow) ?
            Object.values(state.workflows.find(w => w.id === state.activeWorkflow).phases)
                .flat().length * 0.2 : 0;
        const vagueLoad = state.rawTasks.filter(t => {
            const clarity = t.metadata?.clarity || this.calculateClarity(t.text);
            return clarity < 0.5;
        }).length * 0.5;
        
        const totalLoad = taskLoad + workflowLoad + vagueLoad;
        const index = Math.min(totalLoad / 10, 1);
        
        return {
            index,
            level: index > 0.7 ? 'high' : index > 0.4 ? 'medium' : 'low',
            triggers: this.identifyTriggers(state),
            threshold: 0.7
        };
    },
    
    identifyTriggers(state) {
        const triggers = [];
        
        if (state.rawTasks.length > 10) triggers.push('too_many_tasks');
        if (state.rawTasks.filter(t => {
            const clarity = t.metadata?.clarity || this.calculateClarity(t.text);
            return clarity < 0.5;
        }).length > 3) triggers.push('vague_tasks');
        
        const workflow = state.workflows.find(w => w.id === state.activeWorkflow);
        if (workflow) {
            const totalTasks = Object.values(workflow.phases).flat().length;
            if (totalTasks > 15) triggers.push('large_workflow');
        }
        
        return triggers;
    },
    
    // ============================================
    // INTERVENTION ENGINE
    // ============================================
    
    shouldIntervene(state) {
        const cognitiveLoad = this.assessCognitiveLoad(state);
        const behavior = this.analyzeBehavior(
            state.executionHistory,
            state.rawTasks,
            state.workflows
        );
        
        if (cognitiveLoad.level === 'high') return {
            should: true,
            reason: 'cognitive_overload',
            priority: 'high',
            suggestion: this.generateSuggestion('organize', state)
        };
        
        if (behavior.stallDetection.detected) return {
            should: true,
            reason: 'stall_detected',
            priority: 'medium',
            suggestion: this.generateSuggestion('simplify', state)
        };
        
        if (behavior.modeSwitching.detected && behavior.modeSwitching.frequency > 0.5) return {
            should: true,
            reason: 'mode_switching',
            priority: 'low',
            suggestion: this.generateSuggestion('focus', state)
        };
        
        return { should: false };
    },
    
    generateSuggestion(type, state) {
        const suggestions = {
            organize: {
                text: 'Consider organising tasks to reduce cognitive load',
                action: 'organize',
                data: { taskCount: state.rawTasks.length }
            },
            simplify: {
                text: 'Some tasks may need simplification',
                action: 'simplify',
                data: { vagueCount: state.rawTasks.filter(t => {
                    const clarity = t.metadata?.clarity || this.calculateClarity(t.text);
                    return clarity < 0.5;
                }).length }
            },
            focus: {
                text: 'Frequent mode switching detected',
                action: 'focus',
                data: {}
            },
            checkpoint: {
                text: 'Consider adding a workflow checkpoint',
                action: 'checkpoint',
                data: {}
            }
        };
        
        return suggestions[type] || suggestions.organize;
    },
    
    // ============================================
    // WORKFLOW GENERATION
    // ============================================
    
    generateWorkflow(organisedTasks, context) {
        const phases = {
            planning: [],
            execution: [],
            cooldown: []
        };
        
        const totalTasks = organisedTasks.length;
        const planningCount = Math.ceil(totalTasks * 0.3);
        const executionCount = Math.ceil(totalTasks * 0.6);
        
        organisedTasks.forEach((task, index) => {
            const taskWithMeta = {
                ...task,
                status: 'pending',
                metadata: task.metadata || this.analyzeTask(task)
            };
            
            if (index < planningCount) {
                phases.planning.push(taskWithMeta);
            } else if (index < planningCount + executionCount) {
                phases.execution.push(taskWithMeta);
            } else {
                phases.cooldown.push(taskWithMeta);
            }
        });
        
        // Add checkpoints
        const checkpoints = this.generateCheckpoints(phases);
        
        return {
            phases,
            checkpoints,
            variant: 'default',
            context: context || 'focus'
        };
    },
    
    generateCheckpoints(phases) {
        const checkpoints = [];
        const executionTasks = phases.execution.length;
        
        if (executionTasks > 5) {
            const midpoint = Math.floor(executionTasks / 2);
            checkpoints.push({
                id: Date.now(),
                phase: 'execution',
                position: midpoint,
                question: 'Should we continue or adjust?',
                inserted: true
            });
        }
        
        return checkpoints;
    },
    
    generateWorkflowVariant(workflow, variantType) {
        const variants = {
            deep: {
                planning: 0.4,
                execution: 0.5,
                cooldown: 0.1
            },
            low: {
                planning: 0.2,
                execution: 0.4,
                cooldown: 0.4
            },
            quick: {
                planning: 0.1,
                execution: 0.7,
                cooldown: 0.2
            }
        };
        
        const ratios = variants[variantType] || variants.deep;
        const allTasks = [
            ...workflow.phases.planning,
            ...workflow.phases.execution,
            ...workflow.phases.cooldown
        ];
        
        const newPhases = {
            planning: [],
            execution: [],
            cooldown: []
        };
        
        const planningCount = Math.ceil(allTasks.length * ratios.planning);
        const executionCount = Math.ceil(allTasks.length * ratios.execution);
        
        allTasks.forEach((task, index) => {
            if (index < planningCount) {
                newPhases.planning.push(task);
            } else if (index < planningCount + executionCount) {
                newPhases.execution.push(task);
            } else {
                newPhases.cooldown.push(task);
            }
        });
        
        return {
            ...workflow,
            phases: newPhases,
            variant: variantType
        };
    },
    
    // ============================================
    // PATTERN DETECTION
    // ============================================
    
    detectPatterns(state) {
        const patterns = [];
        
        // Pattern: Better execution after organizing
        const recentHistory = state.executionHistory.slice(-20);
        const organizeEvents = recentHistory.filter(e => 
            e.type === 'workflow_created' || e.type === 'tasks_organized'
        );
        
        if (organizeEvents.length > 0) {
            const afterOrganize = recentHistory.slice(
                recentHistory.findIndex(e => 
                    e.type === 'workflow_created' || e.type === 'tasks_organized'
                )
            );
            const completionRate = afterOrganize.filter(e => e.type === 'task_complete').length / 
                                 Math.max(afterOrganize.length, 1);
            
            if (completionRate > 0.5) {
                patterns.push({
                    type: 'execution_improvement',
                    text: 'You execute better after organising',
                    confidence: completionRate
                });
            }
        }
        
        // Pattern: Too many think tasks reduce completion
        const thinkTasks = state.rawTasks.filter(t => 
            t.metadata?.executionType === 'think' || 
            FlowMind.detectExecutionType(t.text) === 'think'
        );
        
        if (thinkTasks.length > state.rawTasks.length * 0.5) {
            patterns.push({
                type: 'think_overload',
                text: 'Too many Think tasks reduce completion',
                confidence: thinkTasks.length / state.rawTasks.length
            });
        }
        
        return patterns;
    },
    
    // ============================================
    // DECISION DEBT TRACKER
    // ============================================
    
    trackDecisionDebt(state) {
        const vagueTasks = state.rawTasks.filter(t => {
            const clarity = t.metadata?.clarity || this.calculateClarity(t.text);
            return clarity < 0.5;
        });
        
        const pendingDecisions = state.workflows
            .flatMap(w => Object.values(w.phases).flat())
            .filter(t => t.status === 'pending' && t.metadata?.clarity < 0.5);
        
        return {
            vagueTasks: vagueTasks.length,
            pendingDecisions: pendingDecisions.length,
            total: vagueTasks.length + pendingDecisions.length,
            items: [...vagueTasks, ...pendingDecisions]
        };
    },
    
    // ============================================
    // WORKLOAD ANALYSIS
    // ============================================
    
    analyzeWorkload(state) {
        const allTasks = [...state.rawTasks];
        const workflow = state.workflows.find(w => w.id === state.activeWorkflow);
        if (workflow) {
            allTasks.push(...Object.values(workflow.phases).flat());
        }
        
        // Remove duplicates by ID
        const uniqueTasks = [];
        const seenIds = new Set();
        allTasks.forEach(task => {
            if (!seenIds.has(task.id)) {
                seenIds.add(task.id);
                uniqueTasks.push(task);
            }
        });
        
        const breakdown = {
            heavy: 0,
            medium: 0,
            light: 0
        };
        
        let totalComplexity = 0;
        let vagueCount = 0;
        let highEffortCount = 0;
        let totalClarity = 0;
        let cognitiveLoadScore = 0;
        
        uniqueTasks.forEach(task => {
            const effort = task.metadata?.effort || this.estimateEffort(task.text);
            const clarity = task.metadata?.clarity || this.calculateClarity(task.text);
            const executionType = task.metadata?.executionType || this.detectExecutionType(task.text);
            
            // Effort-based classification
            if (effort === 'high') {
                breakdown.heavy++;
                highEffortCount++;
                totalComplexity += 3;
            } else if (effort === 'medium') {
                breakdown.medium++;
                totalComplexity += 2;
            } else {
                breakdown.light++;
                totalComplexity += 1;
            }
            
            // Clarity assessment
            totalClarity += clarity;
            if (clarity < 0.5) {
                vagueCount++;
                cognitiveLoadScore += 0.3; // Vague tasks add cognitive load
            }
            
            // Execution type complexity
            if (executionType === 'think') {
                cognitiveLoadScore += 0.2; // Thinking tasks are mentally taxing
            } else if (executionType === 'organize') {
                cognitiveLoadScore += 0.1; // Organizing is lighter
            }
            
            // Task length complexity (longer tasks = more complex)
            const lengthComplexity = Math.min(task.text.length / 100, 0.2);
            totalComplexity += lengthComplexity;
        });
        
        const total = uniqueTasks.length;
        const avgClarity = total > 0 ? totalClarity / total : 1;
        const heavyRatio = total > 0 ? breakdown.heavy / total : 0;
        const vagueRatio = total > 0 ? vagueCount / total : 0;
        const avgComplexity = total > 0 ? totalComplexity / total : 0;
        
        // Enhanced workload index calculation
        // Factors: total tasks, complexity, clarity, cognitive load, workflow status
        const taskCountFactor = Math.min(total / 15, 1) * 0.25; // Normalize to 15 tasks max
        const complexityFactor = Math.min(avgComplexity / 3, 1) * 0.25;
        const clarityFactor = (1 - avgClarity) * 0.25; // Lower clarity = higher load
        const cognitiveFactor = Math.min(cognitiveLoadScore / total, 1) * 0.15;
        const workflowFactor = workflow && workflow.status === 'active' ? 0.1 : 0;
        
        const loadIndex = Math.min(
            taskCountFactor + complexityFactor + clarityFactor + cognitiveFactor + workflowFactor,
            1
        );
        
        // Determine level with more nuanced thresholds
        let level = 'balanced';
        let explanation = 'Your workload is balanced and manageable.';
        let recommendations = [];
        
        if (loadIndex < 0.25) {
            level = 'light';
            explanation = 'Light workload detected. You have good capacity for additional tasks.';
            recommendations.push('Consider adding more tasks if you have capacity');
        } else if (loadIndex < 0.5) {
            level = 'balanced';
            explanation = 'Balanced workload. Good distribution of task complexity and clarity.';
            recommendations.push('Maintain current pace');
        } else if (loadIndex < 0.75) {
            level = 'heavy';
            explanation = 'Heavy workload detected. Consider prioritizing or simplifying tasks.';
            if (vagueCount > 0) {
                recommendations.push(`Simplify ${vagueCount} vague task${vagueCount > 1 ? 's' : ''}`);
            }
            if (highEffortCount > 0) {
                recommendations.push(`Break down ${highEffortCount} high-effort task${highEffortCount > 1 ? 's' : ''}`);
            }
            recommendations.push('Consider moving some tasks to tomorrow');
        } else {
            level = 'overloaded';
            explanation = 'Overloaded workload. Immediate action needed to prevent burnout.';
            recommendations.push(`Urgent: Simplify or remove ${Math.ceil(total * 0.3)} tasks`);
            recommendations.push('Focus on top 3 priorities only');
            recommendations.push('Consider taking a break before continuing');
        }
        
        // Additional insights
        const insights = [];
        if (vagueRatio > 0.3) {
            insights.push({
                type: 'warning',
                text: `${Math.round(vagueRatio * 100)}% of tasks are vague, increasing cognitive load`
            });
        }
        if (heavyRatio > 0.4) {
            insights.push({
                type: 'warning',
                text: `${Math.round(heavyRatio * 100)}% of tasks are high-effort, consider breaking them down`
            });
        }
        if (avgClarity > 0.8 && total < 10) {
            insights.push({
                type: 'positive',
                text: 'High task clarity and manageable count - excellent for execution'
            });
        }
        
        return {
            index: loadIndex,
            level,
            explanation,
            breakdown,
            total
        };
    },
    
    generateWorkloadSuggestions(state, analysis) {
        const suggestions = [];
        
        if (analysis.level === 'heavy' || analysis.level === 'overloaded') {
            if (analysis.breakdown.heavy > 3) {
                suggestions.push({
                    text: `Move ${Math.min(2, analysis.breakdown.heavy)} heavy tasks to tomorrow`,
                    action: 'Move Tasks',
                    type: 'move'
                });
            }
            
            const vagueCount = state.rawTasks.filter(t => {
                const clarity = t.metadata?.clarity || this.calculateClarity(t.text);
                return clarity < 0.5;
            }).length;
            
            if (vagueCount > 2) {
                suggestions.push({
                    text: `Clarify ${vagueCount} vague tasks to reduce cognitive load`,
                    action: 'Clarify',
                    type: 'downgrade'
                });
            }
            
            if (state.rawTasks.length > 8) {
                suggestions.push({
                    text: 'Organise tasks into a structured workflow',
                    action: 'Organise',
                    type: 'organise'
                });
            }
        }
        
        return suggestions;
    },
    
    // ============================================
    // PRODUCTIVITY ANALYSIS
    // ============================================
    
    analyzeProductivity(state) {
        const history = state.executionHistory;
        if (history.length < 3) {
            return {
                score: 0.5,
                level: 'stable',
                explanation: 'Not enough data yet. Continue working to see productivity analysis.'
            };
        }
        
        const recent = history.slice(-15);
        const completionRate = recent.filter(e => e.type === 'task_complete').length / Math.max(recent.length, 1);
        const skipRate = recent.filter(e => e.type === 'task_skip').length / Math.max(recent.length, 1);
        
        const workflow = state.workflows.find(w => w.id === state.activeWorkflow);
        let adherence = 0.5;
        if (workflow) {
            const totalTasks = Object.values(workflow.phases).flat().length;
            const completed = Object.values(workflow.phases).flat()
                .filter(t => t.status === 'completed').length;
            adherence = totalTasks > 0 ? completed / totalTasks : 0.5;
        }
        
        const avgClarity = state.rawTasks.length > 0 ?
            state.rawTasks.reduce((sum, t) => sum + (t.metadata?.clarity || 0.5), 0) / state.rawTasks.length : 0.5;
        
        const behavior = this.analyzeBehavior(history, state.rawTasks, state.workflows);
        const modeSwitchPenalty = behavior.modeSwitching.detected ? 0.1 : 0;
        
        const score = (completionRate * 0.4) + (adherence * 0.3) + (avgClarity * 0.2) + ((1 - skipRate) * 0.1) - modeSwitchPenalty;
        const normalizedScore = Math.max(0, Math.min(1, score));
        
        let level = 'stable';
        let explanation = '';
        
        if (normalizedScore < 0.4) {
            level = 'low';
            explanation = 'Low productivity. High skip rate or low completion. Consider simplifying tasks.';
        } else if (normalizedScore < 0.65) {
            level = 'stable';
            explanation = 'Stable productivity. Consistent execution pattern.';
        } else if (normalizedScore < 0.85) {
            level = 'high';
            explanation = 'High productivity. Strong completion rate and workflow adherence.';
        } else {
            level = 'peak';
            explanation = 'Peak productivity. Excellent execution with high clarity and completion.';
        }
        
        return {
            score: normalizedScore,
            level,
            explanation
        };
    },
    
    // ============================================
    // MOMENTUM VS FRICTION
    // ============================================
    
    analyzeMomentumFriction(state) {
        const history = state.executionHistory;
        if (history.length < 3) {
            return {
                momentum: 0.5,
                friction: 0.5,
                momentumText: '—',
                frictionText: '—'
            };
        }
        
        const recent = history.slice(-10);
        const completes = recent.filter(e => e.type === 'task_complete').length;
        const skips = recent.filter(e => e.type === 'task_skip').length;
        const starts = recent.filter(e => e.type === 'task_start').length;
        
        // Momentum: positive actions
        const momentum = Math.min(
            (completes * 0.6 + starts * 0.4) / Math.max(recent.length, 1),
            1
        );
        
        // Friction: negative actions and obstacles
        const vagueTasks = state.rawTasks.filter(t => {
            const clarity = t.metadata?.clarity || this.calculateClarity(t.text);
            return clarity < 0.5;
        }).length;
        
        const friction = Math.min(
            (skips * 0.5 + (vagueTasks * 0.1)) / Math.max(recent.length, 1),
            1
        );
        
        const momentumText = momentum > 0.7 ? 'Strong' : momentum > 0.4 ? 'Building' : 'Low';
        const frictionText = friction > 0.6 ? 'High' : friction > 0.3 ? 'Moderate' : 'Low';
        
        return {
            momentum,
            friction,
            momentumText,
            frictionText
        };
    },
    
    // ============================================
    // EXECUTION PULSES
    // ============================================
    
    generateExecutionPulses(state) {
        const pulses = [];
        const history = state.executionHistory;
        
        if (history.length === 0) return pulses;
        
        const recent = history.slice(-20);
        
        // Pulse: Completion streak
        let streak = 0;
        let maxStreak = 0;
        recent.forEach(event => {
            if (event.type === 'task_complete') {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else if (event.type === 'task_skip') {
                streak = 0;
            }
        });
        
        if (maxStreak >= 3) {
            pulses.push({
                icon: '⚡',
                text: `${maxStreak} task completion streak`,
                highlight: { start: recent.length - maxStreak, end: recent.length - 1 }
            });
        }
        
        // Pulse: Organizing impact
        const organizeIndex = recent.findIndex(e => 
            e.type === 'workflow_created' || e.type === 'tasks_organized'
        );
        if (organizeIndex !== -1) {
            const afterOrganize = recent.slice(organizeIndex);
            const completionRate = afterOrganize.filter(e => e.type === 'task_complete').length / 
                                 Math.max(afterOrganize.length, 1);
            if (completionRate > 0.6) {
                pulses.push({
                    icon: '📊',
                    text: 'Execution improved after organizing',
                    highlight: { start: organizeIndex, end: recent.length - 1 }
                });
            }
        }
        
        // Pulse: Mode consistency
        const contexts = recent.map(e => e.task?.context).filter(Boolean);
        const uniqueContexts = new Set(contexts);
        if (uniqueContexts.size === 1 && contexts.length > 3) {
            pulses.push({
                icon: '🎯',
                text: 'Consistent execution mode',
                highlight: null
            });
        }
        
        return pulses;
    },
    
    generateRebalanceSuggestions(state) {
        const suggestions = [];
        const workflow = state.workflows.find(w => w.id === state.activeWorkflow);
        
        if (workflow) {
            const executionTasks = workflow.phases.execution.length;
            if (executionTasks > 8) {
                suggestions.push({
                    text: 'Execution phase has many tasks. Consider splitting or moving some to cooldown.',
                    action: 'adjust'
                });
            }
        }
        
        if (suggestions.length === 0) {
            suggestions.push({
                text: 'Workflow is well balanced. Continue as planned.',
                action: 'none'
            });
        }
        
        return suggestions;
    }
};
