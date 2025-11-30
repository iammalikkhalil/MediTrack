# Personal Medical Kit Web App

## Overview
A personal medical kit management web application designed for single-user personal use during illness and low-energy situations. Built as a responsive web app with simple hardcoded authentication.

**Core Philosophy**: Every interaction should take ≤3 clicks, require minimal typing, and provide immediate value when you're sick.

## Technology Stack
- **Frontend**: React with Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: Hardcoded username/password with session cookies
- **State Management**: TanStack Query

## Default Credentials
- **Username**: admin
- **Password**: medkit123
- Remember Me: 30-day session cookie

## Project Structure
```
client/
  src/
    components/          # Reusable UI components
      medicine-card.tsx  # Medicine display card
      symptom-button.tsx # Symptom selection button
      stock-badge.tsx    # Stock status indicator
      quick-action-button.tsx
      low-stock-alert.tsx
      theme-provider.tsx
      theme-toggle.tsx
    pages/               # Route pages
      login.tsx          # Authentication page
      dashboard.tsx      # Main dashboard
      symptoms.tsx       # Symptom selection
      quick-access.tsx   # Frequently used medicines
      shopping.tsx       # Out-of-stock list
      inventory.tsx      # Full medicine inventory
      medicine-detail.tsx # Individual medicine view
      history.tsx        # Usage history
    lib/
      auth.tsx           # Authentication context
      queryClient.ts     # TanStack Query setup
      utils.ts
    hooks/
      use-toast.ts
    App.tsx

server/
  index.ts              # Express server entry
  routes.ts             # API routes
  storage.ts            # MongoDB storage layer
  mongodb.ts            # MongoDB connection

shared/
  schema.ts             # Shared TypeScript types and Zod schemas
```

## API Routes
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check authentication status

- `GET /api/medicines` - All medicines
- `GET /api/medicines/:id` - Single medicine
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

- `GET /api/medicines/quick-access` - Recently/frequently used
- `GET /api/medicines/low-stock` - Medicines with quantity ≤3
- `POST /api/medicines/take-dose` - Log consumption, reduce quantity
- `POST /api/medicines/restock` - Reset to default quantity
- `POST /api/medicines/restock-all` - Restock all low-stock

- `GET /api/symptoms/search?symptoms=...` - Find medicines by symptoms
- `GET /api/usage` - Usage history
- `GET /api/usage/medicine/:id` - Usage for specific medicine

## Data Models

### Medicine
- name, category, purpose, dosage
- quantity, defaultQuantity
- symptoms[] - array of symptom tags
- usageCount, lastUsed, isQuickAccess

### UsageLog
- medicineId, medicineName
- dose, symptoms[], timestamp
- wasEffective (optional)

## Design System
- **Colors**: Sage green (#A3C6A0) primary, Muted teal (#6FAF9B) secondary
- **Typography**: Inter font, 18px body, 28px headings
- **Stock Status**: Green (>3), Yellow (≤3), Red (0)

## Features
1. **Dashboard**: Quick actions, recent activity, quick access medicines
2. **Symptom Selection**: 9 common symptom buttons, zero-typing
3. **Medicine Search**: Priority-sorted by match + stock + frequency
4. **One-Click Dosing**: Immediate stock reduction and logging
5. **Quick Access**: Recently used (7 days) + frequently used (5+ times)
6. **Shopping List**: Out-of-stock view with restock functionality
7. **Inventory Management**: CRUD with category filtering
8. **Usage History**: Chronological log with symptom tags

## Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
