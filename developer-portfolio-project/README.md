# Developer Portfolio & Project Showcase

A responsive personal developer portfolio built with semantic HTML5, CSS3, and vanilla JavaScript. No build tools or package installation are required.

## Features
- Mobile-first responsive layout with CSS Grid and Flexbox
- Light/dark theme toggle saved using `localStorage`
- Mobile hamburger navigation
- Smooth scrolling between sections
- Project details modal with Escape/backdrop close behavior
- Skills, about, featured projects, and contact sections
- Reduced-motion accessibility support
- Ready to deploy on GitHub Pages, Netlify, or Vercel

## Run locally
1. Extract the ZIP file.
2. Open `index.html` in a browser.
3. For a local development server, open this folder in VS Code and use the Live Server extension.

## Personalize before publishing
Search the project files and replace:
- `Your Name` with your name
- `hello@example.com` with your email
- GitHub and LinkedIn URLs with your profiles
- Sample project descriptions and repository links with your real projects
- `assets/resume.pdf` with your actual résumé PDF (create an `assets` folder)

## Deploy

### GitHub Pages
1. Create a GitHub repository and upload the files.
2. In the repository, open **Settings → Pages**.
3. Choose the branch (usually `main`) and root folder, then save.
4. Wait for the published site URL to appear in Pages settings.

### Netlify
Drag the extracted project folder into Netlify Drop, or connect the GitHub repository.

### Vercel
Import the repository in Vercel. Choose the static/Other preset if prompted; no build command is needed and the output directory is `.`.

## Project structure
```
developer-portfolio-project/
├── index.html
├── style.css
├── script.js
└── README.md
```
