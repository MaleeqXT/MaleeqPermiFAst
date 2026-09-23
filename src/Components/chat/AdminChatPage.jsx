import useChat from "../../chat/useChat.js";
import ChatFeedback from "../../chat/ChatFeedback.jsx";
import NewChatDialog from "../../chat/NewChatDialog.jsx";
import { ChatConversationMenu, ConversationRowMenu, MessageDeleteButton } from "../../chat/ChatManagementControls.jsx";
import ChatComposerExtras from "../../chat/ChatComposerExtras.jsx";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../new-student-dashboard/CandidateChatPage.css";

// ─── Icons ──────────────────────────────────────────────────────────────────
function StrokeIcon({ children, strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
const ChevronDownIcon = () => <StrokeIcon><path d="m6 9 6 6 6-6" /></StrokeIcon>;
const ChevronRightIcon = () => <StrokeIcon><path d="m9 18 6-6-6-6" /></StrokeIcon>;
const ChevronLeftIcon = () => <StrokeIcon><path d="m15 18-6-6 6-6" /></StrokeIcon>;
const SearchIcon = () => <StrokeIcon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></StrokeIcon>;
const PencilIcon = () => <StrokeIcon><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></StrokeIcon>;
const MoreIcon = () => <StrokeIcon><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></StrokeIcon>;
const SendIcon = () => <StrokeIcon><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></StrokeIcon>;
const GroupIcon = () => <StrokeIcon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></StrokeIcon>;
const CheckReadIcon = () => <StrokeIcon strokeWidth={2.1}><path d="m2 12 4 4L14 8" /><path d="m10 15 2 2 8-9" /></StrokeIcon>;
const UsersIcon = () => <StrokeIcon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></StrokeIcon>;

const ADMIN_SHORTCUTS = [
  { label: "Candidats", path: "/candidates", icon: <UsersIcon /> },
  { label: "Moniteurs", path: "/monitors", icon: <UsersIcon /> },
  { label: "Tableau de bord", path: "/dashboard/general", icon: <UsersIcon /> },
];

// ─── Sub-components ─────────────────────────────────────────────────────────
function Avatar({ conversation = {}, size = "medium" }) {
  return (
    <span className={`nschat-avatar nschat-avatar--${size} nschat-avatar--${conversation.avatarTone || "green"}`}>
      {conversation.group ? <GroupIcon /> : <span className="nschat-avatar-initials">{conversation.initials || '?'}</span>}
      {conversation.online && <i />}
    </span>
  );
}

function MessageBubble({ message, conversation, onDelete }) {
  return (
    <div className={`nschat-message nschat-message--${message.direction}`}>
      {message.direction === "incoming" && <Avatar conversation={conversation} size="small" />}
      <div className="nschat-message-content">
        <div className="nschat-bubble">{message.lines.map((line, index) => <p key={index}>{line}</p>)}</div>
        {(message.attachments?.length ? message.attachments : (message.attachment_url ? [{ url: message.attachment_url, name: message.attachment_name, mime: message.attachment_mime }] : [])).map((attachment, index) => <a className="nschat-message-attachment" href={attachment.url?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${attachment.url}` : attachment.url} target="_blank" rel="noreferrer" key={index}>{attachment.mime?.startsWith('image/') ? <img src={attachment.url?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${attachment.url}` : attachment.url} alt={attachment.name || 'Photo jointe'} /> : <span>📄 {attachment.name || 'Document joint'}</span>}</a>)}
        <span className="nschat-message-meta">{message.time}{message.read && <CheckReadIcon />}{onDelete && <MessageDeleteButton onDelete={() => onDelete(message.id)} />}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminChatPage() {
  const navigate = useNavigate();
  const chat = useChat();
  const { conversations, selectedId, selectedConversation, activeMessages, messageDraft, setMessageDraft, bindMessages } = chat;
  const messageInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return conversations.filter((c) => {
      const matchesSearch = !query || [c.name, c.role, c.preview].some((v) => v.toLocaleLowerCase("fr").includes(query));
      const matchesFilter = filter === "all" || (filter === "unread" && c.unreadCount > 0) || (filter === "online" && c.online);
      return matchesSearch && matchesFilter;
    });
  }, [conversations, filter, search]);

  const selectConversation = (id, conversation) => {
    chat.selectConversation(id, conversation);
    setMobileChatOpen(true);
    setMobileDetailsOpen(false);
  };

  const startConversation = async (contactId) => {
    const id = await chat.startConversation(contactId);
    if (id) {
      setMobileChatOpen(true);
      setMobileDetailsOpen(false);
    }
    return id;
  };

  return (
    <div className={`nschat-root nschat-root--admin${mobileChatOpen ? " nschat-mobile-show-chat" : ""}`} style={{ height: "100%", background: "#f5f6f8" }}>
      {chat.newChatOpen && <NewChatDialog onClose={() => chat.setNewChatOpen(false)} onStart={startConversation} />}
      <section className="nschat-workspace" style={{ height: "calc(100% - 0px)", marginTop: 0 }} aria-label="Messagerie Admin">
        {/* Conversation List Column */}
        <div className="nschat-conversation-column">
            <button type="button" className="nschat-new-message" onClick={() => chat.setNewChatOpen(true)}><PencilIcon /> Nouveau message</button>
          <div className="nschat-list-controls">
            <label className="nschat-search">
              <span className="nschat-sr-only">Rechercher une conversation</span>
              <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." />
              <SearchIcon />
            </label>
            <label className="nschat-filter">
              <span className="nschat-sr-only">Filtrer</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>

              </select>
              <ChevronDownIcon />
            </label>
          </div>

          <section className="nschat-card nschat-conversation-card">
            <div className="nschat-conversation-list">
                {chat.loading && <p className="nschat-empty" role="status">Chargement des conversations…</p>}
                {chat.hasMoreConversations && <button type="button" className="nschat-show-all" onClick={chat.loadConversations}>Charger plus de conversations</button>}
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  role="button"
                  tabIndex={0}
                  className={`nschat-conversation-row${selectedId === conversation.id ? " is-active" : ""}`}
                  aria-pressed={selectedId === conversation.id}
                  onClick={() => selectConversation(conversation.id, conversation)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectConversation(conversation.id, conversation); } }}
                >
                  <Avatar conversation={conversation} />
                  <span className="nschat-conversation-copy">
                    <span className="nschat-conversation-name">{conversation.name}{conversation.role && <em>{conversation.role}</em>}</span>
                    <span className="nschat-preview">{conversation.preview}</span>
                  </span>
                  <span className="nschat-conversation-meta"><time>{conversation.time}</time>{conversation.unreadCount > 0 && <b>{conversation.unreadCount}</b>}</span>
                  <span className="nschat-row-actions" onClick={(event) => event.stopPropagation()}><ConversationRowMenu onClear={() => chat.clearConversation(conversation.id)} onDelete={() => chat.deleteConversation(conversation.id)} /></span>
                </div>
              ))}
              {!chat.loading && filteredConversations.length === 0 && <p className="nschat-empty">Aucune conversation trouvée.</p>}
            </div>
            <button type="button" className="nschat-show-all" onClick={() => { setSearch(""); setFilter("all"); }}>Voir toutes les conversations</button>
          </section>
        </div>

        {/* Chat Column */}
        <div className="nschat-chat-column">
          <div className="nschat-chat-toolbar">
            <button type="button" className="nschat-new-message" onClick={() => chat.setNewChatOpen(true)}><PencilIcon /> Nouveau message</button>
          </div>

          <section className="nschat-card nschat-chat-card" aria-label={`Conversation : ${selectedConversation.name}`}>
            <header className="nschat-chat-card-header">
              <button type="button" className="nschat-mobile-back" onClick={() => setMobileChatOpen(false)} aria-label="Retour"><ChevronLeftIcon /></button>
              <Avatar conversation={selectedConversation} />
              <div><h2>{selectedConversation.name} {selectedConversation.role && <em>{selectedConversation.role}</em>}</h2><p>Conversation privée</p></div>
              <button type="button" className="nschat-mobile-details" onClick={() => setMobileDetailsOpen((o) => !o)}>Détails</button>
              {selectedId && <ChatConversationMenu icon={<MoreIcon />} onClear={chat.clearConversation} onDelete={chat.deleteConversation} />}
            </header>

            <div className="nschat-messages" ref={bindMessages} onScroll={chat.onMessagesScroll}>
              <ChatFeedback chat={chat} />
              <div className="nschat-day-divider"><span>Messages</span></div>
              {activeMessages.map((message) => <MessageBubble key={message.id} message={message} conversation={selectedConversation} onDelete={message.direction === 'outgoing' ? chat.deleteMessage : null} />)}

            </div>

            <form className="nschat-composer" onSubmit={(event) => chat.sendMessage(event, attachments).then((sent) => { if (sent) setAttachments([]); })}>
              <ChatComposerExtras files={attachments} onFiles={setAttachments} onEmoji={(emoji) => setMessageDraft((current) => `${current}${current ? " " : ""}${emoji}`)} />
              <label><span className="nschat-sr-only">Écrire un message</span><textarea disabled={!selectedId || chat.sending || chat.connection === "expired"} maxLength={4000} ref={messageInputRef} rows="1" value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder="Écrire un message..." /></label>
              <button type="submit" className="nschat-send" aria-label="Envoyer" disabled={(!messageDraft.trim() && !attachments.length) || !selectedId || chat.sending || chat.connection === "expired"}><SendIcon /></button>
            </form>
          </section>
        </div>

        {/* Info Sidebar */}
        <aside className={`nschat-info-column${mobileDetailsOpen ? " is-mobile-open" : ""}`}>
          <section className="nschat-card nschat-about-card">
            <h2>À propos</h2>
            <div className="nschat-about-person"><Avatar conversation={selectedConversation} size="large" /><div><strong>{selectedConversation.name}</strong><span>{selectedConversation.role || "Conversation de groupe"}</span></div></div>
            <div className="nschat-contact-links">
                <p className="nschat-feedback">Échange privé avec votre interlocuteur.</p>
              </div>
          </section>

          <section className="nschat-card nschat-shortcuts-card">
            <h2>Accès rapides</h2>
            <div>{ADMIN_SHORTCUTS.map((s) => <button key={s.label} type="button" onClick={() => navigate(s.path)}><span>{s.icon}</span>{s.label}<ChevronRightIcon /></button>)}</div>
          </section>

          <section className="nschat-hours-card">
            <header><UsersIcon /><h2>Vue d'ensemble</h2></header>
            <div><p><strong>Élèves</strong><span>{conversations.filter((c) => c.role === "Élève").length} conversations</span></p><p><strong>Moniteurs</strong><span>{conversations.filter((c) => c.role === "Moniteur").length} conversations</span></p></div>
            <button type="button" onClick={() => navigate('/candidates')}>Gérer les utilisateurs</button>
          </section>
        </aside>
      </section>
    </div>
  );
}
