Security actions you should run now

- If you ever committed or shared `SUPABASE_SERVICE_ROLE_KEY`, rotate it immediately in the Supabase dashboard.
- The project currently contains a local `.env` file for development. Do NOT commit that file. Use the included script `scripts\remove_env_from_git.ps1` to remove it from the git index while keeping the local copy.
- Add the client variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) into Vercel project environment variables (Production and Preview as needed) rather than committing them.

Steps:

1. From repo root, run (PowerShell):

   .\scripts\remove_env_from_git.ps1

2. Rotate any exposed keys in Supabase if necessary.
