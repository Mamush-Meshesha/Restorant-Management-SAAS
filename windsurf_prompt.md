# Objective
Complete the API integration for the Restaurant Management System, fix the generic CRUD creation flows, and resolve React nesting and 404 routing errors. 

# Background & Current State
We recently migrated the frontend from using hardcoded mock data to fetching real data from the Express/Prisma backend. 
To achieve this, we upgraded the generic `frontend/src/views/shared/DataTablePage.tsx` component to accept asynchronous functions (`fetchFn`, `createFn`, `updateFn`, `deleteFn`) and a `formSchema` prop to dynamically generate Add/Edit modals. All of our admin pages (Menu Items, Customers, Users, Tables, etc.) are exported from `frontend/src/views/shared/PlaceholderPages.tsx` and utilize this generic `DataTablePage` component.

# Issues to Fix

## 1. The "Add/Create" Functionality is Failing
When attempting to add a new record via the generic `DataTablePage` modal (e.g., adding a new Customer, Menu Item, or Employee), the creation fails. 
**Root Causes to Investigate:**
- **Payload Mismatches:** The dynamic form in `DataTablePage.tsx` maps user inputs to a flat object `formValues`. Some backend endpoints require specific data types (e.g., numbers/booleans) or nested relational IDs (like `category_id`, `role_id`, `branch_id`) that might not be correctly captured or formatted by the generic text inputs.
- **Missing Foreign Keys:** Some schemas might need to automatically append the authenticated user's `organization_id` or `branch_id` from the Redux store (`frontend/src/redux/slices/authSlice.ts`) before sending the request.
- **Task:** Debug the generic `handleSave` function in `DataTablePage.tsx` and the `formSchema` configurations in `PlaceholderPages.tsx`. Ensure the payloads sent to the `createFn` match exactly what the Express controllers expect.

## 2. 404 Errors on Certain Backend Routes
The frontend is throwing `404 (Not Found)` errors when trying to fetch certain data, specifically:
`GET http://localhost:3000/api/v1/table?branchId=... 404 (Not Found)`
**Root Cause:** 
While the backend route files exist (e.g., `backend/src/api/routes/table.routes.ts`, `analytics.routes.ts`, `customer.routes.ts`), they have **not been mounted** in the main router index.
**Task:** 
Open `backend/src/api/index.ts` and ensure that all necessary route files from `backend/src/api/routes/` are correctly imported and mounted to the main Express router (e.g., `router.use('/table', tableRoutes);`).

## 3. React HTML Nesting / Hydration Error
The browser console is throwing the following error:
`<h2> cannot contain a nested <h6>. DataTablePage.tsx:409 In HTML, <h6> cannot be a child of <h2>.`
**Root Cause:**
In `frontend/src/views/shared/DataTablePage.tsx` (around line 400), there is a Material-UI `<DialogTitle>` component wrapping a `<Typography variant="h6">`. By default, `<DialogTitle>` renders as an `<h2>` element, resulting in an invalid `<h2>` -> `<h6>` DOM structure.
**Task:**
Fix the nesting in `DataTablePage.tsx` by either removing the inner `<Typography>` and applying its styles directly to `<DialogTitle>`, or by using the `component="div"` prop on `<DialogTitle>` to prevent the `<h2>` wrapper.

# Folder Structure Reference
**Frontend (`frontend/`)**:
- `src/views/shared/DataTablePage.tsx` -> Generic table & CRUD modal component.
- `src/views/shared/PlaceholderPages.tsx` -> Page configurations (Orders, Categories, Customers, etc.).
- `src/api/` -> Axios wrappers (e.g., `_menu.ts`, `_tables.ts`, `_customer.ts`).
- `src/redux/` -> Redux store (auth state).

**Backend (`backend/`)**:
- `src/api/index.ts` -> Main API router (Needs to be updated to mount missing routes).
- `src/api/routes/` -> Express route definitions.
- `src/controller/` -> Business logic.

# Instructions
1. Start by fixing the 404 errors by mounting the missing routes in `backend/src/api/index.ts`.
2. Fix the HTML nesting error in `DataTablePage.tsx`.
3. Test creating a new record (e.g., a Menu Category or Customer) via the UI. Inspect the network payload and the backend logs to identify why it fails.
4. Modify `DataTablePage.tsx` and the schemas in `PlaceholderPages.tsx` to handle correct type casting (parsing strings to numbers) and injecting required context variables (like `branch_id`) so the backend accepts the payloads.
