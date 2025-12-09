# Guide de Configuration WebGPU

## Vérifier la compatibilité

Ouvrez la console de votre navigateur (F12) et tapez :

```javascript
if ('gpu' in navigator) {
    console.log('✅ WebGPU est supporté !');
    navigator.gpu.requestAdapter().then(adapter => {
        console.log('GPU:', adapter);
    });
} else {
    console.log('❌ WebGPU non supporté');
}
```

## Activer WebGPU

### Chrome / Edge

1. Ouvrir `chrome://flags`
2. Rechercher "WebGPU"
3. Activer "Unsafe WebGPU" si nécessaire
4. Redémarrer le navigateur

### Firefox

1. Ouvrir `about:config`
2. Rechercher `dom.webgpu.enabled`
3. Mettre à `true`
4. Redémarrer

### Safari

WebGPU est activé par défaut sur macOS 13+ avec Apple Silicon (M1/M2/M3).

## Troubleshooting

### Erreur "GPU not found"

- Vérifiez que votre GPU est compatible (Vulkan/Metal/DirectX 12)
- Mettez à jour vos drivers graphiques
- Essayez sur une autre machine avec GPU dédié

### Erreur "Out of memory"

- Le modèle est trop gros pour votre GPU
- Utilisez une version quantifiée : `dtype: 'q4'` au lieu de `'fp16'`
- Fermez les autres onglets/applications

### Chargement très lent

- Normal au premier chargement (téléchargement 1-2 GB)
- Les chargements suivants utilisent le cache
- Vérifiez votre connexion internet

## Optimisations

### GPU faible (< 4GB VRAM)

```javascript
generator = await pipeline('text-generation', 'modèle', {
    device: 'webgpu',
    dtype: 'q4',        // Quantification agressive
    max_new_tokens: 50  // Tokens limités
});
```

### GPU puissant (> 8GB VRAM)

```javascript
generator = await pipeline('text-generation', 'modèle', {
    device: 'webgpu',
    dtype: 'fp16',       // Meilleure qualité
    max_new_tokens: 500  // Plus de tokens
});
```
