# Guide de Contribution

Merci de votre intérêt pour DéputéGPT ! 🎉

## 🐛 Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans [Issues](https://github.com/yourusername/deputegpt/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Navigateur et version
   - Système d'exploitation
   - Steps to reproduce
   - Screenshots si applicable
   - Console errors (F12 > Console)

## 💡 Proposer une fonctionnalité

1. Créez une issue avec le template "Feature Request"
2. Décrivez clairement le besoin et le bénéfice
3. Ajoutez des mockups si possible

## 🔧 Contribuer du code

### Setup local

```bash
git clone https://github.com/yourusername/deputegpt.git
cd deputegpt
# Ouvrir index.html dans votre navigateur
```

### Standards de code

- **JavaScript** : ES6+, async/await
- **CSS** : Mobile-first, CSS Grid/Flexbox
- **Commentaires** : En français pour la cohérence
- **Indentation** : 4 espaces

### Process de PR

1. Fork le projet
2. Créez une branche descriptive : `git checkout -b feature/ma-feature`
3. Committez avec des messages clairs : `git commit -m "Ajout: fonctionnalité X"`
4. Testez sur Chrome, Firefox, Safari
5. Pushez : `git push origin feature/ma-feature`
6. Ouvrez une Pull Request

### Checklist avant PR

- [ ] Le code fonctionne localement
- [ ] Aucune erreur console
- [ ] Testé sur mobile et desktop
- [ ] README mis à jour si nécessaire
- [ ] Commentaires ajoutés pour le code complexe

## 📝 Conventions Git

### Types de commits

- `Ajout:` - Nouvelle fonctionnalité
- `Fix:` - Correction de bug
- `Refactor:` - Amélioration du code sans changement fonctionnel
- `Style:` - Changements CSS/UI
- `Docs:` - Documentation uniquement
- `Perf:` - Optimisation de performance

### Exemples

```
Ajout: Recherche par circonscription
Fix: Crash lors du clic sur député sans votes
Refactor: Amélioration de la génération de l'hémicycle
Style: Mode sombre pour le chat
Docs: Instructions WebGPU pour Firefox
Perf: Réduction de la taille du prompt IA
```

## 🧪 Tests

Pour l'instant, tests manuels requis sur :
- Chrome 113+ (Windows, Mac, Linux)
- Edge 113+
- Safari 18+ (Mac M-series)
- Firefox Nightly (avec `dom.webgpu.enabled`)

## ❓ Questions

Ouvrez une [Discussion](https://github.com/yourusername/deputegpt/discussions) ou contactez-moi directement.

Merci ! 🙏
