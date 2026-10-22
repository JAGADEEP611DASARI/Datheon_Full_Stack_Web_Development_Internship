(() => {
  'use strict';
  const STORAGE_KEY = 'taskflow-crud-tasks-v1';
  const THEME_KEY = 'taskflow-theme-v1';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const taskList = $('#taskList');
  const taskTemplate = $('#taskTemplate');
  const taskForm = $('#taskForm');
  const taskTitle = $('#taskTitle');
  const taskDescription = $('#taskDescription');
  const taskCategory = $('#taskCategory');
  const taskDue = $('#taskDue');
  const editingId = $('#editingId');
  const saveTask = $('#saveTask');
  const cancelEdit = $('#cancelEdit');
  const searchInput = $('#searchInput');
  const sortSelect = $('#sortSelect');
  const toast = $('#toast');

  let tasks = loadTasks();
  let activeFilter = 'all';
  let activeCategory = '';
  let toastTimer;

  $('#year').textContent = new Date().getFullYear();
  $('#todayLabel').textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  }).format(new Date());

  if (localStorage.getItem(THEME_KEY) === 'dark') document.body.classList.add('dark');
  updateThemeButton();

  function loadTasks() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(stored) ? stored.filter(task =>
        task && typeof task.id === 'string' && typeof task.title === 'string'
      ) : [];
    } catch (error) {
      console.warn('Unable to load saved tasks:', error);
      return [];
    }
  }

  function persistTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      showToast('Could not save tasks. Check your browser storage settings.');
      console.error('Unable to save tasks:', error);
      return false;
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${task.dueDate}T00:00:00`) < today;
  }

  function formatDueDate(dateString) {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00`);
    return `Due ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)}`;
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleTasks = tasks.filter(task => {
      const statusMatches = activeFilter === 'all' ||
        (activeFilter === 'active' && !task.completed) ||
        (activeFilter === 'completed' && task.completed);
      const categoryMatches = !activeCategory || task.category === activeCategory;
      const queryMatches = !query ||
        `${task.title} ${task.description || ''} ${task.category}`.toLowerCase().includes(query);
      return statusMatches && categoryMatches && queryMatches;
    });

    visibleTasks.sort((a, b) => {
      if (sortSelect.value === 'due') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortSelect.value === 'title') return a.title.localeCompare(b.title);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    taskList.replaceChildren();
    if (!visibleTasks.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('div');
      icon.className = 'empty-icon';
      icon.textContent = query ? '⌕' : '✳';
      const heading = document.createElement('strong');
      heading.textContent = query ? 'No matching tasks' : (tasks.length ? 'Nothing to see here' : 'A fresh start');
      const message = document.createElement('p');
      message.textContent = query ? 'Try a different search phrase.' : (tasks.length ? 'Try changing your filters.' : 'Add your first task and build some momentum.');
      empty.append(icon, heading, message);
      taskList.append(empty);
    } else {
      visibleTasks.forEach(task => taskList.append(createTaskElement(task)));
    }

    const active = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    const overdue = tasks.filter(isOverdue).length;
    $('#allCount').textContent = tasks.length;
    $('#activeCount').textContent = active;
    $('#completedCount').textContent = completed;
    $('#totalStat').textContent = tasks.length;
    $('#activeStat').textContent = active;
    $('#completedStat').textContent = completed;
    $('#overdueStat').textContent = overdue;
    $('#resultCount').textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'}`;
    const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    $('#focusProgress').style.width = `${percent}%`;
    $('#focusCaption').textContent = `${percent}% completed`;
    $('#breadcrumbLabel').textContent = activeCategory || titleForFilter(activeFilter);
    $('#listTitle').textContent = activeCategory ? `${activeCategory} tasks` : titleForFilter(activeFilter) === 'All tasks' ? 'Your tasks' : titleForFilter(activeFilter);
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.filter === activeFilter && !activeCategory));
    $$('.filter-tab').forEach(button => button.classList.toggle('active', button.dataset.filter === activeFilter));
    $$('.category-item').forEach(button => button.classList.toggle('active', button.dataset.category === activeCategory));
    $('#clearCategory').style.opacity = activeCategory ? '1' : '.5';
  }

  function titleForFilter(filter) {
    return ({ all: 'All tasks', active: 'Active tasks', completed: 'Completed tasks' })[filter] || 'All tasks';
  }

  function createTaskElement(task) {
    const fragment = taskTemplate.content.cloneNode(true);
    const row = fragment.querySelector('.task-row');
    const check = fragment.querySelector('.task-check');
    const title = fragment.querySelector('.task-title-line h3');
    const category = fragment.querySelector('.task-category');
    const description = fragment.querySelector('.task-description');
    const due = fragment.querySelector('.due-label');
    const created = fragment.querySelector('.created-label');
    row.classList.toggle('completed', task.completed);
    check.setAttribute('aria-label', task.completed ? 'Mark task active' : 'Mark task complete');
    title.textContent = task.title;
    category.textContent = task.category;
    category.classList.add(task.category.toLowerCase());
    description.textContent = task.description || '';
    due.textContent = formatDueDate(task.dueDate);
    if (isOverdue(task)) {
      due.classList.add('overdue');
      due.textContent += ' · Overdue';
    } else if (task.dueDate && task.dueDate === localDateString(new Date()) && !task.completed) {
      due.classList.add('due-today');
      due.textContent += ' · Today';
    }
    created.textContent = task.createdAt ? `Added ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(task.createdAt))}` : '';
    check.addEventListener('click', () => toggleComplete(task.id));
    fragment.querySelector('.edit-action').addEventListener('click', () => startEditing(task.id));
    fragment.querySelector('.delete-action').addEventListener('click', () => deleteTask(task.id));
    return fragment;
  }

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  taskForm.addEventListener('submit', event => {
    event.preventDefault();
    const title = taskTitle.value.trim();
    if (!title) {
      taskTitle.focus();
      showToast('Please enter a task name.');
      return;
    }
    const now = Date.now();
    if (editingId.value) {
      const index = tasks.findIndex(task => task.id === editingId.value);
      if (index < 0) {
        resetForm();
        showToast('That task could not be found. Please try again.');
        return;
      }
      const oldTask = tasks[index];
      tasks[index] = {
        ...oldTask,
        title,
        description: taskDescription.value.trim(),
        category: taskCategory.value,
        dueDate: taskDue.value,
        updatedAt: now
      };
      if (!persistTasks()) return;
      resetForm();
      render();
      showToast('Task updated successfully.');
    } else {
      const task = {
        id: (crypto.randomUUID ? crypto.randomUUID() : `${now}-${Math.random().toString(16).slice(2)}`),
        title,
        description: taskDescription.value.trim(),
        category: taskCategory.value,
        dueDate: taskDue.value,
        completed: false,
        createdAt: now,
        updatedAt: now
      };
      tasks.unshift(task);
      if (!persistTasks()) {
        tasks = tasks.filter(item => item.id !== task.id);
        return;
      }
      resetForm();
      activeFilter = 'all';
      activeCategory = '';
      render();
      showToast('Task created. Nice work!');
    }
  });

  function toggleComplete(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;
    task.updatedAt = Date.now();
    if (!persistTasks()) return;
    render();
    showToast(task.completed ? 'Task completed — well done!' : 'Task marked active.');
  }

  function startEditing(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    editingId.value = task.id;
    taskTitle.value = task.title;
    taskDescription.value = task.description || '';
    taskCategory.value = task.category || 'Work';
    taskDue.value = task.dueDate || '';
    $('#formTitle').textContent = 'Edit task';
    $('#formSubtitle').textContent = 'Make changes and save your task.';
    saveTask.textContent = '✓ Save changes';
    cancelEdit.hidden = false;
    $('#formPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    taskTitle.focus({ preventScroll: true });
  }

  function resetForm() {
    taskForm.reset();
    editingId.value = '';
    $('#formTitle').textContent = 'Create a task';
    $('#formSubtitle').textContent = 'Make it happen, one task at a time.';
    saveTask.textContent = '＋ Create task';
    cancelEdit.hidden = true;
  }

  function deleteTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    const oldTasks = tasks;
    tasks = tasks.filter(item => item.id !== id);
    if (!persistTasks()) {
      tasks = oldTasks;
      return;
    }
    if (editingId.value === id) resetForm();
    render();
    showToast('Task deleted.');
  }

  $$('.nav-item, .filter-tab').forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      activeCategory = '';
      render();
    });
  });

  $$('.category-item').forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = activeCategory === button.dataset.category ? '' : button.dataset.category;
      activeFilter = 'all';
      render();
    });
  });
  $('#clearCategory').addEventListener('click', () => { activeCategory = ''; render(); });
  $('#newTaskTop').addEventListener('click', () => {
    resetForm();
    $('#formPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    taskTitle.focus({ preventScroll: true });
  });
  cancelEdit.addEventListener('click', resetForm);
  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);
  $('#clearCompleted').addEventListener('click', () => {
    const count = tasks.filter(task => task.completed).length;
    if (!count) {
      showToast('No completed tasks to clear.');
      return;
    }
    if (!window.confirm(`Remove all ${count} completed task${count === 1 ? '' : 's'}?`)) return;
    const oldTasks = tasks;
    tasks = tasks.filter(task => !task.completed);
    if (!persistTasks()) {
      tasks = oldTasks;
      return;
    }
    render();
    showToast('Completed tasks cleared.');
  });
  $('#themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeButton();
  });
  function updateThemeButton() {
    const dark = document.body.classList.contains('dark');
    $('#themeToggle').textContent = dark ? '☀' : '☾';
    $('#themeToggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  render();
})();
