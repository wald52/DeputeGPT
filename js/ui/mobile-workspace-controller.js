export function createMobileWorkspaceController({
  appState,
  mobileMedia = '(max-width: 920px)'
}) {
  const mediaQuery = window.matchMedia(mobileMedia);
  let activeView = 'explore';

  function getElements() {
    return {
      switcher: document.querySelector('.mobile-workspace-switcher'),
      exploreBtn: document.getElementById('workspace-switch-explore'),
      chatBtn: document.getElementById('workspace-switch-chat'),
      explorePanel: document.getElementById('explorer-panel'),
      chatPanel: document.getElementById('chat-panel'),
      selectionBar: document.getElementById('mobile-selection-bar'),
      selectionName: document.getElementById('mobile-selection-name'),
      selectionStatus: document.getElementById('mobile-selection-status'),
      selectionOpenBtn: document.getElementById('mobile-selection-open-chat')
    };
  }

  // La carte du depute vit dans #chat-panel, masque en vue Explorer : sans cette
  // barre, un clic sur un siege ne produit aucun retour visible sur mobile.
  function syncSelectionBar() {
    const {
      selectionBar,
      selectionName,
      selectionStatus,
      selectionOpenBtn
    } = getElements();

    if (!selectionBar) {
      return;
    }

    const depute = appState.currentDepute;
    const shouldShow = Boolean(mediaQuery.matches && depute && activeView !== 'chat');
    selectionBar.hidden = !shouldShow;

    if (!shouldShow) {
      return;
    }

    if (selectionName) {
      selectionName.textContent = `${depute.prenom} ${depute.nom}`;
    }

    const votes = Array.isArray(depute.votes) ? depute.votes : null;

    if (selectionStatus) {
      selectionStatus.textContent = votes
        ? `${votes.length} vote${votes.length > 1 ? 's' : ''} chargé${votes.length > 1 ? 's' : ''}`
        : 'Chargement des votes…';
    }

    if (selectionOpenBtn) {
      selectionOpenBtn.disabled = !votes;
    }
  }

  function syncButtons({ exploreBtn, chatBtn }, hasSelectedDepute) {
    const isExploreView = activeView === 'explore';
    const isChatView = activeView === 'chat';

    exploreBtn?.classList.toggle('is-active', isExploreView);
    chatBtn?.classList.toggle('is-active', isChatView);

    if (exploreBtn) {
      exploreBtn.setAttribute('aria-pressed', String(isExploreView));
    }

    if (chatBtn) {
      chatBtn.setAttribute('aria-pressed', String(isChatView));
      chatBtn.disabled = !hasSelectedDepute;
    }
  }

  function applyLayout() {
    const {
      switcher,
      exploreBtn,
      chatBtn,
      explorePanel,
      chatPanel
    } = getElements();

    if (!switcher || !explorePanel || !chatPanel) {
      return;
    }

    const hasSelectedDepute = Boolean(appState.currentDepute);

    if (!hasSelectedDepute && activeView === 'chat') {
      activeView = 'explore';
    }

    syncButtons({ exploreBtn, chatBtn }, hasSelectedDepute);

    if (!mediaQuery.matches) {
      switcher.hidden = true;
      explorePanel.hidden = false;
      chatPanel.hidden = false;
      document.body.removeAttribute('data-mobile-view');
      syncSelectionBar();
      return;
    }

    switcher.hidden = false;
    document.body.dataset.mobileView = activeView;
    explorePanel.hidden = activeView !== 'explore';
    chatPanel.hidden = activeView !== 'chat';
    syncSelectionBar();
  }

  function setActiveView(view, { scrollIntoView = false } = {}) {
    if (view !== 'explore' && view !== 'chat') {
      return;
    }

    if (view === 'chat' && !appState.currentDepute) {
      return;
    }

    activeView = view;
    applyLayout();

    if (!scrollIntoView || !mediaQuery.matches) {
      return;
    }

    const scrollTarget = document.querySelector('.mobile-workspace-switcher')
      || document.getElementById(view === 'chat' ? 'chat-panel' : 'explorer-panel');

    if (scrollTarget) {
      scrollTarget.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  function handleDeputeSelected() {
    // Sur mobile, on n'impose plus la bascule vers le Chat à la sélection :
    // l'utilisateur garde l'hémicycle/le siège sélectionné en vue et bascule
    // lui-même via l'onglet Chat (désormais activé par applyLayout).
    applyLayout();
  }

  function setupMobileWorkspace() {
    const { exploreBtn, chatBtn, selectionOpenBtn } = getElements();

    exploreBtn?.addEventListener('click', () => {
      setActiveView('explore', { scrollIntoView: true });
    });

    chatBtn?.addEventListener('click', () => {
      setActiveView('chat', { scrollIntoView: true });
    });

    selectionOpenBtn?.addEventListener('click', () => {
      setActiveView('chat', { scrollIntoView: true });
    });

    mediaQuery.addEventListener('change', () => {
      applyLayout();
    });

    // 'depute:selecting' accuse reception du clic tout de suite, sans attendre
    // le chargement des votes annonce par 'depute:selected'.
    document.addEventListener('depute:selecting', handleDeputeSelected);
    document.addEventListener('depute:selected', handleDeputeSelected);
    applyLayout();
  }

  return {
    setupMobileWorkspace,
    setActiveView
  };
}
