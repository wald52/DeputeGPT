# 📝 Notes sur l'Intégration ONNX de Mistral

## Situation Actuelle (Décembre 2025)

### Modèle Mistral-3B ONNX

Le modèle `Ministral-3-3B-Instruct-2512-ONNX` existe sur HuggingFace:
https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-ONNX

**Fichiers disponibles:**
```
onnx/
├── decoder_model.onnx           (3.4 GB)
├── decoder_model_merged.onnx    (3.4 GB)
├── decoder_with_past_model.onnx (3.5 GB)
└── ...
```

### ⚠️ Problème: Non compatible avec transformers.js

**Raison:** Ces fichiers ONNX bruts ne sont pas au format attendu par transformers.js v3.

transformers.js nécessite:
- `config.json` formaté spécifiquement
- `tokenizer.json` au format Hugging Face
- Structure de fichiers spécifique
- Métadonnées pour le pipeline

## Solutions Disponibles

### Solution 1: Utiliser un modèle déjà converti ✅ (Actuel)

```javascript
// Modèle compatible WebGPU déjà dans transformers.js
generator = await pipeline(
    'text-generation',
    'onnx-community/Llama-3.2-1B-Instruct',
    { device: 'webgpu', dtype: 'q4' }
);
```

**Avantages:**
- Fonctionne immédiatement
- Optimisé pour WebGPU
- Quantifié (rapide)

**Inconvénients:**
- Pas le modèle Mistral-3B exact
- Qualité peut varier

### Solution 2: Attendre la conversion officielle 🕐

Mistral AI ou la communauté `onnx-community` convertiront probablement le modèle au format transformers.js dans les prochaines semaines.

**Vérifier régulièrement:**
- https://huggingface.co/onnx-community
- https://github.com/xenova/transformers.js/discussions

### Solution 3: Conversion manuelle 🔧 (Avancé)

Si vous êtes expérimenté en Python/ONNX:

```bash
# 1. Installer les outils
pip install optimum transformers onnx onnxruntime

# 2. Télécharger le modèle original
from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained("mistralai/Ministral-3-3B-Instruct-2512")
tokenizer = AutoTokenizer.from_pretrained("mistralai/Ministral-3-3B-Instruct-2512")

# 3. Convertir en ONNX compatible transformers.js
from optimum.exporters.onnx import main_export
main_export(
    model_name_or_path="mistralai/Ministral-3-3B-Instruct-2512",
    output="./ministral-onnx-converted",
    task="text-generation-with-past"
)

# 4. Quantifier pour réduire la taille
from optimum.onnxruntime import ORTQuantizer
quantizer = ORTQuantizer.from_pretrained("./ministral-onnx-converted")
quantizer.quantize(save_dir="./ministral-q4", q_config="arm64")
```

**Note:** Ceci nécessite des connaissances techniques avancées et peut ne pas garantir la compatibilité WebGPU.

## Modèles Alternatifs Recommandés

### Pour production immédiate:

1. **onnx-community/Llama-3.2-1B-Instruct** ✅
   - Taille: ~1 GB (q4)
   - Qualité: Bonne
   - WebGPU: Excellent

2. **onnx-community/Qwen2.5-1.5B-Instruct**
   - Taille: ~1.5 GB (q4)
   - Qualité: Très bonne
   - WebGPU: Excellent

3. **Felladrin/onnx-f16-mistral-7b-instruct-v0.1**
   - Taille: ~7 GB (fp16)
   - Qualité: Excellente
   - WebGPU: Bon (nécessite >8GB VRAM)

### Changer de modèle dans le code:

Dans `index.html`, ligne ~450:

```javascript
// Option 1: Petit et rapide (recommandé pour début)
generator = await pipeline('text-generation', 
    'onnx-community/Llama-3.2-1B-Instruct',
    { device: 'webgpu', dtype: 'q4' }
);

// Option 2: Balance qualité/taille
generator = await pipeline('text-generation',
    'onnx-community/Qwen2.5-1.5B-Instruct', 
    { device: 'webgpu', dtype: 'q4' }
);

// Option 3: Meilleure qualité (GPU puissant requis)
generator = await pipeline('text-generation',
    'Felladrin/onnx-f16-mistral-7b-instruct-v0.1',
    { device: 'webgpu', dtype: 'fp16' }
);
```

## Format des Prompts

Chaque modèle a son propre format. Adaptez dans `index.html`:

### Llama 3.2
```javascript
const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question }
];
// transformers.js gère automatiquement le template
```

### Mistral (quand disponible)
```javascript
const prompt = `<s>[INST] ${systemPrompt}

${question} [/INST]`;
```

## Quand Ministral-3B sera disponible

Surveillez ce repository: https://github.com/xenova/transformers.js

Ou testez avec:

```javascript
// Test de disponibilité
try {
    generator = await pipeline('text-generation',
        'onnx-community/Ministral-3-3B-Instruct',  // Nom hypothétique
        { device: 'webgpu', dtype: 'q4' }
    );
    console.log('✅ Ministral-3B disponible !');
} catch (error) {
    console.log('⚠️ Pas encore disponible, utilisation de Llama-3.2');
    generator = await pipeline('text-generation',
        'onnx-community/Llama-3.2-1B-Instruct',
        { device: 'webgpu', dtype: 'q4' }
    );
}
```

## Ressources

- [transformers.js v3 Documentation](https://huggingface.co/docs/transformers.js)
- [ONNX Community Models](https://huggingface.co/onnx-community)
- [Optimum ONNX Export](https://huggingface.co/docs/optimum/exporters/onnx/overview)
- [WebGPU Best Practices](https://tinyurl.com/webgpu-best-practices)

---

**TL;DR:** Pour l'instant, utilisez `Llama-3.2-1B-Instruct`. Dès que Ministral-3B sera converti par la communauté, changez simplement le nom du modèle.
