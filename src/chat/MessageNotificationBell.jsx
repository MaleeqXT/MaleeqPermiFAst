import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createChatClient } from "./chatClient.js";
import { chatInboxKey, subscribeChatInbox } from "./chatInbox.js";
import PushNotificationControl from "../push/PushNotificationControl.jsx";
import "./MessageNotificationBell.css";

const POLL_INTERVAL = 15000;

function BellIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>;
}

function MessageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></svg>;
}

function relativeTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "À l’instant";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "À l’instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

/** Shared monitor/student inbox. The API history is backed by persisted chat messages. */
export default function MessageNotificationBell({
  monitorId = null,
  buttonClassName = "",
  panelClassName = "",
  extraItems = [],
  onExtraOpen,
  onOpenConversation,
  onOpenChange,
}) {
  const loginId = useSelector((state) => state.auth.user?.id);
  const client = useMemo(() => createChatClient(monitorId), [monitorId]);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const wrapperRef = useRef(null);
  const eventIds = useRef(new Set());

  const refresh = useCallback(async (signal) => {
    if (!loginId) return;
    const { data } = await client.get("/chat/notifications", { params: { limit: 20 }, signal });
    const items = Array.isArray(data?.data) ? data.data : [];
    setNotifications(items);
    setUnreadCount(Number(data?.unread_count) || 0);
    return { items, userId: data?.user_id || loginId };
  }, [client, loginId]);

  useEffect(() => {
    if (!loginId) {
      setNotifications([]);
      setUnreadCount(0);
      setToast(null);
      return undefined;
    }
    let disposed = false;
    let unsubscribe = () => {};
    const controller = new AbortController();
    const safelyRefresh = () => refresh(controller.signal).catch(() => undefined);
    const subscribe = (actorId) => subscribeChatInbox(chatInboxKey(loginId, monitorId, actorId), actorId, client, {
      message: async ({ message }) => {
        if (disposed || String(message?.sender_id) === String(loginId) || !message?.id) return;
        const id = String(message.id);
        if (eventIds.current.has(id)) return;
        eventIds.current.add(id);
        const result = await safelyRefresh();
        const item = result?.items?.find((notification) => Number(notification.message_id) === Number(message.id));
        if (!disposed && item) setToast(item);
      },
      read: safelyRefresh,
      ready: safelyRefresh,
      connection: (state) => { if (state === "connected") safelyRefresh(); },
    });
    safelyRefresh().then((result) => {
      if (!disposed) unsubscribe = subscribe(result?.userId || loginId);
    });
    const onFocus = () => { if (!document.hidden) safelyRefresh(); };
    const timer = window.setInterval(onFocus, POLL_INTERVAL);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("ppf-fcm-foreground", onFocus);
    return () => {
      disposed = true;
      controller.abort();
      unsubscribe();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("ppf-fcm-foreground", onFocus);
    };
  }, [client, loginId, monitorId, refresh]);

  useEffect(() => {
    const close = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openMessage = async (notification) => {
    try {
      await client.post(`/chat/notifications/${notification.message_id}/read`);
      setNotifications((current) => current.map((item) => item.message_id === notification.message_id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item));
      setUnreadCount((current) => Math.max(0, current - (notification.is_read ? 0 : 1)));
    } catch {
      // The conversation itself will still mark its messages read after it opens.
    }
    setOpen(false);
    setToast(null);
    onOpenConversation?.(notification.conversation_id);
  };

  const markAllRead = async () => {
    try {
      await client.post("/chat/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true, read_at: item.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch { /* next refresh reconciles a temporary outage */ }
  };

  const count = unreadCount + extraItems.length;
  return <div className="chat-notification-menu" ref={wrapperRef}>
    <button type="button" className={`chat-notification-bell ${buttonClassName}`.trim()} aria-label="Notifications" aria-haspopup="menu" aria-expanded={open} onClick={() => { setOpen((value) => !value); if (!open) { setLoading(true); refresh().catch(() => undefined).finally(() => setLoading(false)); } }}>
      <BellIcon />
      {count > 0 && <span className="chat-notification-badge">{count > 99 ? "99+" : count}</span>}
    </button>
    {open && <div className={`chat-notification-panel ${panelClassName}`.trim()} role="menu">
      <div className="chat-notification-panel-heading"><strong>Notifications{count ? ` (${count})` : ""}</strong>{unreadCount > 0 && <button type="button" onClick={markAllRead}>Tout lire</button>}</div>
      {loading && <p className="chat-notification-empty">Chargement…</p>}
      {!loading && !notifications.length && !extraItems.length && <p className="chat-notification-empty">Aucune notification.</p>}
      {notifications.map((notification) => <button key={notification.id} type="button" className={`chat-notification-item${notification.is_read ? "" : " is-unread"}`} role="menuitem" onClick={() => openMessage(notification)}>
        <span className="chat-notification-item-icon"><MessageIcon /></span>
        <span className="chat-notification-copy"><strong>{notification.title}</strong><small>Nouveau message : {notification.preview}</small><time>{relativeTime(notification.created_at)}{notification.is_read ? "" : " · Non lu"}</time></span>
      </button>)}
      {extraItems.map((item) => <button key={item.id} type="button" className="chat-notification-item" role="menuitem" onClick={() => { setOpen(false); onExtraOpen?.(item); }}>
        <span className="chat-notification-item-icon">{item.icon || <BellIcon />}</span><span className="chat-notification-copy"><strong>{item.title}</strong><small>{item.preview}</small><time>{item.time || ""}</time></span>
      </button>)}
      <PushNotificationControl />
    </div>}
    {toast && <button type="button" className="chat-notification-toast" onClick={() => openMessage(toast)}><MessageIcon /><span><strong>{toast.title}</strong><small>{toast.preview}</small></span><b>Ouvrir</b></button>}
  </div>;
}
