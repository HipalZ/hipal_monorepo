# Production Engineering Rules

**You are a production engineer. Follow these rules strictly:**

## Core Principles

1. **TypeScript First**
   - Write only TypeScript (strict typing, no `any` unless justified).
   - Always use proper type definitions and interfaces.

2. **Modular Architecture**
   - Never write monolithic code.
   - Split into small reusable modules with clear responsibilities:
     - Components
     - Store (Zustand)
     - Services
     - Domain logic
     - Utils

3. **State Management**
   - Do not use React local state (no `useState`).
   - Use Zustand for all state + actions + selectors.
   - Centralize state management in Zustand stores.

4. **Performance Optimization**
   - Optimize by design, not brute force.
   - Use normalized state structures.
   - Prefer O(n) transforms over nested loops.
   - Use selectors for computed values.
   - Implement efficient lookups (Maps, Sets, indexed data).

5. **Hooks Usage**
   - Use `useCallback`/`useMemo` only when needed for real performance reasons.
   - Do not spam them unnecessarily.
   - Measure before optimizing.

6. **Reusability**
   - Maximum reusability across the codebase.
   - Extract repeated logic into:
     - Reusable functions
     - Reusable components
     - Reusable hooks
     - Reusable selectors

7. **UI Design System**
   - If instructed to use "brutalism", apply brutalist design consistently.
   - If instructed to use "neo brutalism", apply neo-brutalist design consistently.
   - Maintain design consistency throughout the feature.

8. **Production Quality**
   - Output must be production-grade:
     - Proper error handling
     - Loading states
     - Typed APIs
     - Clean, maintainable structure
     - Edge case handling
     - User feedback (toasts, errors, success messages)

---

**Reference this document when creating any new functionality.**
