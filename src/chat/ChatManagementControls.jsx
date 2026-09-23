import { useState } from 'react';

const ClearIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></svg>;

export function ChatConversationMenu({ icon, onClear, onDelete }) {
  const [open, setOpen] = useState(false);
  const clear = async () => {
    setOpen(false);
    if (window.confirm('Effacer les messages de cette conversation pour vous ?')) await onClear();
  };
  const remove = async () => {
    setOpen(false);
    if (window.confirm('Supprimer cette conversation de votre liste ?')) await onDelete();
  };
  return <div className="nschat-menu-wrap">
    <button type="button" className="nschat-more" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Options de conversation">{icon}</button>
    {open && <div className="nschat-action-menu" role="menu">
      <button type="button" role="menuitem" onClick={clear}><ClearIcon /><span>Effacer la discussion</span></button>
      <span className="nschat-action-divider" />
      <button type="button" role="menuitem" className="is-danger" onClick={remove}><TrashIcon /><span>Supprimer le contact</span></button>
    </div>}
  </div>;
}

const MoreIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></svg>;

export function ConversationRowMenu({ onClear, onDelete }) {
  return <ChatConversationMenu icon={<MoreIcon />} onClear={onClear} onDelete={onDelete} />;
}

export function MessageDeleteButton({ onDelete }) {
  const [open, setOpen] = useState(false);
  const remove = () => {
    setOpen(false);
    if (window.confirm('Supprimer ce message ?')) onDelete();
  };
  return <span className="nschat-message-menu" onClick={(event) => event.stopPropagation()}>
    <button type="button" className="nschat-message-more" onClick={() => setOpen((value) => !value)} aria-label="Options du message" aria-expanded={open}><MoreIcon /></button>
    {open && <span className="nschat-message-action-menu" role="menu"><button type="button" role="menuitem" onClick={remove}><TrashIcon /><span>Supprimer</span></button></span>}
  </span>;
}
