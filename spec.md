# Borola Party App

## Current State
Full party app with Home, MLAs, Candidates, Join the Party, Supporters, and Admin panel pages. Admin login uses hardcoded credentials (BOROLA2026 / 784509). The backend stores admin sessions in a non-stable Map, meaning sessions are lost on every canister upgrade. The frontend checks localStorage for a stored token and shows a spinner while verifying -- but if the token is invalid (expired after upgrade), the spinner never resolves to the login form.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend: make `adminSessions`, `mlAs`, `candidates`, and `supporters` Maps use `stable` so they survive canister upgrades
- Frontend AdminPage: when `verifyAdmin` returns `false`, clear the localStorage token and redirect to login form instead of staying stuck

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with `stable` Maps for all data stores (mlAs, candidates, supporters, adminSessions)
2. Fix frontend `useAdminSession` hook: if verifyQuery returns data === false, call logout() to clear localStorage and stop showing the spinner
