# Settings Module

A self-contained user account management module for the React + Firebase SaaS Starter Kit.

---

## What It Does

Adds a `/settings` page where authenticated users can:

- **View** their email address (read-only)
- **Update** their display name (synced to Firebase Auth + Firestore)
- **Delete** their account with a typed confirmation modal

---

## Files

| File | Purpose |
|---|---|
| `src/services/SettingsService.ts` | All Firebase logic for profile updates and account deletion |
| `src/pages/SettingsPage.tsx` | The UI — card layout, form, confirmation modal |

`App.tsx` has been updated to include the `/settings` route.
`firestore.rules` has been updated to allow users to delete their own profile document.

---

## How to Navigate to Settings

The settings page lives at `/settings`. To link to it from your dashboard header, add:

```tsx
import { Link } from 'react-router-dom';

<Link to="/settings" className="text-sm text-slate-500 hover:text-slate-800">
  Settings
</Link>
```

---

## How It Works

### Update Display Name

`updateDisplayName(user, displayName)` in `SettingsService.ts`:

1. Calls `updateProfile(user, { displayName })` — updates the Firebase Auth user object
2. Calls `updateDocument('users', user.uid, { displayName })` — syncs to Firestore

Both are wrapped in a single try/catch. If the Firestore document doesn't exist yet (e.g. Google sign-in users who haven't had their profile created), the Auth update still succeeds and the Firestore call will return a `not-found` error.

### Delete Account

`deleteAccount(user)` in `SettingsService.ts`:

1. Deletes the Firestore `/users/{uid}` document
2. Calls `deleteUser(user)` to delete the Firebase Auth account

> **Note:** Firestore subcollections (e.g. `/users/{uid}/items`) are **not** deleted client-side. To clean those up automatically, create a Firebase Cloud Function triggered by `functions.auth.user().onDelete()`.

### auth/requires-recent-login

Firebase requires a recent sign-in before deleting an account. If the user's session is older than a few minutes, `deleteUser` throws `auth/requires-recent-login`. The UI surfaces a friendly message telling the user to sign out and sign back in.

---

## How to Remove This Module

This module is fully self-contained. To remove it from the project:

1. Delete `src/services/SettingsService.ts`
2. Delete `src/pages/SettingsPage.tsx`
3. Remove the `/settings` route from `src/App.tsx`:
   ```tsx
   // Remove these lines:
   import { SettingsPage } from '@/pages/SettingsPage';

   <Route
     path="/settings"
     element={
       <ProtectedRoute>
         <SettingsPage />
       </ProtectedRoute>
     }
   />
   ```
4. Optionally revert the `firestore.rules` user delete rule back to `allow delete: if false`

The rest of the app — Auth, Dashboard, CRUD — continues to function perfectly.

---

## Firestore Rules

The Settings module requires one rule change to allow users to delete their own profile document:

```js
match /users/{userId} {
  allow delete: if isOwner(userId); // Required for account deletion
}
```

This is already applied in `firestore.rules`. Remember to deploy:

```bash
firebase deploy --only firestore:rules
```
