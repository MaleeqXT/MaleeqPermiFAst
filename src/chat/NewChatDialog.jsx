import { useEffect, useRef, useState } from 'react';
import http from '../helpers/http.jsx';
import { chatError } from './chatData.js';

export default function NewChatDialog({ onClose, onStart, client = http }) {
  const dialog = useRef(null);
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await client.get('/chat/contacts', { params: { search, page }, signal: controller.signal });
        setContacts((current) => page === 1 ? data.data : [...current, ...data.data]);
        setMore(!!data.next_page_url);
      } catch (err) { if (!controller.signal.aborted) setError(chatError(err)); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, page, client]);
  const start = async (id) => {
    if (starting) return;
    setStarting(true);
    const conversationId = await onStart(id);
    if (!conversationId) { setStarting(false); setError('Impossible d’ouvrir cette conversation. Réessayez.'); }
  };
  return <dialog ref={dialog} className="nschat-contact-dialog" onCancel={onClose} onClick={(event) => {
    if (event.target === dialog.current) onClose();
  }} aria-labelledby="nschat-new-title">
    <div className="nschat-dialog-content">
      <header><h2 id="nschat-new-title">Nouveau message</h2><button type="button" onClick={onClose} aria-label="Fermer">×</button></header>
      <label className="nschat-search"><span className="nschat-sr-only">Rechercher un contact</span>
        <input autoFocus value={search} placeholder="Rechercher un contact…" onChange={(event) => {
          setSearch(event.target.value); setPage(1); setLoading(true);
        }} />
      </label>
      <p className="nschat-feedback">Seuls les contacts autorisés sont affichés.</p>
      {error && <p role="alert" className="nschat-feedback nschat-feedback--error">{error}</p>}
      {loading && <p className="nschat-empty" role="status">Chargement…</p>}
      <div className="nschat-contact-results">
        {(!loading || page > 1) && contacts.map((contact) => <button className="nschat-conversation-row" type="button" key={contact.id} disabled={starting || loading} onClick={() => start(contact.id)}>
          <span className="nschat-avatar">{contact.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join('')}</span>
          <span className="nschat-conversation-copy"><span className="nschat-conversation-name">{contact.name}</span><span className="nschat-preview">{contact.role}</span></span>
        </button>)}
        {!loading && !contacts.length && <p className="nschat-empty">Aucun contact disponible.</p>}
      </div>
      {more && <button className="nschat-show-all" type="button" disabled={loading || starting} onClick={() => setPage((value) => value + 1)}>Voir plus</button>}
    </div>
  </dialog>;
}
