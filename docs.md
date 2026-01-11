# Deepchox - Personal Execution OS

## Product Philosophy

Deepchox is a Personal Execution Operating System designed to reduce cognitive load, turn chaos into structure, and let intelligence emerge from behavior. It is not a to-do list—it is an execution system.

### Core Principles

1. **Reduce Cognitive Load**: Every interaction is designed to minimize mental overhead
2. **Structure from Chaos**: Automatically organize and prioritize tasks
3. **Intelligence from Behavior**: Learn patterns and adapt without being intrusive
4. **Never Nag**: Suggestions are optional and dismissible
5. **Never Overwhelm**: One clear action at a time
6. **Premium Feel**: Every detail is intentional and polished

## Architecture

### File Structure

- `index.html` - Single-page application structure
- `style.css` - Premium mobile-first design system
- `app.js` - Main application controller and state management
- `ai.js` - FlowMind AI system (deterministic, rule-based)
- `docs.md` - This documentation

### State Management

All application state is managed in `AppState` object:

```javascript
{
    currentSection: 'today',
    currentContext: null,
    rawTasks: [],
    organisedTasks: [],
    workflows: [],
    workflowVersions: {},
    activeWorkflow: null,
    executionHistory: [],
    calendarData: {}
}
```

### Data Persistence

All data is stored in `localStorage` under the key `'deepchox'`. The app automatically saves state after every significant action.

## Features

### Section 1: Today

**Context Selection**
- Six execution modes: Focus & Think, Make & Build, Learn & Explore, Light & Easy, Organise, Rest & Reset
- Context affects task ordering, workflow generation, and AI expectations
- Optional - users can skip directly to task entry

**Task Entry**
- Free-form text input
- Tasks automatically numbered
- Each task enriched with metadata:
  - Clarity score (0-1)
  - Effort estimate (low/medium/high)
  - Execution type (think/do/organize/learn)
  - Edit count
  - Skip count
  - Completion state

**Auto-Organise Engine**
- Groups tasks by context
- Orders logically
- Flags vague tasks (clarity < 0.5)
- User can edit, reorder, or remove any task
- After confirmation, tasks become "organised" and sent to Workflow

### Section 2: Workflow

**Workflow Generation**
- AI generates initial workflow from organised tasks
- Distributes tasks across three phases:
  - Planning (30%)
  - Execution (60%)
  - Cooldown (10%)

**Workflow Variants**
- **Default**: Standard distribution
- **Deep Work**: More planning (40%), focused execution (50%)
- **Low Energy**: Less planning (20%), more cooldown (40%)
- **Quick Cleanup**: Minimal planning (10%), heavy execution (70%)

**Workflow Editor**
- Collapsible phases (one open at a time)
- Drag & drop to reorder tasks
- Long-press interactions for mobile
- Visual workflow graph (draggable canvas)

**Workflow Checkpoints**
- AI inserts decision points in long workflows
- User can accept or remove
- Prevents blind execution

**Workflow Versioning**
- Every change creates a new version
- Version history modal
- Revert to any previous version
- Versions stored in `workflowVersions` object

**Workflow Controls**
- Start Phase
- Pause
- Adjust
- Version History

### Section 3: Live Analyzer

**Execution Graph**
- Canvas-based line graph
- Updates on task start, complete, skip, workflow change
- Interactive: tap points to see task details
- No numbers, no scores - just visual patterns

**Momentum States**
- **Flowing**: High completion rate, low skips
- **Stalled**: High skip rate, low completion
- **Recovering**: Improving from stalled state

**Actionable Insights**
- Context-aware suggestions
- Single primary action: "Adjust Workflow"
- No productivity labels or scores

### Section 4: Calendar

**Month View**
- Minimal calendar grid
- Activity markers on days with data
- Today highlighted

**Day Summary**
- Slide-up sheet
- Shows:
  - Context used
  - Workflow used
  - Completion level
  - Execution summary

**Day Comparison**
- Swipe between days
- Compare execution structure
- Not time-based, structure-based

### Section 5: Insights

**Pattern Cards**
- Generated from behavior analysis
- Examples:
  - "You execute better after organising"
  - "Too many Think tasks reduce completion"
- Dismissible
- One insight at a time

**Execution Shape History**
- Visual graph of completion patterns over time
- Shows execution "shape" not just numbers

**Decision Debt Tracker**
- Tracks vague/unclear tasks
- Highlights cognitive overload
- Lists pending decisions

## FlowMind AI System

### Architecture

FlowMind is a deterministic, rule-based AI system. No LLM, no external APIs. All intelligence comes from pattern recognition and rule application.

### Modules

#### 1. Task Intelligence Engine

**Functions:**
- `analyzeTask(task)` - Full task analysis
- `calculateClarity(text)` - Clarity score (0-1)
- `estimateEffort(text)` - Effort level (low/medium/high)
- `detectExecutionType(text)` - Type detection
- `calculateReadiness(task)` - Readiness score

**Clarity Calculation:**
- Length score (longer = clearer)
- Vague keyword detection
- Question mark detection
- Combined into 0-1 score

**Effort Estimation:**
- Keyword-based detection
- Low: "quick", "simple", "easy"
- High: "complex", "detailed", "comprehensive"

#### 2. Behavior Engine

**Functions:**
- `analyzeBehavior(history, tasks, workflows)` - Full behavior analysis
- `detectModeSwitching(history)` - Context switching detection
- `detectStalls(history)` - Execution stall detection
- `calculateMomentum(history)` - Momentum state (flowing/stalled/recovering)
- `calculateCognitiveLoad(tasks, workflows)` - Load assessment

**Momentum Calculation:**
- Completes: +2 points
- Skips: -1.5 points
- Starts: +0.5 points
- Score > 5: Flowing
- Score < -2: Stalled
- Else: Recovering

#### 3. Workflow Intelligence

**Functions:**
- `analyzeWorkflow(workflow, history)` - Workflow analysis
- `calculateWorkflowUsage(workflow, history)` - Usage percentage
- `detectDeviations(workflow, history)` - Deviation detection
- `calculateEffectiveness(workflow, history)` - Effectiveness score

**Deviation Detection:**
- Tracks phase execution order
- Detects phase skipping
- Flags out-of-order execution

#### 4. Cognitive Load Engine

**Functions:**
- `assessCognitiveLoad(state)` - Full load assessment
- `identifyTriggers(state)` - Trigger identification

**Load Calculation:**
- Task count × 0.3
- Workflow tasks × 0.2
- Vague tasks × 0.5
- Total / 10 = Load Index (0-1)

**Triggers:**
- Too many tasks (>10)
- Too many vague tasks (>3)
- Large workflow (>15 tasks)

#### 5. Intervention Engine

**Functions:**
- `shouldIntervene(state)` - Intervention decision
- `generateSuggestion(type, state)` - Suggestion generation

**Intervention Rules:**
- High cognitive load → Suggest organize
- Stall detected → Suggest simplify
- Mode switching → Suggest focus
- Always optional, never auto-applied

### Workflow Generation

**Default Distribution:**
- Planning: 30%
- Execution: 60%
- Cooldown: 10%

**Variant Generation:**
- Deep Work: 40/50/10
- Low Energy: 20/40/40
- Quick Cleanup: 10/70/20

**Checkpoint Insertion:**
- For workflows with >5 execution tasks
- Inserted at midpoint
- Question: "Should we continue or adjust?"

### Pattern Detection

**Patterns Detected:**
1. Execution improvement after organizing
2. Think task overload
3. Mode switching frequency
4. Completion rate patterns

**Pattern Confidence:**
- Based on data volume and consistency
- Higher confidence = more reliable pattern

## Data Schema

### Task Object

```javascript
{
    id: number,
    text: string,
    context: string,
    metadata: {
        clarity: number,        // 0-1
        effort: string,         // 'low' | 'medium' | 'high'
        executionType: string,  // 'think' | 'do' | 'organize' | 'learn'
        readiness: number      // 0-1
    },
    editCount: number,
    skipCount: number,
    createdAt: string,         // ISO timestamp
    vague?: boolean            // For organised tasks
}
```

### Workflow Object

```javascript
{
    id: number,
    name: string,
    createdAt: string,         // ISO timestamp
    phases: {
        planning: Task[],
        execution: Task[],
        cooldown: Task[]
    },
    checkpoints: Checkpoint[],
    variant: string,           // 'default' | 'deep' | 'low' | 'quick'
    context: string,
    status: string,            // 'draft' | 'active' | 'paused'
    currentPhase: string | null,
    version: number
}
```

### Execution Event

```javascript
{
    type: string,              // 'task_start' | 'task_complete' | 'task_skip' | 'workflow_created'
    task: {
        id: number,
        text: string,
        context: string
    } | null,
    timestamp: string          // ISO timestamp
}
```

### Calendar Data

```javascript
{
    [dateKey: string]: {       // Format: 'YYYY-MM-DD'
        context: string,
        workflow: string,
        completion: number,     // 0-1
        summary: string
    }
}
```

## Extending the App

### Adding New AI Capabilities

1. **Add to FlowMind object in `ai.js`**
2. **Create new module or extend existing**
3. **Integrate with intervention engine**
4. **Update documentation**

Example:
```javascript
FlowMind.newModule = {
    analyzeNewFeature(data) {
        // Your analysis logic
        return result;
    }
};
```

### Adding New Sections

1. **Add HTML structure in `index.html`**
2. **Add navigation item**
3. **Create setup function in `app.js`**
4. **Add to `updateAllSections()`**
5. **Update CSS if needed**

### Adding LLM Integration (Future)

**Safe Integration Pattern:**

1. **Create separate module: `llm.js`**
2. **Never replace FlowMind - extend it**
3. **Use LLM for:**
   - Task description enhancement
   - Workflow naming
   - Pattern explanation
4. **Never use LLM for:**
   - Core workflow generation
   - Task organization
   - Decision making
5. **Always optional - user must opt-in**

Example structure:
```javascript
// llm.js
const LLMIntegration = {
    enabled: false,
    
    async enhanceTaskDescription(task) {
        if (!this.enabled) return task.text;
        // LLM call here
    },
    
    async generateWorkflowName(tasks) {
        if (!this.enabled) return `Workflow ${new Date().toLocaleDateString()}`;
        // LLM call here
    }
};
```

**Integration Points:**
- Task entry (optional enhancement)
- Workflow naming (optional)
- Pattern explanations (optional)
- Never in core execution flow

### Adding New Workflow Variants

1. **Add variant to `generateWorkflowVariant()` in `ai.js`**
2. **Add button to HTML**
3. **Update variant selector styling**
4. **Test distribution ratios**

### Adding New Context Types

1. **Add to context grid in HTML**
2. **Add label to contextLabels object**
3. **Update context order in autoOrganise**
4. **No AI changes needed**

## Mobile-First Design

### Touch Targets
- Minimum 44px height
- All interactive elements touch-friendly
- Long-press for advanced actions

### Navigation
- Bottom navigation for thumb access
- Swipe gestures between sections
- Always functional, never broken

### Layout
- Stacked, not grid
- One section visible at a time
- Progressive disclosure
- No horizontal scrolling

## Performance

### Optimizations
- Canvas rendering optimized
- Event history limited to 100 events
- localStorage updates batched
- No unnecessary re-renders

### Memory Management
- Execution history capped at 100
- Old calendar data can be pruned
- Workflow versions limited (can be configured)

## Testing

### Manual Testing Checklist
- [ ] Navigation works on all sections
- [ ] Tasks can be added and removed
- [ ] Workflow generation works
- [ ] Variant switching works
- [ ] Version history works
- [ ] Calendar navigation works
- [ ] Insights render correctly
- [ ] AI suggestions appear
- [ ] Data persists after refresh
- [ ] Mobile touch interactions work

## Future Enhancements

### Potential Features
1. **Export/Import**: JSON export of workflows
2. **Themes**: Additional color schemes
3. **Notifications**: Optional browser notifications
4. **Statistics**: Deeper analytics (optional)
5. **Collaboration**: Share workflows (future)

### AI Enhancements
1. **Learning**: Track what works for user
2. **Personalization**: Adapt to user patterns
3. **Predictions**: Predict completion likelihood
4. **Optimization**: Suggest optimal task ordering

## License & Credits

Built as a premium personal execution system. All code is original and framework-free.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Architecture**: Modular, Event-Driven, Mobile-First
