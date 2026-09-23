import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { createChatClient } from './chatClient.js';
import { chatInboxKey, notifyChatRead, subscribeChatInbox } from './chatInbox.js';
import { chatError, conversationView, EMPTY_CONVERSATION, mergeMessages, messageView } from './chatData.js';

const CHAT_SYNC_INTERVAL_MS = 15000;

export default function useChat({ monitorId = null, actorId = null } = {}) {
  const signedInId = useSelector((state) => state.auth.user?.id);
  const userId = actorId ?? signedInId;
  const http = useMemo(() => createChatClient(monitorId), [monitorId]);
  const [rawConversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageState, setMessages] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState('connecting');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const messagesRef = useRef(null);
  const bindMessages = useCallback((element) => { messagesRef.current = element; }, []);
  const runtime = useRef({});
  const actions = useRef({});
  const echoRef = useRef(null);
  const pendingSend = useRef(null);
  const sendLock = useRef(false);
  const page = useRef(1);
  const generation = useRef(0);
  const nearBottom = useRef(true);
  const scrollToEnd = useRef(false);
  const preserveScroll = useRef(null);
  const readCursor = useRef({});
  const syncing = useRef(false);
  const refreshing = useRef(null);

  const fail = useCallback((err) => {
    setError(chatError(err));
    if ([401, 419].includes(err.response?.status)) {
      echoRef.current?.disconnect();
      setConnection('expired');
    }
  }, []);

  // A reservation can end while the chat page is open. Do not leave a stale
  // row selected and repeatedly request a thread that the server has rightly
  // withdrawn access to.
  const discardInaccessibleConversation = useCallback((id) => {
    setConversations((current) => current.filter((conversation) => String(conversation.id) !== String(id)));
    setMessages((current) => {
      const remaining = { ...current };
      delete remaining[id];
      return remaining;
    });
    setSelectedId((current) => String(current) === String(id) ? null : current);
    setSelectedContact((current) => String(current?.id) === String(id) ? null : current);
    setError('');
  }, []);

  const refreshConversations = useCallback(async () => {
    if (refreshing.current) return refreshing.current;
    const currentGeneration = generation.current;
    const request = (async () => {
      // Refresh all loaded pages so older open conversations do not disappear.
      const pages = await Promise.all(Array.from({ length: page.current }, (_, index) =>
        http.get('/conversations', { params: { page: index + 1 } })));
      if (currentGeneration !== generation.current) return;
      const items = [...new Map(pages.flatMap(({ data }) => data.data).map((item) => [item.id, item])).values()];
      setConversations(items.sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
      setSelectedId((current) => items.some((conversation) => String(conversation.id) === String(current)) ? current : null);
      setSelectedContact((current) => {
        const refreshed = items.find((conversation) => String(conversation.id) === String(current?.id));
        return refreshed ? conversationView(refreshed, userId) : current;
      });
      setHasMoreConversations(!!pages.at(-1).data.next_page_url);
      setLoaded(true);
    })();
    refreshing.current = request;
    try { await request; }
    finally { if (refreshing.current === request) refreshing.current = null; }
  }, [http]);

  const ingest = useCallback((id, data, mode = 'sync') => {
    if (id === runtime.current.selectedId && (nearBottom.current || mode === 'initial')) scrollToEnd.current = true;
    setMessages((current) => ({ ...current, [id]: {
      ...current[id],
      messages: mergeMessages(mode === 'initial'
        ? (current[id]?.messages || []).filter((m) => Number(m.id) > Number(data.data.at(-1)?.id || 0))
        : current[id]?.messages, data.data),
      participants: data.participants || current[id]?.participants || [],
      loaded: mode === 'initial' || current[id]?.loaded,
      hasMore: ['initial', 'older'].includes(mode) ? data.has_more : current[id]?.hasMore,
    } }));
  }, []);

  const markRead = useCallback(async () => {
    const { selectedId: id, messageState: state } = runtime.current;
    const container = messagesRef.current;
    if (!id || !state[id]?.loaded || !container?.offsetParent || !nearBottom.current || document.hidden || !document.hasFocus()) return;
    const through = state[id].messages.at(-1)?.id;
    if (!through || Number(through) <= (readCursor.current[id] || 0)) return;
    readCursor.current[id] = Number(through);
    try {
      const { data } = await http.post(`/conversations/${id}/read`, { through_id: through });
      setConversations((current) => current.map((c) => String(c.id) === String(id) ? { ...c, unread_count: data.unread_count } : c));
      notifyChatRead(monitorId);
    } catch (err) { readCursor.current[id] = 0; fail(err); }
  }, [fail, http, monitorId]);

  const synchronize = useCallback(async () => {
    if (syncing.current || document.hidden || runtime.current.connection === 'expired') return;
    syncing.current = true;
    const currentGeneration = generation.current;
    try {
      const id = runtime.current.selectedId;
      const state = runtime.current.messageState[id];
      await Promise.all([refreshConversations(), (async () => {
      // The selection effect handles initial loading; do not fetch it twice.
      if (id && state?.loaded) {
        let cursor = state.messages.at(-1)?.id || 0;
        let more = true;
        while (more && currentGeneration === generation.current && id === runtime.current.selectedId) {
          let data;
          try {
            ({ data } = await http.get(`/conversations/${id}/messages`, { params: { after_id: cursor } }));
          } catch (err) {
            if (err.response?.status === 403) {
              discardInaccessibleConversation(id);
              return;
            }
            throw err;
          }
          if (currentGeneration !== generation.current) break;
          ingest(id, data);
          more = data.has_more;
          cursor = data.data.at(-1)?.id || cursor;
        }
      }
      })()]);
    } catch (err) { if (currentGeneration === generation.current) fail(err); }
    finally { syncing.current = false; }
  }, [refreshConversations, ingest, fail, http, discardInaccessibleConversation]);

  useLayoutEffect(() => {
    runtime.current = { selectedId, messageState, connection };
    actions.current = { synchronize, markRead };
  });

  useEffect(() => {
    if (!userId) return;
    let disposed = false;
    let refreshTimer;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => refreshConversations().catch(fail), 100);
    };
    const onMessage = ({ message }) => {
      if (disposed) return;
      if (message.conversation_id === runtime.current.selectedId) ingest(message.conversation_id, { data: [message] });
      // Paint the message/preview immediately, without waiting for another GET.
      setConversations((current) => current.map((c) => String(c.id) === String(message.conversation_id)
        && Number(message.id) > Number(c.last_message?.id || 0)
        ? { ...c, last_message: message, updated_at: message.created_at,
          unread_count: c.unread_count + (String(message.sender_id) !== String(userId) ? 1 : 0) } : c)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
      scheduleRefresh();
    };
    const onRead = (event) => {
      if (disposed) return;
      setMessages((current) => {
        const state = current[event.conversation_id];
        if (!state) return current;
        return { ...current, [event.conversation_id]: { ...state,
          messages: state.messages.map((m) => Number(m.id) <= event.through_id && String(m.sender_id) !== String(event.user_id) ? { ...m, read_at: event.read_at } : m),
        } };
      });
      scheduleRefresh();
    };
    const onDeleted = (event) => {
      if (disposed) return;
      setMessages((current) => {
        const state = current[event.conversation_id];
        if (!state) return current;
        return { ...current, [event.conversation_id]: { ...state,
          messages: state.messages.filter((message) => Number(message.id) !== Number(event.message_id)),
        } };
      });
      scheduleRefresh();
    };
    const onConnection = (current) => {
      if (disposed) return;
      setConnection(current);
    };
    const unsubscribe = subscribeChatInbox(chatInboxKey(signedInId, monitorId, userId), userId, http, {
      message: onMessage, read: onRead, deleted: onDeleted, connection: onConnection, error: fail,
      ready: () => actions.current.synchronize(),
    });
    echoRef.current = { disconnect: unsubscribe };
    // Fetch on mount and reconcile after outages, tab focus and browser wake-up.
    actions.current.synchronize();
    const onFocus = () => { actions.current.synchronize(); actions.current.markRead(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    // Reverb delivers immediately. This lightweight reconciliation is also a
    // safety net for a browser that reconnects late or temporarily loses its socket.
    const timer = window.setInterval(() => { actions.current.synchronize(); actions.current.markRead(); }, CHAT_SYNC_INTERVAL_MS);
    return () => {
      disposed = true;
      generation.current += 1;
      syncing.current = false;
      refreshing.current = null;
      clearTimeout(refreshTimer);
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      unsubscribe();
      echoRef.current = null;
    };
  }, [userId, signedInId, monitorId, fail, ingest, refreshConversations, http]);

  useEffect(() => {
    if (!selectedId) return;
    let disposed = false;
    const controller = new AbortController();
    http.get(`/conversations/${selectedId}/messages`, { signal: controller.signal }).then(({ data }) => {
      if (!disposed) ingest(selectedId, data, 'initial');
    }).catch((err) => {
      if (disposed) return;
      if (err.response?.status === 403) discardInaccessibleConversation(selectedId);
      else fail(err);
    });
    return () => { disposed = true; controller.abort(); };
  }, [selectedId, userId, ingest, fail, http, discardInaccessibleConversation]);

  useLayoutEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    if (preserveScroll.current) {
      const { id, height, top } = preserveScroll.current;
      if (id === selectedId) container.scrollTop = top + container.scrollHeight - height;
      preserveScroll.current = null;
    } else if (scrollToEnd.current) {
      container.scrollTop = container.scrollHeight;
      scrollToEnd.current = false;
      nearBottom.current = true;
    }
    markRead();
  }, [messageState, selectedId, markRead]);

  const selectConversation = (id, contact = null) => {
    setSelectedId(id);
    // Keep the exact card the user selected for the header/About area while
    // background polling replaces the raw conversation list.
    if (contact) setSelectedContact(contact);
    else {
      const raw = rawConversations.find((conversation) => String(conversation.id) === String(id));
      if (raw) setSelectedContact(conversationView(raw, userId));
    }
    setError('');
    nearBottom.current = true;
    scrollToEnd.current = true;
  };

  const sendMessage = async (event, attachments = []) => {
    event.preventDefault();
    const text = (drafts[selectedId] || '').trim();
    if ((!text && !attachments.length) || !selectedId || sendLock.current || connection === 'expired') return false;
    const id = selectedId;
    if (pendingSend.current?.text !== text || pendingSend.current?.id !== id) {
      pendingSend.current = { id, text, clientId: crypto.randomUUID() };
    }
    sendLock.current = true;
    setSending(true);
    setError('');
    try {
      const payload = attachments.length ? new FormData() : { message: text, client_message_id: pendingSend.current.clientId };
      if (attachments.length) { payload.append('message', text); payload.append('client_message_id', pendingSend.current.clientId); attachments.forEach((attachment) => payload.append('attachments[]', attachment)); }
      const { data } = await http.post(`/conversations/${id}/messages`, payload);
      scrollToEnd.current = id === runtime.current.selectedId;
      ingest(id, { data: [data.data] });
      setDrafts((current) => current[id]?.trim() === text ? { ...current, [id]: '' } : current);
      pendingSend.current = null;
      if (!data.realtime) setConnection('unavailable');
      refreshConversations().catch(fail);
      return true;
    } catch (err) {
      if (err.response?.status === 403) discardInaccessibleConversation(id);
      else fail(err);
    }
    finally { sendLock.current = false; setSending(false); }
    return false;
  };

  const loadOlder = async () => {
    const state = messageState[selectedId];
    if (loadingOlder || !state?.hasMore || !state.messages.length) return;
    const id = selectedId;
    setLoadingOlder(true);
    try {
      const { data } = await http.get(`/conversations/${id}/messages`, { params: { before_id: state.messages[0].id } });
      const el = messagesRef.current;
      if (id === runtime.current.selectedId && el) preserveScroll.current = { id, height: el.scrollHeight, top: el.scrollTop };
      ingest(id, data, 'older');
    } catch (err) {
      if (err.response?.status === 403) discardInaccessibleConversation(id);
      else fail(err);
    }
    finally { setLoadingOlder(false); }
  };

  const loadConversations = async () => {
    try {
      const { data } = await http.get('/conversations', { params: { page: page.current + 1 } });
      setConversations((current) => [...new Map([...current, ...data.data].map((c) => [c.id, c])).values()]);
      page.current += 1;
      setHasMoreConversations(!!data.next_page_url);
    } catch (err) { fail(err); }
  };

  const startConversation = async (contactId) => {
    try {
      const { data } = await http.post('/conversations', { user_id: contactId });
      setConversations((current) => [data.data, ...current.filter((c) => String(c.id) !== String(data.data.id))]);
      setSelectedContact(conversationView(data.data, userId));
      selectConversation(data.data.id);
      setNewChatOpen(false);
      return data.data.id;
    } catch (err) { fail(err); return null; }
  };

  const clearConversation = async (conversationId = null) => {
    const id = conversationId || runtime.current.selectedId;
    if (!id) return false;
    try {
      await http.post(`/conversations/${id}/clear`);
      setMessages((current) => ({ ...current, [id]: { ...current[id], messages: [], loaded: true, hasMore: false } }));
      setConversations((current) => current.map((conversation) => String(conversation.id) === String(id)
        ? { ...conversation, last_message: null, unread_count: 0 } : conversation));
      return true;
    } catch (err) { fail(err); return false; }
  };

  const deleteConversation = async (conversationId = null) => {
    const id = conversationId || runtime.current.selectedId;
    if (!id) return false;
    try {
      await http.delete(`/conversations/${id}`);
      discardInaccessibleConversation(id);
      return true;
    } catch (err) { fail(err); return false; }
  };

  const deleteMessage = async (messageId) => {
    const id = runtime.current.selectedId;
    if (!id || !messageId) return false;
    try {
      await http.delete(`/conversations/${id}/messages/${messageId}`);
      setMessages((current) => ({ ...current, [id]: { ...current[id],
        messages: (current[id]?.messages || []).filter((message) => Number(message.id) !== Number(messageId)),
      } }));
      refreshConversations().catch(fail);
      return true;
    } catch (err) { fail(err); return false; }
  };

  const conversations = useMemo(() => rawConversations.map((c) => conversationView(c, userId)), [rawConversations, userId]);
  // API IDs can arrive as strings while a click/event may carry a number.
  // Always compare their stable string form so the selected contact's name is
  // retained in the chat header, About panel, and incoming message avatar.
  const selectedConversation = (selectedContact && String(selectedContact.id) === String(selectedId))
    ? selectedContact
    : conversations.find((c) => String(c.id) === String(selectedId)) || EMPTY_CONVERSATION;
  const state = messageState[selectedId];
  const peerReadId = Math.max(0, ...(state?.participants || [])
    .filter((p) => String(p?.user_id) !== String(userId))
    .map((p) => Number(p?.last_read_message_id) || 0));
  const activeMessages = (state?.messages || []).map((m) => messageView(m, userId, peerReadId));

  return {
    client: http,
    conversations, selectedId, selectedConversation, activeMessages, selectConversation, sendMessage,
    messageDraft: drafts[selectedId] || '',
    setMessageDraft: (value) => setDrafts((current) => ({ ...current, [selectedId]: typeof value === 'function' ? value(current[selectedId] || '') : value })),
    bindMessages, onMessagesScroll: () => {
      const el = messagesRef.current;
      nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      markRead();
    },
    loading: !loaded, loadingMessages: !!selectedId && !state?.loaded,
    sending, loadingOlder, hasOlder: state?.hasMore, loadOlder,
    error, connection: import.meta.env.VITE_REVERB_APP_KEY ? connection : 'unconfigured',
    retry: () => { setError(''); synchronize(); },
    hasMoreConversations, loadConversations, newChatOpen, setNewChatOpen, startConversation,
    clearConversation, deleteConversation, deleteMessage,
  };
}
