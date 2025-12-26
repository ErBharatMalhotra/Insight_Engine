# Insight Engine

Insight Engine is an experimental web demonstration exploring the capabilities of generative AI without the need for backend infrastructure. It leverages **Pollinations AI** public APIs to transform simple user inputs into refined text and visual outputs.

## 🚀 Features & Modes

Each mode uses the same underlying AI pipeline with different prompt strategies.
The application features three distinct modes of operation:

### Mode A: Insight Mode
*   **Goal:** Turn a rough thought into wisdom.
*   **Process:** Takes a topic, generates a philosophical refinement (Text), and visualizes that insight (Image).

### Mode B: Prompt Builder Mode
*   **Goal:** Create professional AI art prompts.
*   **Process:** Takes a simple idea, expands it into a detailed prompt (Text), and renders the result of that prompt (Image).

### Mode C: Explain Mode (ELI10)
*   **Goal:** Simplify complex concepts.
*   **Process:** Takes a complex topic, explains it for a 10-year-old (Text), and creates a conceptual illustration (Image).

## 🛠️ Tech Stack

*   **HTML5**: Semantic structure.
*   **CSS3**: Clean, minimal styling with flexbox.
*   **Vanilla JavaScript**: Client-side logic and API orchestration.
*   **APIs**:
    *   Pollinations Text API (OpenAI compatible)
    *   Pollinations Image API

## 📦 Installation & Usage

Since this is a client-side only project, no build steps or server installations are required.

1.  Download the files (`index.html`, `style.css`, `script.js`).
2.  Open `index.html` in any modern web browser.
3.  Select a mode, type an input, and click **Generate**.

## ⚠️ Note on Experimentation

This project is a **demo/experiment**.
*   It relies on public, free APIs which may have rate limits or latency.
*   No API keys are stored or required.
*   All generation happens on the fly.
*   This project is intended for learning and creative exploration purposes only.

---

*Created as a minimal code exploration.*