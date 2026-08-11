function buildDeputePanelDetailsInternal(depute, placesMapping) {
  let details = depute.groupe || depute.groupeNom || '';
  const seatNumber = placesMapping?.[depute.id];

  if (seatNumber) {
    details += ` | Siège ${seatNumber}`;
  }

  if (depute.departementNom && depute.circo) {
    const circoNum = parseInt(depute.circo, 10);
    const circoFormatted = circoNum === 1 ? '1re' : `${circoNum}e`;
    details += ` | ${depute.departementNom} (${circoFormatted} circonscription)`;
  }

  return details;
}

export function createDeputePanelController({
  appState,
  getPlacesMapping,
  initChatHistory,
  resetChatSession,
  setActiveSeatByDepute,
  updateChatScopeSummary,
  getChatHistory,
  getActiveModelConfig,
  clearRenderedMessages,
  updateChatEmptyState,
  getDeputePhotoUrl,
  deputePhotoPlaceholderUrl,
  syncChatAvailability,
  loadDeputeVotes,
  addMessage
}) {
  // Deux sieges cliques coup sur coup lancent deux chargements concurrents :
  // seul le plus recent a le droit d'ecrire dans l'interface et dans l'etat.
  let latestSelectionToken = 0;

  async function selectDepute(depute) {
    const selectionToken = latestSelectionToken + 1;
    latestSelectionToken = selectionToken;
    const isSelectionStale = () => latestSelectionToken !== selectionToken;

    appState.currentDepute = depute;
    // Les votes du depute precedemment charge ne doivent pas etre pris pour
    // ceux du nouveau : l'interface s'appuie sur leur absence pour afficher
    // l'etat de chargement.
    delete depute.votes;
    appState.isDeputeVotesLoading = true;
    // Retour immediat au clic, avant tout await : sur mobile la carte du depute
    // est dans le panneau Chat masque.
    document.dispatchEvent(new CustomEvent('depute:selecting', {
      detail: {
        deputeId: depute.id
      }
    }));
    resetChatSession(depute.id);
    setActiveSeatByDepute(depute);
    updateChatScopeSummary();
    syncChatAvailability();

    const chatHistoryPromise = typeof initChatHistory === 'function'
      ? initChatHistory()
      : Promise.resolve(getChatHistory());
    const chatHistory = await chatHistoryPromise;

    if (isSelectionStale()) {
      return;
    }

    if (chatHistory) {
      try {
        await chatHistory.getOrCreateActiveSession(depute, getActiveModelConfig());
      } catch (error) {
        console.warn('⚠️ Erreur création session historique:', error);
      }

      if (isSelectionStale()) {
        return;
      }
    }

    clearRenderedMessages();
    updateChatEmptyState();

    document.getElementById('depute-placeholder').hidden = true;
    document.getElementById('depute-content').hidden = false;
    document.getElementById('selected-depute').classList.add('active');
    document.getElementById('depute-name').textContent = `${depute.prenom} ${depute.nom}`;
    document.getElementById('depute-details').textContent = buildDeputePanelDetailsInternal(depute, getPlacesMapping());

    const imgEl = document.getElementById('depute-img');
    imgEl.src = getDeputePhotoUrl(depute);
    imgEl.alt = `Portrait de ${depute.prenom} ${depute.nom}`;
    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.src = deputePhotoPlaceholderUrl;
    };

    const statsContainer = document.getElementById('stats-container');
    statsContainer.hidden = true;
    statsContainer.style.opacity = '0.5';
    document.getElementById('stat-votes').textContent = '0';
    syncChatAvailability();

    const { votes, error } = await loadDeputeVotes(depute.id);

    if (isSelectionStale()) {
      return;
    }

    depute.votes = votes;
    appState.isDeputeVotesLoading = false;

    statsContainer.hidden = false;
    statsContainer.style.opacity = '1';
    document.getElementById('stat-votes').textContent = votes.length;

    // Le succes n'a plus besoin de message systeme : la carte du depute affiche
    // le nom et le nombre de votes, et #chat-capabilities annonce l'etat du chat.
    if (error) {
      await addMessage('system', `Impossible de charger les votes de ${depute.prenom} ${depute.nom}. Vérifiez votre connexion ou réessayez plus tard.`, { method: 'system' });
    }

    syncChatAvailability();
    updateChatScopeSummary();
    document.dispatchEvent(new CustomEvent('depute:selected', {
      detail: {
        deputeId: depute.id
      }
    }));
  }

  return {
    selectDepute
  };
}
