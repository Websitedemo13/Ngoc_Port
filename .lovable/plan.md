

## Plan: Fix "Auth Session Missing" on Reset Password

### Root Cause
When Supabase redirects to `/reset-password#access_token=...&type=recovery`, the session from the URL hash is processed asynchronously by `supabase.auth.onAuthStateChange`. The current code doesn't wait for the session to be established before allowing the user to submit the form, resulting in "Auth session missing" when `updateUser()` is called.

### Fix in `src/pages/ResetPassword.tsx`

1. **Add a `sessionReady` state** (initially `false`) and a loading spinner while waiting
2. **In the `useEffect`**, listen for `PASSWORD_RECOVERY` event and set `sessionReady = true` when it fires
3. **Add a fallback check**: after a timeout (~3s), check `supabase.auth.getSession()` — if a session exists, allow the form; if not, show an error message ("Link đã hết hạn hoặc không hợp lệ")
4. **In `handleResetPassword`**, verify session exists before calling `updateUser()` — if no session, show appropriate error
5. **Show a loading state** while the session is being established (between page load and session ready)
6. **Show an error/expired state** if no session is found after timeout, with a button to request a new reset link

### Changes Summary
- Single file edit: `src/pages/ResetPassword.tsx`
- Add `sessionReady` and `sessionError` states
- Gate the password form behind `sessionReady`
- Show loading spinner while waiting for auth event
- Show expired/error UI if session never arrives

