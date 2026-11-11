/* Assignment 11: JSON -> dynamic elements -> event handlers */
let programData;
const completed = new Set();
const planned = new Set();
const byId = id => document.getElementById(id);
const getCourse = code => programData.courses.find(course => course.code === code);
const completedOrPlanned = code => completed.has(code) || planned.has(code);

// Every nested array represents OR; all groups together represent AND.
function missingPrerequisites(course) {
    return course.prerequisites.filter(group => !group.some(code => completed.has(code)));
}

function choiceIssue(course) {
    if (course.group === 'language') {
        const other = programData.courses.find(c => c.group === 'language' && c.code !== course.code);
        if (other && completedOrPlanned(other.code)) return `Alternative already chosen: ${other.code}`;
    }
    if (course.group === 'elective') {
        const count = programData.courses.filter(c => c.group === 'elective' && completedOrPlanned(c.code)).length;
        if (count >= 3) return 'Three elective choices already selected';
    }
    return '';
}

function availability(course) {
    if (completed.has(course.code)) return 'Completed';
    if (planned.has(course.code)) return 'Already in plan';
    const issue = choiceIssue(course);
    if (issue) return issue;
    const missing = missingPrerequisites(course);
    if (missing.length) return `Needs: ${missing.map(group => group.join(' OR ')).join(' AND ')}`;
    return '';
}

function makeButton(label, handler, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (className) button.className = className;
    button.addEventListener('click', handler);
    return button;
}

function makeCard(course, type, reason = '') {
    const card = document.createElement('article');
    card.className = `course-card ${type}`;
    const header = document.createElement('div');
    header.className = 'course-header';
    const code = document.createElement('strong');
    code.className = 'course-code';
    code.textContent = course.code;
    const credits = document.createElement('span');
    credits.className = 'course-credits';
    credits.textContent = `${course.credits} credits`;
    header.append(code, credits);
    const name = document.createElement('span');
    name.className = 'course-name';
    name.textContent = course.name;
    const info = document.createElement('p');
    info.className = 'course-info';
    info.textContent = reason || course.note;
    card.append(header, name, info);
    if (type === 'available') {
        card.draggable = true;
        card.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', course.code);
            event.dataTransfer.effectAllowed = 'copy';
        });
        const actions = document.createElement('div');
        actions.className = 'course-actions';
        actions.append(makeButton('Add to plan', () => addToPlan(course.code)), makeButton('Info', () => {
            byId('advisorMessage').textContent = `${course.code}: ${course.note}`;
        }, 'advisor-outline'));
        card.append(actions);
    }
    if (type === 'planned') {
        const actions = document.createElement('div');
        actions.className = 'course-actions';
        actions.append(makeButton('Remove', () => { planned.delete(course.code); render(); }));
        card.append(actions);
    }
    return card;
}

function render() {
    const completedBox = byId('completedCourses');
    const availableBox = byId('availableCourses');
    const lockedBox = byId('lockedCourses');
    const planBox = byId('plannedCourses');
    completedBox.replaceChildren();
    availableBox.replaceChildren();
    lockedBox.replaceChildren();
    planBox.replaceChildren();
    let readyCount = 0;
    for (const course of programData.courses) {
        // All checkboxes and labels are generated from JSON.
        const row = document.createElement('div');
        row.className = 'course-card';
        const label = document.createElement('label');
        label.className = 'course-check';
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = completed.has(course.code);
        check.addEventListener('change', () => {
            if (check.checked) {
                // Enforce program selection rules even when marking courses completed.
                const conflict = choiceIssue(course);
                if (conflict) {
                    byId('advisorMessage').textContent = `${course.code}: ${conflict}. Uncheck another selection first.`;
                    render();
                    return;
                }
                planned.delete(course.code);
                completed.add(course.code);
            } else {
                completed.delete(course.code);
            }
            // Drop planned courses that no longer satisfy prerequisites or choice limits.
            for (const code of [...planned]) {
                const selected = getCourse(code);
                if (missingPrerequisites(selected).length) planned.delete(code);
            }
            render();
        });
        const text = document.createElement('span');
        text.textContent = `${course.code} — ${course.name}`;
        const small = document.createElement('small');
        small.textContent = `${course.credits} credits · ${course.group === 'language' ? 'Choose one language' : course.group === 'elective' ? 'Choose 3 electives' : 'Required program course'}`;
        text.append(small);
        label.append(check, text);
        row.append(label);
        completedBox.append(row);
        if (planned.has(course.code)) planBox.append(makeCard(course, 'planned'));
        else if (!completed.has(course.code)) {
            const reason = availability(course);
            if (reason) lockedBox.append(makeCard(course, 'locked', reason));
            else { availableBox.append(makeCard(course, 'available')); readyCount++; }
        }
    }
    if (!availableBox.children.length) availableBox.textContent = 'No eligible courses right now.';
    if (!lockedBox.children.length) lockedBox.textContent = 'No locked courses.';
    byId('emptyPlan').hidden = planned.size > 0;
    byId('doneCount').textContent = completed.size;
    byId('readyCount').textContent = readyCount;
    byId('planCount').textContent = planned.size;
    byId('planCredits').textContent = [...planned].reduce((sum, code) => sum + getCourse(code).credits, 0);
}

function addToPlan(code) {
    const course = getCourse(code);
    if (!course) return;
    const reason = availability(course);
    if (reason) { byId('advisorMessage').textContent = `${code} cannot be added: ${reason}.`; return; }
    planned.add(code);
    byId('advisorMessage').textContent = `${code} added to your plan!`;
    render();
}

async function initializeAdvisor() {
    try {
        const response = await fetch('advisor-data.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        programData = await response.json();
        byId('programNote').textContent = `${programData.program} · ${programData.catalog} · Demonstration of program-specific courses only.`;
        const sourceLink = document.createElement('a');
        sourceLink.href = programData.source;
        sourceLink.textContent = 'View the official Daytona State College program guide';
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener noreferrer';
        byId('catalogSource').append('Source: ', sourceLink);
        const dropZone = byId('planDropZone');
        dropZone.addEventListener('dragover', event => { event.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', event => {
            event.preventDefault();
            dropZone.classList.remove('drag-over');
            addToPlan(event.dataTransfer.getData('text/plain'));
        });
        byId('clearAll').addEventListener('click', () => {
            completed.clear(); planned.clear();
            byId('advisorMessage').textContent = 'All selections cleared.';
            render();
        });
        byId('copyPlan').addEventListener('click', async () => {
            const lines = [...planned].map(code => { const c = getCourse(code); return `${c.code} - ${c.name} (${c.credits} credits)`; });
            const output = `Course Garden Advisor - ${programData.program}\n${lines.length ? lines.join('\n') : 'No courses planned.'}\nTotal credits: ${byId('planCredits').textContent}`;
            try { await navigator.clipboard.writeText(output); byId('advisorMessage').textContent = 'Course plan copied!'; }
            catch { byId('advisorMessage').textContent = 'Copy unavailable in this browser. Please select courses manually.'; }
        });
        render();
    } catch (error) {
        byId('programNote').textContent = 'Unable to load advisor-data.json. Run with VS Code Live Server or open the GitHub Pages version. Make sure all files are in the same folder.';
        byId('advisorMessage').textContent = error.message;
    }
}
document.addEventListener('DOMContentLoaded', initializeAdvisor);
