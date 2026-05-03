---
name: commit
description: Analyze changes and create an informed commit message
allowed-tools: Bash(git *), Bash(backend/gradlew *), Read, Grep, Glob
---

# Auto-Commit

1. Run `git status` to see staged and unstaged files
2. Run `git diff` and `git diff --cached` to examine changes
3. Run `git log -5 --oneline` to see recent commit message style
4. Generate a clear commit message following conventional commits format:
    - `feat(<scope>): <description>` for new features
    - `fix(<scope>): <description>` for bug fixes
    - `refactor`, `docs`, `chore`, etc. as appropriate
5. If any changed files are Kotlin (`.kt`/`.kts`), run the linter from the `backend/` directory:
   ```bash
   backend/gradlew -p backend ktlintFormat spotlessApply
   ```
   Then re-check `git diff` for any auto-fixed formatting changes.
6. Stage specific changed files by name (do NOT use `git add .` or `git add -A` to avoid staging secrets)
7. Commit using a HEREDOC for proper formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <description>

   Co-Authored-By: Claude <noreply@anthropic.com>
   Ticket: RAD-XXXX
   EOF
   )"
   ```

Keep the first line under 72 characters. Use imperative mood ("add" not "added").
