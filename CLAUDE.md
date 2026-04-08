# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Development Commands

**Building the Application:**
The build process is assumed to be managed by `npm run build`. This compiles the application for production and should be run before deployment.

**Linting:**
Run linting checks using `npm run lint` to enforce code quality standards across all components and utilities.

**Testing:**
*   **Run All Tests:** Execute the full test suite using `npm run test`.
*   **Run Single Test:** For isolated testing, run specific files or selectors (e.g., `npm test src/calculators/abv.test.ts`).

## 🧱 High-Level Architecture & Structure

The application follows a component-based architecture heavily utilizing TypeScript and React Hooks.

### 1. Presentation Layer (`src/components`)
This layer contains all reusable UI components. Components are highly specialized and generally responsible for rendering a single piece of UI, managing their own state, and calling services/hooks for business logic.
*   **Layout:** Contains structural components like `AppShell.tsx`.
*   **Shared:** Holds universal, reusable components that appear across multiple feature areas (e.g., `RecipeCard.tsx`, `Spinner.tsx`).
*   **Feature Modules:** Specific areas like `recipe-editor/` group related components for a single view (e.g., `MashTab.tsx`, `WaterTab.tsx`).

### 2. Business Logic Layer (`src/calculators`)
This module contains pure, testable utility functions for complex calculations related to brewing science (e.g., ABV, IBU, Mash calculations). **This layer should be treated as stateless and highly testable.** Changes here often require updating the corresponding test file in `src/calculators/__tests__/`.

### 3. State Management & Interactivity (`src/hooks`)
Custom React hooks, such as `useAuth.ts`, encapsulate reusable logic that interacts with external services (like Auth state) or complex local component state, promoting clean separation from component rendering logic.

### 4. Data & Context
*   **Data Sources:** Static, immutable reference data (e.g., `src/data/bjcp2021.ts`) should be read from here.
*   **Styling/Global State:** Styling and global configurations are managed via `src/index.css`.

### 💡 Key Patterns to Follow
1.  **Single Responsibility:** Components must do minimal work; complex logic belongs in Hooks or Calculators.
2.  **Calculators are Pure:** Any function within `src/calculators` should ideally be pure, deterministic, and only depend on its inputs.
3.  **Auth Flow:** Authentication logic is centralized within `src/hooks/useAuth.ts` and components must use this hook for state management.

---
*This file was generated to guide future development in this repository.*