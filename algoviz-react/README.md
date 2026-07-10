<p align="center">
  <img src="assets/fcainew.png" width="120" alt="FCAI-Visualizer Logo" />
</p>

<h1 align="center">FCAI-Visualizer</h1>

## An Advanced Educational Platform for Algorithmic and Data Structure Visualization

<<<<<<< HEAD
### Overview
The FCAI Algorithm Visualizer is a sophisticated, web-based platform designed to facilitate the pedagogical study of complex data structures and algorithms. By providing high-fidelity, interactive visualizations, the platform assists students and educators in conceptualizing the internal mechanics of computational processes.

### Core Implementation Modules
=======
<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Clean_Architecture-✅-success?style=for-the-badge" alt="Clean Architecture" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  Interactive, animated visualizations of algorithms and data structures.<br/>
  Built with <strong>Clean Architecture</strong> (Domain → Application → Infrastructure) and <strong>Strategy Pattern</strong>.<br/>
  AI-powered quizzes with automatic API key rotation across 14 Groq keys.
</p>
>>>>>>> bef4755 (refactor: clean architecture + 26 algorithm wrappers + AI key rotation + comparison mode)

#### 1. Tree Structures and Self-Balancing Algorithms
The platform features a robust implementation of Binary Search Trees (BST) with comprehensive support for AVL self-balancing protocols.
- **Dynamic Balancing:** Real-time execution of LL, RR, LR, and RL rotations to maintain tree equilibrium.
- **Layout Optimization:** Implementation of the Reingold-Tilford algorithm for organized node positioning.
- **Traversal Demonstrations:** Sequential visualization of Pre-Order, In-Order, Post-Order, and Breadth-First traversals.
- **Operational Analysis:** Interactive search, predecessor/successor identification, and node deletion with path highlighting.
- **Automated Generation:** Parametric generation of tree structures for varied complexity testing.

#### 2. Graph Theory and Traversal
The system provides interactive environments for the study of graph-based algorithms:
- **Traversal Algorithms:** Sequential visualization of Breadth-First Search (BFS) and Depth-First Search (DFS).
- **Shortest Path Analysis:** Implementation of Dijkstra's algorithm with dynamic edge weight adjustments.
- **Interactive Modeling:** Capabilities for user-defined vertex and edge configuration.

<<<<<<< HEAD
#### 3. AI-Integrated Educational Services
Integration with advanced language models via the OpenRouter API enables the following features:
- **Contextual Inquiry:** Automated generation of educational assessments based on the current visualization state.
- **Trace Analysis:** Detailed textual explanations of algorithmic transitions and state changes.

#### 4. Supplemental Algorithms
- **Sorting:** Implementations of Bubble, Selection, Insertion, Merge, Quick, and Heap sort algorithms.
- **Searching:** Comparative analysis of Linear and Binary search methodologies.
- **Linear Data Structures:** Visualizations for Stacks, Queues, and various Linked List configurations.

### Technical Architecture

The application is engineered with a focus on performance, scalability, and modularity.

- **Frontend Framework:** React 18.3
- **Build Infrastructure:** Vite 5.4
- **Routing:** React Router v6
- **Graphics Engine:** HTML5 Canvas 2D API for high-performance, frame-perfect animations.
- **Design Methodology:** A custom CSS-based design system utilizing CSS Variables for consistent theme application (Light and Dark modes).
- **Architecture Strategy:** Decoupling of core algorithmic logic from the React rendering cycle to ensure performance stability during intensive graphical operations.

### System Requirements and Installation

#### Prerequisites
- Node.js (Version 18.0.0 or higher)
- npm (Node Package Manager)

#### Local Installation Protocol
1. **Clone Repository:**
   ```bash
   git clone https://github.com/Yosef-Ibrahim/AlgoVs.git
   ```
2. **Directory Navigation:**
   ```bash
   cd algoviz-react
   ```
3. **Dependency Acquisition:**
   ```bash
   npm install
   ```
4. **Execution of Development Environment:**
   ```bash
   npm run dev
   ```

### Deployment
=======
### ✅ Fully Implemented
- **Sorting** — Bubble, Selection, Insertion, Merge, Quick, Heap, Counting, Radix Sort
- **Searching** — Linear, Binary, Jump Search
- **Trees** — BST & AVL with real-time auto-balancing, rotations, Reingold-Tilford layout
- **Graphs** — BFS, DFS, Dijkstra, Prim (MST), Kruskal (MST)
- **Data Structures** — Array, Stack, Queue, Singly/Doubly/Circular/Ordered Linked List
- **Practice Mode** — AI-powered quizzes with 200+ built-in fallback questions
- **Algorithm Comparison** — Run two algorithms side-by-side on the same input
- **Dark/Light Theme** toggle
- **Canvas animations** with step-by-step tracing

### 🏗️ Architecture
- **Domain Layer** — Pure entities (`Algorithm`, `Step`, `Question`, `ApiKey`)
- **Application Layer** — Use cases (`GenerateQuestionUseCase`, `ApiKeyManager`) + algorithm wrappers (26 algorithms)
- **Infrastructure Layer** — Canvas renderers, localStorage persistence
- **Strategy Pattern** — Every algorithm implements `generateSteps(input)` uniformly

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Yosef-Ibrahim/FCAI-Visualizer.git

# 2. Navigate to the project
cd FCAI-Visualizer/algoviz-react

# 3. Install dependencies
npm install

# 4. (Optional) Set up AI API keys
#    Copy .env.example to .env and add your keys:
#    - Groq (free): https://console.groq.com/keys
#    - OpenRouter (free trial): https://openrouter.ai/keys
#    - Gemini (free): https://aistudio.google.com/apikey
cp .env.example .env

# 5. Start the development server
npm run dev
```

The app opens at `http://localhost:5173`

### Build for Production
>>>>>>> bef4755 (refactor: clean architecture + 26 algorithm wrappers + AI key rotation + comparison mode)

The platform is optimized for deployment on Vercel. For production-ready builds, execute the following command:
```bash
npm run build
<<<<<<< HEAD
=======
npm run preview
>>>>>>> bef4755 (refactor: clean architecture + 26 algorithm wrappers + AI key rotation + comparison mode)
```

### Contribution Guidelines
Contributions to the FCAI Algorithm Visualizer should follow the established architectural patterns:
1. Algorithmic logic must be implemented as pure JavaScript within the `src/algorithms/` directory.
2. User interface components should be integrated into the `src/pages/` directory.
3. Routing and navigation must be updated in `App.jsx` and `Sidebar.jsx` respectively.

<<<<<<< HEAD
### License
This project is distributed under the MIT License.

=======
## 🔑 API Keys (Optional)

The app works out of the box with **200+ built-in quiz questions** — no API key needed.

For AI-generated questions, configure keys in `.env`:

| Variable | Provider | Free Tier |
|---|---|---|
| `VITE_GROQ_API_KEY_1`..`_14` | Groq | 30 req/min per key |
| `VITE_OPENROUTER_API_KEY` | OpenRouter | Trial credits |
| `VITE_GEMINI_API_KEY` | Google Gemini | 60 req/min |
| `VITE_OPENAI_API_KEY` | OpenAI | Paid |

The `ApiKeyManager` auto-rotates keys and applies a 24h cooldown on rate-limited ones.

---

## 📁 Project Structure

```
algoviz-react/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── api/chat.js                     # Vercel serverless proxy
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── domain/                     # Pure business entities
    │   ├── algorithms/Algorithm.js
    │   ├── algorithms/Step.js
    │   ├── quiz/Question.js
    │   └── apikeys/ApiKey.js
    ├── application/                # Use cases & wrappers
    │   ├── AlgorithmRegistry.js
    │   ├── quiz/GenerateQuestionUseCase.js
    │   ├── apikeys/ApiKeyManager.js
    │   └── algorithms/
    │       ├── sorting/      (8)
    │       ├── searching/    (3)
    │       ├── trees/        (3)
    │       ├── graphs/       (5)
    │       └── dataStructures/ (7)
    ├── infrastructure/             # External concerns
    │   ├── canvas/
    │   │   ├── CanvasRenderer.js
    │   │   ├── GraphCanvasRenderer.js
    │   │   └── DataStructureRenderer.js
    │   └── apikeys/ApiKeyStore.js
    ├── algorithms/                 # Legacy imperatives
    ├── components/
    │   ├── layout/ (Layout, Sidebar, Header)
    │   └── ai/ (QuizPanel, ApiKeyTable, ScoreBoard, TracePanel)
    ├── pages/
    │   ├── Home.jsx
    │   ├── Sorting.jsx / Searching.jsx / Trees.jsx
    │   ├── DataStructures.jsx / Graphs.jsx
    │   ├── PracticeMode.jsx
    │   ├── Compare.jsx
    │   └── ApiKeys.jsx
    ├── services/aiService.js
    └── styles/
```

---

## 🌐 Deployment (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import on https://vercel.com
#    Framework: Vite
#    Root: algoviz-react/
#    Build: npm run build
#    Output: dist/

# 3. Add environment variables in Vercel Dashboard:
#    VITE_GROQ_API_KEY_1, VITE_OPENROUTER_API_KEY, etc.
```

The `vercel.json` handles SPA routing; `api/chat.js` proxies AI requests.

---

## 📄 License

MIT
>>>>>>> bef4755 (refactor: clean architecture + 26 algorithm wrappers + AI key rotation + comparison mode)
