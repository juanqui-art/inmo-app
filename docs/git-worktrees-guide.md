# Git Worktrees Guide - InmoApp

> Referencia rápida para usar git worktrees y trabajar en paralelo con múltiples Claude Code sesiones

---

## ¿Qué son Git Worktrees?

Git worktrees permiten tener **múltiples directorios de trabajo del mismo repositorio simultáneamente**, cada uno en una rama diferente.

**Ventajas:**
- ✅ Trabaja en 2+ ramas en paralelo sin stash/pop
- ✅ Cambio instantáneo entre branches (solo cambiar directorio)
- ✅ Sin interferencias entre sesiones de Claude Code
- ✅ Historial git limpio y ordenado

---

## Flujo Rápido (5 minutos)

### 1. Crear dos ramas para trabajar

```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app

git branch feature/nombre-de-tu-feature
git branch bugfix/nombre-de-tu-bugfix
```

### 2. Crear worktrees

```bash
# Feature worktree
git worktree add ../inmo-app-feature feature/nombre-de-tu-feature

# Bugfix worktree
git worktree add ../inmo-app-bugfix bugfix/nombre-de-tu-bugfix
```

**Ahora tienes 3 directorios:**
```
/inmo-app              (main - original)
/inmo-app-feature      (tu feature branch)
/inmo-app-bugfix       (tu bugfix branch)
```

### 3. Abrir dos terminales y trabajar en paralelo

**Terminal 1:**
```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app-feature
claude
# Claude sesión 1 - trabajando en feature
```

**Terminal 2:**
```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app-bugfix
claude
# Claude sesión 2 - trabajando en bugfix
```

### 4. Commits en cada worktree (se hace automáticamente)

Los commits se hacen en sus respectivas ramas:
- Terminal 1 → commits van a `feature/nombre-de-tu-feature`
- Terminal 2 → commits van a `bugfix/nombre-de-tu-bugfix`

### 5. Fusionar a main

Cuando ambas sesiones terminen:

```bash
# En terminal original (/inmo-app)
cd /Users/juanquizhpi/Desktop/projects/inmo-app

# Fusionar feature
git merge feature/nombre-de-tu-feature

# Fusionar bugfix
git merge bugfix/nombre-de-tu-bugfix

# Verificar que todo está bien
git log --oneline -5
```

### 6. Limpiar worktrees

```bash
git worktree remove ../inmo-app-feature
git worktree remove ../inmo-app-bugfix

# Verificar
git worktree list  # Solo debe mostrar la original
```

---

## Comandos Útiles

### Ver todas las worktrees
```bash
git worktree list
```

**Output:**
```
/Users/juanquizhpi/Desktop/projects/inmo-app          d7a55cd [main]
/Users/juanquizhpi/Desktop/projects/inmo-app-feature  74fb8b9 [feature/dark-mode]
/Users/juanquizhpi/Desktop/projects/inmo-app-bugfix   72af068 [bugfix/auth]
```

### Ver branches
```bash
git branch -a
```

### Ver historial con todas las ramas
```bash
git log --oneline --all --graph -10
```

### Eliminar una worktree específica
```bash
git worktree remove /ruta/a/worktree
```

### Eliminar una rama después de fusionar
```bash
git branch -d feature/nombre-de-tu-feature
git branch -d bugfix/nombre-de-tu-bugfix
```

---

## Ejemplo Real (paso a paso)

### Escenario: Arreglar bug Y agregar feature simultáneamente

```bash
# 1️⃣ Crear ramas
git branch feature/dark-mode-navbar
git branch bugfix/auth-accessibility

# 2️⃣ Crear worktrees
git worktree add ../inmo-app-feature feature/dark-mode-navbar
git worktree add ../inmo-app-bugfix bugfix/auth-accessibility

# 3️⃣ Terminal 1 - Feature
cd ../inmo-app-feature
claude
# → Haces cambios en dark-mode-navbar
# → Claude commits automáticamente con conventional commits

# 4️⃣ Terminal 2 - Bugfix (simultáneamente)
cd ../inmo-app-bugfix
claude
# → Haces cambios en auth-accessibility
# → Claude commits automáticamente

# 5️⃣ Cuando ambas terminan
cd ../inmo-app
git merge feature/dark-mode-navbar
git merge bugfix/auth-accessibility

# 6️⃣ Limpiar
git worktree remove ../inmo-app-feature
git worktree remove ../inmo-app-bugfix
```

---

## Evitar Conflictos

### Regla 1: No edites el mismo archivo en dos worktrees
Si necesitas editar el mismo archivo, hazlo en una sola rama primero.

### Regla 2: Los archivos editados no pueden sincronizarse entre worktrees
Cada worktree es independiente. Los cambios no editados se sincronizan automáticamente, pero los editados son locales a cada worktree.

### Regla 3: Si hay conflicto en merge
```bash
# Git te avisará en la fusión
# Resolve el conflicto manualmente
git status  # Ver archivos en conflicto
git add .
git commit -m "Resolve merge conflicts"
```

---

## Estructura de Directorios

```
/Users/juanquizhpi/Desktop/projects/
├── inmo-app/                      ← Original (main)
│   ├── apps/web/
│   ├── packages/
│   ├── .git/                      ← Compartido por todas
│   └── docs/
│
├── inmo-app-feature/              ← Worktree 1
│   ├── apps/web/                  ← Mismos archivos, rama diferente
│   ├── packages/
│   └── (apunta a .git compartido)
│
└── inmo-app-bugfix/               ← Worktree 2
    ├── apps/web/                  ← Mismos archivos, rama diferente
    ├── packages/
    └── (apunta a .git compartido)
```

---

## Checklist de Uso

- [ ] Créaste las ramas con `git branch`
- [ ] Creaste los worktrees con `git worktree add`
- [ ] Abriste 2+ terminales
- [ ] Ejecutaste `claude` en cada terminal
- [ ] Los cambios se hicieron en paralelo
- [ ] Hiciste commit en cada rama
- [ ] Fusionaste a main con `git merge`
- [ ] Eliminaste los worktrees con `git worktree remove`
- [ ] Eliminaste las ramas con `git branch -d`

---

## Solucionar Problemas

### "fatal: 'branch' is already checked out"
**Problema:** Intentaste crear un worktree para una rama que ya está en uso.
```bash
# Solución: La rama solo puede estar en UN worktree a la vez
# O usa otra rama o elimina el worktree existente
```

### "fatal: invalid path"
**Problema:** La ruta del worktree no existe o tiene permiso denegado.
```bash
# Solución: Asegúrate que el directorio padre existe
ls -la /Users/juanquizhpi/Desktop/projects/
# Debe existir inmo-app y poder crear inmo-app-feature, etc.
```

### Cambios desaparecieron
**Problema:** Editaste algo pero no se sincroniza entre worktrees.
```bash
# Worktrees son INDEPENDIENTES. Los cambios no editados sí se sincronizan,
# pero los que editaste son locales a ese worktree
# Debes hacer commit y merge para que aparezcan en otra rama
```

### Merge conflict
**Problema:** Git no puede fusionar automáticamente.
```bash
# Solución: Resuelve conflictos manualmente
git status  # Ver archivos en conflicto
# Edita los archivos y resuélve los conflictos
git add .
git commit -m "Resolve merge conflicts"
```

---

## Comandos de Referencia Rápida

```bash
# Crear ramas
git branch feature/nombre
git branch bugfix/nombre

# Crear worktrees
git worktree add ../inmo-app-feature feature/nombre
git worktree add ../inmo-app-bugfix bugfix/nombre

# Verificar
git worktree list
git branch -a

# Después de trabajo
git merge feature/nombre
git merge bugfix/nombre

# Limpiar
git worktree remove ../inmo-app-feature
git worktree remove ../inmo-app-bugfix
git branch -d feature/nombre
git branch -d bugfix/nombre
```

---

## Tips & Tricks

### Nombra los worktrees claramente
```bash
# ❌ Evita nombres genéricos
git worktree add ../inmo-app-1 feature/feature1

# ✅ Usa nombres descriptivos
git worktree add ../inmo-app-dark-mode feature/dark-mode-navbar
git worktree add ../inmo-app-auth-fix bugfix/auth-accessibility
```

### Atajos útiles (agregar a .bashrc o .zshrc)

```bash
# Crear worktree rápido
alias gwt='git worktree'

# Atajos comunes
alias gwtl='git worktree list'
alias gwtr='git worktree remove'
alias gwtadd='git worktree add'

# Uso:
gwtl                                           # Listar
gwtr ../inmo-app-feature                       # Remover
gwtadd ../inmo-app-feature feature/dark-mode   # Agregar
```

### Automatizar el cleanup
```bash
# Script para limpiar worktrees y branches (guarda en cleanup-worktrees.sh)
#!/bin/bash
echo "Limpiando worktrees..."
git worktree list | grep -v "$(pwd)" | awk '{print $1}' | xargs -r git worktree remove
echo "Limpiando branches locales (excepto main)..."
git branch | grep -v "main" | xargs -r git branch -d
echo "✅ Cleanup completado"

# Hacer ejecutable
chmod +x cleanup-worktrees.sh

# Usar
./cleanup-worktrees.sh
```

---

## Comparación: Con vs Sin Worktrees

### SIN Worktrees (Tedioso)
```bash
# Estoy en feature
git stash                    # Guardar cambios

# Cambio a bugfix
git checkout bugfix
# ...hago trabajo...
git add . && git commit

# Vuelvo a feature
git checkout feature
git stash pop                # Recuperar cambios

# Cambio a main
git checkout main
git merge feature
git merge bugfix
```

### CON Worktrees (Limpio)
```bash
# Terminal 1: Feature
cd ../inmo-app-feature && claude

# Terminal 2: Bugfix (simultáneamente)
cd ../inmo-app-bugfix && claude

# Terminal 3: Main
cd ../inmo-app
git merge feature/...
git merge bugfix/...
```

---

## Referencias

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [InmoApp Git Workflow](./git-workflow.md) (si existe)
- Conventional Commits: https://www.conventionalcommits.org/

---

**Última actualización:** 2025-10-19
**Autor:** Claude Code + InmoApp Team