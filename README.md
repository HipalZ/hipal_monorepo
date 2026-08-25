# HiPal Monorepo

/////////////

## Project Structure

///
First, run the development server:

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- Bun (used as the package manager/runner)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies (from the root or specific package):
   ```bash
   bun install
   ```

### Running the Applications

**HiBiz Client (POS):**
```bash
cd clients/client-hibiz-react
bun run dev
```
Runs on `http://localhost:3001` (or similar, check console output).

**HiTable Client:**
```bash
cd clients/client-hitable-react
bun run dev
```

**Server:**
```bash
cd servers/server
bun run dev
```

## Recent Features & Updates

### Kitchen Form UI Redesign
- **Split-Pane Layout**: The "Create/Edit Kitchen" form has been improved with a 2-column layout. 
    - **Left Panel**: Kitchen Details (Name, Description).
    - **Right Panel**: Embedded Dish Selection.
- **Bulk Dish Selection**: Users can now select all dishes in a category with a single click in the `DishSelectionPanel`.
- **Improved UX**: Fixed scrolling issues and optimized the selection flow for better usability with large menus.

### Offline-First Architecture
- **Menu Management**: Full offline capabilities for creating and editing menus, categories, and dishes. Changes are synced when online.
- **Data Persistence**: Uses IndexedDB for reliable local storage of business data.

## Technologies Used

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **State Management**: Zustand, TanStack Query
- **Local Database**: Dexie (IndexedDB wrapper)
- **Icons**: Lucide React
production