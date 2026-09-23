export default function ChatFeedback({ chat }) {
  return <>
    {chat.error && <div className="nschat-feedback nschat-feedback--error" role="alert">
      {chat.error} {chat.connection !== 'expired' && <button type="button" onClick={chat.retry}>Réessayer</button>}
    </div>}
    {chat.connection !== 'connected' && <p className="nschat-feedback" role="status">
      {chat.connection === 'expired' ? 'Session expirée.' : chat.connection === 'connecting'
        ? 'Connexion à la messagerie…' : 'Temps réel indisponible. Synchronisation automatique des messages.'}
    </p>}
    {chat.loadingMessages && <p className="nschat-empty" role="status">Chargement des messages…</p>}
    {!chat.selectedId && <p className="nschat-empty">Sélectionnez une conversation ou cliquez sur « Nouveau message ».</p>}
    {chat.selectedId && !chat.loadingMessages && !chat.activeMessages.length && <p className="nschat-empty">Aucun message. Commencez la conversation.</p>}
    {chat.hasOlder && <button className="nschat-show-all" type="button" onClick={chat.loadOlder} disabled={chat.loadingOlder}>
      {chat.loadingOlder ? 'Chargement…' : 'Charger les messages précédents'}
    </button>}
  </>;
}
