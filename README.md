# DistrictEye

This project now includes Firebase authentication and role-based access control.

## Implemented Auth Features

- Email + password sign up and sign in (Firebase Authentication).
- Google sign in (Firebase Authentication popup flow).
- Password storage is secure and hashed by Firebase Auth (passwords are never stored in Firestore by this app).
- User profile documents in `users/{uid}` with role field (`viewer` by default).
- Role-based access for upload:
  - `admin`: can access `/upload` and write records.
  - `viewer`: can access dashboard and leaderboard only.

## Environment Variables

Set these in your `.env`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Firebase Console Setup

1. In Firebase Authentication:
2. Enable `Email/Password` provider.
3. Enable `Google` provider.

## Firestore Security Rules

Use the rules in `firestore.rules`:

- Signed-in users can read records.
- Only admins can create/update/delete records.
- Users can only create themselves as `viewer` role.
- Only admins can promote/demote roles.

## Promote an Admin

New users are created as `viewer`. Promote an admin by updating the Firestore document:

- Collection: `users`
- Document: `<uid>`
- Field: `role = "admin"`

After role update, sign out/sign in once to refresh role-based UI and access.
