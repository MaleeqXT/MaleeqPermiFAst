import { createChatEcho } from './echo.js';

const inboxes = new Map();

// The sidebar and open chat share one socket, including in monitor Connecter mode.
export function subscribeChatInbox(key, userId, client, listener) {
  let inbox = inboxes.get(key);
  if (!inbox) {
    inbox = { listeners: new Set(), state: 'connecting', echo: null, closeTimer: null };
    inboxes.set(key, inbox);
    const emit = (method, value) => {
      for (const subscriber of [...inbox.listeners]) subscriber[method]?.(value);
    };
    inbox.echo = createChatEcho((error) => emit('error', error), client);
    if (inbox.echo) {
      inbox.echo.private(`chat.user.${userId}`)
        .listen('.MessageSent', (event) => emit('message', event))
        .listen('.MessagesRead', (event) => emit('read', event))
        .listen('.MessageDeleted', (event) => emit('deleted', event))
        .subscribed(() => emit('ready'))
        .error(() => { inbox.state = 'unavailable'; emit('connection', inbox.state); });
      inbox.echo.connector.pusher.connection.bind('state_change', ({ current }) => {
        inbox.state = current;
        emit('connection', current);
      });
    } else {
      inbox.state = 'unconfigured';
    }
  }
  clearTimeout(inbox.closeTimer);
  inbox.listeners.add(listener);
  // Avoid a synchronous state update in the subscribing React effect.
  queueMicrotask(() => {
    if (inbox.listeners.has(listener)) listener.connection?.(inbox.state);
  });
  return () => {
    inbox.listeners.delete(listener);
    if (!inbox.listeners.size) {
      inbox.closeTimer = setTimeout(() => {
        if (!inbox.listeners.size) { inbox.echo?.disconnect(); inboxes.delete(key); }
      }, 0);
    }
  };
}

export const chatInboxKey = (loginId, monitorId, userId) => `${loginId}:${monitorId || 'self'}:${userId}`;

export function notifyChatRead(monitorId) {
  window.dispatchEvent(new CustomEvent('ppf-chat-read', { detail: { monitorId: monitorId || null } }));
}
