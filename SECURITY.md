# SECURITY.md — Firestore Security Rules

This document explains the security model for `firestore.rules`, how to verify it works, and how to extend it safely.

---

## Principle of Least Privilege

Every rule in this file follows one principle: **grant the minimum access required, nothing more.**

- Authenticated users can only access their own documents
- No user can read or write another user's data
- Every collection not explicitly listed is denied by default
- Field-level validation prevents clients from writing arbitrary data shapes

---

## Rule Breakdown

### Helper Functions

```js
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function hasOnlyFields(fields) {
  return request.resource.data.keys().hasOnly(fields);
}
```

- `isAuthenticated()` — confirms a valid Firebase Auth session exists
- `isOwner(userId)` — confirms the caller's UID matches the document path. A user with UID `abc` cannot access `/users/xyz/...` even if they are authenticated
- `hasOnlyFields(fields)` — prevents clients from injecting extra fields into a document on write

---

### Users Collection (`/users/{userId}`)

```js
match /users/{userId} {
  allow read:   if isOwner(userId);
  allow create: if isOwner(userId)
                && hasOnlyFields(['displayName', 'email', 'photoURL', 'createdAt', 'updatedAt']);
  allow update: if isOwner(userId)
                && hasOnlyFields(['displayName', 'photoURL', 'updatedAt']);
  allow delete: if false;
}
```

- Users can only read their own profile document
- On create, only the listed fields are accepted — no arbitrary data
- On update, only display name and photo can be changed — email is immutable
- Delete is blocked entirely — account deletion goes through Firebase Auth, not a Firestore delete

---

### Items Subcollection (`/users/{userId}/items/{itemId}`)

```js
match /items/{itemId} {
  allow read:   if isOwner(userId);
  allow create: if isOwner(userId)
                && hasOnlyFields(['text', 'createdAt']);
  allow delete: if isOwner(userId);
  allow update: if false;
}
```

- Items are scoped to the owning user — user `abc` cannot read `/users/xyz/items`
- Create is field-validated: only `text` and `createdAt` are accepted
- Update is disabled — the UI deletes and re-creates instead
- Delete is allowed only by the owner

---

### Default Deny

```js
match /{document=**} {
  allow read, write: if false;
}
```

This catch-all rule denies everything not explicitly allowed above. **Do not remove it.** Any new collection you add must have an explicit rule above this one.

---

## Testing the Rules in the Firebase Console

No code required — use the built-in Rules Playground.

1. Firebase Console → **Firestore Database → Rules** tab
2. Click **Rules Playground** (top right)
3. Set the **Operation**, **Path**, and **Authentication state**, then click **Run**

### Tests to run

| Operation | Path | Auth UID | Expected result |
|---|---|---|---|
| `get` | `/users/abc` | `abc` | Allow |
| `get` | `/users/abc` | `xyz` | Deny |
| `get` | `/users/abc` | none | Deny |
| `create` | `/users/abc/items/1` | `abc` with `{ text: "hi", createdAt: now }` | Allow |
| `create` | `/users/abc/items/1` | `abc` with `{ text: "hi", malicious: true }` | Deny (extra field) |
| `create` | `/users/abc/items/1` | `xyz` | Deny (wrong user) |
| `update` | `/users/abc/items/1` | `abc` | Deny (updates disabled) |

---

## Adding a New Collection Safely

Add the new rule **above** the default deny block. Use `isOwner()` for user-scoped data and `hasOnlyFields()` to validate writes.

```js
// Example: a notes collection scoped to each user
match /users/{userId}/notes/{noteId} {
  allow read:   if isOwner(userId);
  allow create: if isOwner(userId)
                && hasOnlyFields(['title', 'body', 'createdAt']);
  allow update: if isOwner(userId)
                && hasOnlyFields(['title', 'body', 'updatedAt']);
  allow delete: if isOwner(userId);
}
```

Then add the corresponding service file at `src/services/NotesService.ts` following the same pattern as `CRUDService.ts`. Deploy the updated rules with:

```bash
firebase deploy --only firestore:rules
```

Never use `allow read, write: if true` — not even temporarily in development.
