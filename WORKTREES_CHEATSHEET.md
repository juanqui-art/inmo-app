# Git Worktrees - Cheatsheet Rápido

## 30 segundos de Setup

```bash
# 1. Crear ramas
git branch feature/my-feature
git branch bugfix/my-bugfix

# 2. Crear worktrees
git worktree add ../inmo-app-feature feature/my-feature
git worktree add ../inmo-app-bugfix bugfix/my-bugfix

# 3. Abrir dos terminales
# Terminal 1:
cd ../inmo-app-feature && claude

# Terminal 2:
cd ../inmo-app-bugfix && claude
```

## Después: Fusionar y Limpiar

```bash
# De vuelta en /inmo-app
git merge feature/my-feature
git merge bugfix/my-bugfix

# Limpiar
git worktree remove ../inmo-app-feature
git worktree remove ../inmo-app-bugfix
git branch -d feature/my-feature
git branch -d bugfix/my-bugfix
```

## Ver Estado

```bash
git worktree list      # Ver todas las worktrees
git branch -a          # Ver todas las ramas
git log --all --graph  # Ver historial
```

---

**Para guía completa:** `docs/git-worktrees-guide.md`