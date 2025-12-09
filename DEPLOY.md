# 🚀 Guide de Déploiement GitHub

## Étape 1: Créer le Repository

```bash
# Sur GitHub.com
1. Cliquez sur "New repository"
2. Nom: deputegpt
3. Description: IA WebGPU pour analyser les votes des députés français
4. Public
5. NE PAS initialiser avec README (on a déjà le nôtre)
6. Créer le repository
```

## Étape 2: Pousser le Code

```bash
# Dans votre terminal (depuis le dossier deputegpt/)

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Ajout: Application DéputéGPT v1.0 avec WebGPU"

# Ajouter le remote (remplacez VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/deputegpt.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

## Étape 3: Activer GitHub Pages

```bash
# Sur GitHub.com, dans votre repository:

1. Settings > Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Save

⏳ Attendez 2-3 minutes

✅ Votre site sera accessible sur:
   https://VOTRE_USERNAME.github.io/deputegpt/
```

## Étape 4: Personnaliser

### Remplacer les placeholders

Dans `index.html` et `README.md`, remplacez:
- `yourusername` → Votre nom d'utilisateur GitHub
- `Votre Nom` → Votre vrai nom
- `votre.email@example.com` → Votre email

### Ajouter un screenshot

1. Ouvrez votre application déployée
2. Prenez un screenshot
3. Ajoutez-le dans le repository: `screenshot.png`
4. Mettez à jour README.md:

```markdown
![Screenshot](screenshot.png)
```

## Étape 5: Optimisations (Optionnel)

### Ajouter un domaine personnalisé

1. Settings > Pages > Custom domain
2. Entrez: `deputegpt.votredomaine.com`
3. Configurez le DNS chez votre registrar:
   ```
   Type: CNAME
   Name: deputegpt
   Value: VOTRE_USERNAME.github.io
   ```

### Activer HTTPS

GitHub Pages active automatiquement HTTPS. Vérifiez:
- Settings > Pages > Enforce HTTPS ✅

## Commandes Git Utiles

```bash
# Voir le statut
git status

# Ajouter des modifications
git add fichier.html
git add .  # Tout ajouter

# Committer
git commit -m "Fix: Correction du bug X"

# Pousser
git push

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Revenir à main
git checkout main

# Merger une branche
git merge feature/nouvelle-fonctionnalite

# Voir l'historique
git log --oneline
```

## Workflow de Développement

```bash
# 1. Créer une branche pour chaque fonctionnalité
git checkout -b feature/mode-sombre

# 2. Faire vos modifications
# ... éditer les fichiers ...

# 3. Tester localement
python -m http.server 8000
# Ouvrir http://localhost:8000

# 4. Committer
git add .
git commit -m "Ajout: Mode sombre"

# 5. Pousser la branche
git push origin feature/mode-sombre

# 6. Créer une Pull Request sur GitHub

# 7. Merger et supprimer la branche
git checkout main
git merge feature/mode-sombre
git push
git branch -d feature/mode-sombre
```

## Troubleshooting

### Erreur "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/VOTRE_USERNAME/deputegpt.git
```

### Erreur "Updates were rejected"

```bash
# Récupérer les changements distants d'abord
git pull origin main --rebase
git push
```

### Pages ne se déploie pas

1. Vérifiez Actions > Pages build and deployment
2. Regardez les logs d'erreur
3. Assurez-vous qu'index.html est à la racine

## Badges pour README (Optionnel)

Ajoutez en haut de README.md:

```markdown
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-orange)
![Mistral](https://img.shields.io/badge/AI-Mistral%203B-purple)
```

## Ressources

- [GitHub Pages Docs](https://docs.github.com/pages)
- [Git Cheat Sheet](https://training.github.com/downloads/github-git-cheat-sheet/)
- [Markdown Guide](https://www.markdownguide.org/)

Bon déploiement ! 🚀
