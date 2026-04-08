# OpenKettle Workflow & Conventions

## ⚙️ Core Commands & Order
*   **Development Server:** ``npm run dev`` (Vite, automatic watching)
*   **Build Artifacts:** ``npm run build`` (Sequence: `tsc` $\rightarrow$ `vite build`.)
*   **Recommended Check Order:** `npm run lint` $\rightarrow$ `npm run type-check` $\rightarrow$ `npm run test` (Strict sequential dependency assumed.)

## 🧱 Architecture & Quirks
*   **Tech Stack:** Client-side React/TypeScript environment on Vite.
*   **Type Safety:** Strict usage enforced via `tsconfig.json` (`"strict": true`).
*   **Database:** Supabase integration uses `supabase-js`. Specific setup steps must be documented if non-standard.
*   **Testing:** Uses Vitest; base command is ``npm run test``.

## 🧠 Agent Guiding Principles
*   Trust executable source: Prefer configuration/scripts over prose docs when conflicts arise.
*   **Execution Flow:** Assume build artifacts and type checking must precede runtime.
*   **Missing Context:** If critical infrastructure/setup flow is undocumented, use the `question` tool to seek clarification.
