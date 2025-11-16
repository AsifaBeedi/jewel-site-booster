<#
Run this script from the repository root to remove `.env` from the git index while keeping the local file.
It will:
  - remove .env from the index (git rm --cached .env)
  - add a commit "chore: remove .env from repo and add to .gitignore"
  - push the commit to the current branch

Usage:
  PowerShell> .\scripts\remove_env_from_git.ps1

# Ensure git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git not found in PATH. Install git and try again."
    exit 1
}

Write-Host "Removing .env from git index (keeps the local file)..."
git rm --cached .env
git add .gitignore
git commit -m "chore: remove .env from repo and add to .gitignore"
Write-Host "Pushing commit to origin/$(git rev-parse --abbrev-ref HEAD)"
git push

Write-Host ".env removed from git index and commit pushed. Remember to rotate any exposed secrets immediately."

# end
