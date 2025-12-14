import requests
from bs4 import BeautifulSoup
import os

# Config
URL_PAGE = "https://www.assemblee-nationale.fr/dyn/vos-deputes/hemicycle"
OUTPUT_SVG = "public/data/hemicycle_svg/hemicycle.svg"

def update_svg():
    print(f"Téléchargement de la page {URL_PAGE}...")
    headers = {'User-Agent': 'Mozilla/5.0...'} # Votre user-agent habituel
    
    try:
        response = requests.get(URL_PAGE, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # On cherche le SVG principal
        target_svg = None
        for svg in soup.find_all('svg'):
            if len(svg.find_all(['path', 'circle', 'g'])) > 300:
                target_svg = svg
                break
        
        if target_svg:
            print("✅ SVG trouvé ! Nettoyage en cours...")
            
            # 1. NETTOYAGE DES LIENS (Empêche le saut de page au clic)
            # On remplace les balises <a> par des groupes <g> neutres
            for a_tag in target_svg.find_all('a'):
                g_tag = soup.new_tag("g")
                # On transfère les attributs de <a> vers <g>
                g_tag.attrs = a_tag.attrs
                # On déplace le contenu
                g_tag.extend(a_tag.contents)
                a_tag.replace_with(g_tag)

            # 2. COULEUR PAR DÉFAUT (Gris clair au lieu de Noir)
            # On applique un style par défaut à tous les paths/cercles
            for seat in target_svg.find_all(['path', 'circle', 'rect']):
                # Si pas de fill défini, on met du gris clair
                if 'fill' not in seat.attrs:
                    seat['fill'] = '#e0e0e0'
                # On supprime les styles inline parasites qui forceraient le noir
                if 'style' in seat.attrs:
                    del seat['style']

            # 3. TAILLE RESPONSIVE
            target_svg['width'] = "100%"
            target_svg['height'] = "auto"
            target_svg['id'] = "hemicycle-svg-content"
            
            # Sauvegarde
            os.makedirs(os.path.dirname(OUTPUT_SVG), exist_ok=True)
            with open(OUTPUT_SVG, "w", encoding="utf-8") as f:
                f.write(str(target_svg))
            print(f"SVG nettoyé et sauvegardé sous : {OUTPUT_SVG}")
            
        else:
            print("❌ Aucun SVG valide trouvé.")
            exit(1)

    except Exception as e:
        print(f"❌ Erreur : {e}")
        exit(1)

if __name__ == "__main__":
    update_svg()
