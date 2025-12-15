import requests
from bs4 import BeautifulSoup
import json
import re

URL_WIKI = "https://fr.wikipedia.org/wiki/Mod%C3%A8le:Infobox_Parti_politique_fran%C3%A7ais/couleurs/Documentation"
OUTPUT_FILE = "public/data/couleurs_groupes.json"

def clean_text(text):
    if not text: return ""
    return text.strip()

def extract_colors():
    print(f"Téléchargement de {URL_WIKI}...")
    try:
        response = requests.get(URL_WIKI)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Erreur téléchargement: {e}")
        return {}

    soup = BeautifulSoup(response.content, 'html.parser')
    
    colors_map = {}
    
    # On cherche tous les tableaux de la page (class "wikitable")
    tables = soup.find_all("table", class_="wikitable")
    
    print(f"Analyse de {len(tables)} tableaux...")
    
    for table in tables:
        # On parcourt les lignes
        rows = table.find_all("tr")
        
        # On cherche les indices des colonnes (car elles peuvent changer)
        headers = [th.get_text(strip=True).lower() for th in rows[0].find_all("th")]
        
        try:
            idx_code = -1
            idx_hex = -1
            idx_autres = -1
            
            # Repérage dynamique des colonnes
            for i, h in enumerate(headers):
                if "code" in h and "hex" not in h: idx_code = i
                if "hex" in h: idx_hex = i
                if "autres codes" in h: idx_autres = i
            
            if idx_code == -1 or idx_hex == -1:
                continue # Ce tableau ne nous intéresse pas

            # Lecture des données
            for row in rows[1:]:
                cols = row.find_all(["td", "th"])
                # Parfois les tableaux ont des lignes de titres intermédiaires sans données
                if len(cols) <= max(idx_code, idx_hex): continue
                
                code_principal = clean_text(cols[idx_code].get_text())
                hex_val = clean_text(cols[idx_hex].get_text())
                
                # Validation format Hex (#123456)
                if not re.match(r'^#[0-9A-Fa-f]{6}$', hex_val):
                    continue

                # 1. Ajout du code principal
                colors_map[code_principal] = hex_val
                
                # 2. Ajout des "Autres codes"
                if idx_autres != -1 and len(cols) > idx_autres:
                    autres = clean_text(cols[idx_autres].get_text())
                    # Séparateurs possibles : "·", ",", "/"
                    codes_alt = re.split(r'[·,/]', autres)
                    for c in codes_alt:
                        c_clean = c.strip()
                        if c_clean and c_clean not in colors_map:
                            colors_map[c_clean] = hex_val

        except Exception as e:
            print(f"⚠️ Erreur sur un tableau : {e}")
            continue

    # Ajouts manuels "de sécurité" (pour les cas récents non encore sur Wiki)
    # On surcharge si besoin
    OVERRIDES = {
        "GDR": "#dd0000",
        "LFI-NFP": "#cc2443",
        "EcoS": "#00c000",
        "EPR": "#ffeb00", # Souvent appelé ENS ou RE sur Wiki
        "DR": "#0066cc",  # Droite Républicaine (nouveau nom LR)
        "UDR": "#162561"  # Union des Droites
    }
    colors_map.update(OVERRIDES)

    return colors_map

if __name__ == "__main__":
    colors = extract_colors()
    
    if colors:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(colors, f, indent=2, ensure_ascii=False)
        print(f"✅ {len(colors)} couleurs extraites et sauvegardées dans {OUTPUT_FILE}")
    else:
        print("❌ Aucune couleur extraite.")
