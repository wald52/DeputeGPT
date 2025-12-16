import requests
from bs4 import BeautifulSoup
import os
import re
import json

# Config
URL_PAGE = "https://www.assemblee-nationale.fr/dyn/vos-deputes/hemicycle"
OUTPUT_SVG = "public/data/hemicycle_svg/hemicycle.svg"
OUTPUT_COLORS = "public/data/hemicycle_svg/sieges_couleurs.json"

def update_hemicycle_data():
    print(f"Téléchargement de la page {URL_PAGE}...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
    
    try:
        response = requests.get(URL_PAGE, headers=headers)
        response.raise_for_status()
        content = response.text
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # --- 1. EXTRACTION DU SVG (Comme avant) ---
        target_svg = None
        for svg in soup.find_all('svg'):
            if len(svg.find_all(['path', 'circle', 'g'])) > 300:
                target_svg = svg
                break
        
        if target_svg:
            print("✅ SVG trouvé ! Nettoyage...")
            # Nettoyage
            for a_tag in target_svg.find_all('a'):
                g_tag = soup.new_tag("g")
                g_tag.attrs = a_tag.attrs
                g_tag.extend(a_tag.contents)
                a_tag.replace_with(g_tag)
            
            for seat in target_svg.find_all(['path', 'circle', 'rect']):
                # On enlève le fill par défaut pour laisser le JS colorier
                if 'style' in seat.attrs: del seat['style']
                # On met un gris neutre de base
                seat['fill'] = '#e0e0e0' 

            # Optimisation ViewBox
            if 'width' in target_svg.attrs: del target_svg['width']
            if 'height' in target_svg.attrs: del target_svg['height']
            if 'viewbox' not in target_svg.attrs and 'viewBox' not in target_svg.attrs:
                target_svg['viewBox'] = "0 0 1100 600" # Centrage standard
                
            target_svg['id'] = "hemicycle-svg-content"
            
            os.makedirs(os.path.dirname(OUTPUT_SVG), exist_ok=True)
            with open(OUTPUT_SVG, "w", encoding="utf-8") as f:
                f.write(str(target_svg))
            print(f"SVG sauvegardé : {OUTPUT_SVG}")
        else:
            print("❌ Erreur: SVG non trouvé.")

        # --- 2. EXTRACTION DES COULEURS DES SIÈGES (NOUVEAU) ---
        print("Extraction des couleurs officielles...")
        
        # On cherche le gros objet JSON qui contient la config
        # Il est souvent dans une variable JS ou un attribut data
        # Sur cette page, c'est souvent dans un script React ou similaire.
        # On va utiliser une Regex pour trouver les motifs "123":{"couleur":"ABCDEF"}
        
        # Motif : "numero_siege": {"couleur": "HEX"}
        # Ex: "10":{"couleur":"DCDCDC"}
        pattern = r'"(\d+)":\s*\{\s*"couleur":\s*"([0-9A-Fa-f]{6})"'
        
        matches = re.findall(pattern, content)
        
        sieges_map = {}
        for siege_num, hex_code in matches:
            sieges_map[siege_num] = "#" + hex_code

        if sieges_map:
            with open(OUTPUT_COLORS, "w", encoding="utf-8") as f:
                json.dump(sieges_map, f, indent=2)
            print(f"✅ Couleurs extraites : {len(sieges_map)} sièges configurés -> {OUTPUT_COLORS}")
        else:
            print("⚠️ Aucune couleur de siège trouvée via Regex.")
            # Fallback : Si la regex échoue, on regarde si un data-attribut existe dans le HTML
            # (Analyse plus poussée si besoin)

    except Exception as e:
        print(f"❌ Erreur critique : {e}")
        exit(1)

if __name__ == "__main__":
    update_hemicycle_data()
