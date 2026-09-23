import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { createChatClient } from './chatClient.js';
import { chatInboxKey, subscribeChatInbox } from './chatInbox.js';
import './ChatUnreadBadge.css';

export default function ChatUnreadBadge({ monitorId = null, collapsed = false }) {
  const loginId = useSelector((state) => state.auth.user?.id);
  const client = useMemo(() => createChatClient(monitorId), [monitorId]);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!loginId) return;
    let disposed = false;
    let busy = false;
    let queued = false;
    let unsubscribe;
    let refreshTimer;
    const controller = new AbortController();
    const refresh = async () => {
      if (disposed) return;
      if (busy) { queued = true; return; }
      busy = true;
      try {
        const { data } = await client.get('/chat/unread', { signal: controller.signal });
        if (disposed) return;
        setSnapshot({ loginId, monitorId, count: data.unread_count });
        if (!unsubscribe) {
          unsubscribe = subscribeChatInbox(chatInboxKey(loginId, monitorId, data.user_id), data.user_id, client, {
            message: scheduleRefresh, read: scheduleRefresh, ready: scheduleRefresh,
            connection: (state) => { if (state === 'connected') scheduleRefresh(); },
          });
        }
      } catch {
        // Preserve the last known count on a temporary outage; retry on focus/poll.
      } finally {
        busy = false;
        if (queued && !disposed) { queued = false; scheduleRefresh(); }
      }
    };
    function scheduleRefresh() {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, 80);
    }
    const onFocus = () => { if (!document.hidden) scheduleRefresh(); };
    const onRead = (event) => { if (event.detail.monitorId === monitorId) scheduleRefresh(); };
    refresh();
    const interval = setInterval(onFocus, 15000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('ppf-chat-read', onRead);
    return () => {
      disposed = true;
      controller.abort();
      unsubscribe?.();
      clearTimeout(refreshTimer);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('ppf-chat-read', onRead);
    };
  }, [client, loginId, monitorId]);

  const count = snapshot?.loginId === loginId && snapshot?.monitorId === monitorId ? snapshot.count : 0;
  if (!count) return null;
  return <span className={`chat-unread-badge${collapsed ? ' chat-unread-badge--collapsed' : ''}`}
    role="status" aria-label={`${count} messages non lus`} title={`${count} messages non lus`}>
    {count > 99 ? '99+' : count}
  </span>;
}
