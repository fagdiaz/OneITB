// Global design system — sole CSS source of truth (036-theme-and-css-supremacy)
// Legacy files (styles.css, responsive.css, normalize.css) have been disconnected.
// Font Awesome is pinned through npm so CSS, metadata and webfonts remain coherent.
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css'

import { bootstrapApplication } from './bootstrap'

void bootstrapApplication()
