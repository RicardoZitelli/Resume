# 🚀 Ricardo Zitelli — Interactive Resume

An interactive resume website built with a focus on clean UI, performance, and user experience, showcasing my professional background as a Senior .NET Backend Engineer.

🔗 Live Demo: https://ricardozitelli.github.io/Resume/

---

## ✨ Overview

This project is a single-page resume application designed to present professional information in a modern, interactive format.

Features:
- Smooth navigation through sections
- Visual progress tracking based on scroll
- Bilingual support (Portuguese / English)
- Clean and responsive UI

---

## 🧠 Key Features

- Custom Progress Bar (Web Component)
- Internationalization (i18n)
- Scroll-Based Navigation
- Modern UI/UX
- Zero Dependencies

---

## 🏗️ Architecture

index.html — Main application
progress-bar.js — Reusable Web Component

---

## 📦 `<progress-bar>` Web Component

A zero-dependency, fully customizable progress bar built as a native Web Component (Shadow DOM).

### Installation

```html
<script src="progress-bar.js"></script>
```

### Basic usage

```html
<progress-bar steps="STEP 1,STEP 2,STEP 3"></progress-bar>
```

---

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `steps` | string | — | Comma-separated list of step labels. Defines the number of steps and their names. |
| `count` | number | — | Overrides the number of steps (ignores extra labels if fewer than `steps`). |
| `color-empty` | string | `#ffffff` | Color of unfilled circles and the track line. |
| `color-filled` | string | `#7B2FBE` | Color of the filled track line and circle background. |
| `color-checkmark` | string | `#fcb034` | Color of the checkmark icon inside filled circles. |
| `heading` | string | — | Optional heading text rendered above the progress bar. |
| `heading-color` | string | `#fcb034` | Color of the heading text. |
| `show-btn` | boolean | `false` | When present, renders a action button below the bar. |
| `btn-label` | string | `NEXT STEP` | Label for the action button. |
| `btn-restart` | string | `RESTART` | Label shown on the button when all steps are completed. |
| `btn-color` | string | `#fcb034` | Background color of the button. |
| `btn-text-color` | string | `#051B23` | Text color of the button. |
| `btn-href` | string | — | If provided, clicking the button opens this URL in a new tab instead of advancing steps. |
| `hide-checkmark` | boolean | `false` | When present, hides the checkmark SVG inside filled circles. |
| `fireworks` | boolean | `false` | When present, triggers a fireworks particle effect from the circle when it gets filled. |

---

### JavaScript API

After obtaining a reference to the element, the following methods are available:

```js
const bar = document.querySelector('progress-bar');
```

| Method | Description |
|---|---|
| `bar.next()` | Advances to the next step with animation. If already at the last step, resets. |
| `bar.reset()` | Resets all steps to the initial state. |
| `bar.goTo(index)` | Instantly jumps to the given step index (0-based). |
| `bar.setProgress(index, ratio)` | Sets the active section index and a fill ratio (0–1) for the current step's track line. Ideal for scroll-driven progress. |
| `bar.setLabels(labelsArray)` | Replaces the step labels at runtime. Useful for i18n language switching. |

---

### Events

| Event | Detail | Description |
|---|---|---|
| `step-click` | `{ index: number }` | Fired when the user clicks on a circle. Use this to scroll to the corresponding section. |

```js
bar.addEventListener('step-click', (e) => {
  const section = document.querySelector(`[data-section="${e.detail.index}"]`);
  section?.scrollIntoView({ behavior: 'smooth' });
});
```

---

### Full example

```html
<!-- All available attributes -->
<progress-bar
  steps="STEP 1,STEP 2,STEP 3,STEP 4"
  count="4"
  color-empty="#37474f"
  color-filled="#FBBF24"
  color-checkmark="#051B23"
  heading="MY PROGRESS"
  heading-color="#fcb034"
  show-btn
  btn-label="NEXT"
  btn-restart="START OVER"
  btn-color="#fcb034"
  btn-text-color="#051B23"
  btn-href="https://linkedin.com/in/your-profile"
  hide-checkmark
  fireworks>
</progress-bar>

<script>
  const bar = document.querySelector('progress-bar');

  // Advance to next step
  bar.next();

  // Jump directly to step index 2
  bar.goTo(2);

  // Drive progress from scroll position
  window.addEventListener('scroll', () => {
    bar.setProgress(sectionIndex, ratio); // ratio: 0.0 – 1.0
  });

  // Swap labels at runtime (e.g. language switch)
  bar.setLabels(['RESUMO', 'TECNOLOGIAS', 'EXPERIÊNCIA', 'IDIOMAS']);

  // Reset all steps
  bar.reset();

  // React to circle clicks
  bar.addEventListener('step-click', (e) => {
    const section = document.querySelector(`[data-section="${e.detail.index}"]`);
    if (!section) return;
    const headerH = document.querySelector('header')?.offsetHeight ?? 0;
    window.scrollTo({ top: section.offsetTop - headerH, behavior: 'smooth' });
  });
</script>
```

---

## 🧑‍💻 About Me

Senior Backend Engineer with strong experience in:
- .NET / C#
- SQL Server
- Distributed systems
- APIs (REST / SOAP)
- Messaging (RabbitMQ)
- Cloud & observability (Azure, Application Insights)

---

## 📬 Contact

LinkedIn: https://www.linkedin.com/in/ricardo-zitelli
GitHub: https://github.com/RicardoZitelli

---

## 📄 License

MIT License
