# Taskflow — Dynamic Task Manager & Productivity Tracker (CRUD)

A responsive task management app built with semantic HTML5, CSS3, and vanilla JavaScript. It persists task data in browser `localStorage`, so tasks survive page reloads in the same browser.

## Features
- Full CRUD: create, read, edit, and delete tasks
- Categories: Work, Personal, Study, and Other
- Optional due dates with overdue/today indicators
- Mark tasks active or completed
- Filter by All, Active, Completed, or category
- Search task title, description, and category
- Sort by recently added, due date, or task name
- Statistics for total, active, completed, and overdue tasks
- Clear completed tasks
- Light/dark theme preference persisted in localStorage
- Responsive sidebar, task list, and task form
- Confirmation before destructive deletion/clear operations
- Keyboard-friendly buttons, form labels, and live task-list announcements

## Run locally
1. Download and extract the ZIP.
2. Open `index.html` in a modern browser, or open the folder in VS Code and run it with the Live Server extension.
3. Add tasks using the form. Data is stored in this browser only.

No npm installation or build step is required.

## Data storage
Tasks are stored under the browser key `taskflow-crud-tasks-v1`; theme preference uses `taskflow-theme-v1`. Clearing browser site data or using a different browser/device may remove or not show the saved tasks. This demo does not send task data to a server.

## Tech stack
- HTML5
- CSS3 (Grid, Flexbox, media queries, transitions)
- JavaScript ES6+
- DOM manipulation
- Web Storage API (`localStorage`)

## Project structure
```
task-manager-crud/
├── index.html
├── style.css
├── script.js
└── README.md
```
