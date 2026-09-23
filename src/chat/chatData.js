export const EMPTY_CONVERSATION = { id: null, name: 'Sélectionnez une conversation', initials: '…', role: '', preview: '' };

const backendUrl = (url) => url?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${url}` : url;

export function mergeMessages(previous = [], incoming = []) {
  const messages = new Map(previous.map((message) => [String(message.id), message]));
  incoming.forEach((message) => {
    const old = messages.get(String(message.id));
    messages.set(String(message.id), { ...old, ...message, read_at: message.read_at || old?.read_at || null });
  });
  return [...messages.values()].sort((a, b) => Number(a.id) - Number(b.id));
}

export function conversationView(conversation, userId) {
  // A conversation can be refreshed while a participant has just been
  // removed/updated. Never let an incomplete API record unmount the whole
  // chat page; the UI can safely show the normal fallback avatar instead.
  const peer = (conversation?.participants || []).find((p) => String(p?.user_id) !== String(userId))?.user || {};
  const date = conversation.last_message?.created_at;
  return {
    ...conversation,
    name: peer?.name || 'Compte indisponible',
    role: peer?.role || '',
    image: null,
    initials: (peer?.name || '?').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    preview: conversation.last_message?.message || 'Commencer la conversation',
    unreadCount: conversation.unread_count || 0,
    time: date ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '',
    avatarTone: peer?.role === 'Admin' ? 'brand' : peer?.role === 'Moniteur' ? 'green' : 'purple',
  };
}

export function messageView(message, userId, peerReadId = 0) {
  const body = typeof message?.message === 'string' ? message.message : '';
  return {
    ...message,
    attachment_url: message.attachment_url?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${message.attachment_url}` : message.attachment_url,
    direction: String(message.sender_id) === String(userId) ? 'outgoing' : 'incoming',
    lines: body.split('\n'),
    time: new Date(message.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    read: !!message.read_at || Number(message.id) <= peerReadId,
  };
}

export function chatError(error) {
  const status = error.response?.status;
  if (status === 401 || status === 419) return 'Votre session a expiré. Veuillez vous reconnecter.';
  if (status === 403 || status === 404) return 'Cette conversation n’est pas accessible.';
  if (status === 429) return 'Trop de demandes. Patientez quelques instants puis réessayez.';
  if (status === 422) return Object.values(error.response.data.errors || {}).flat()[0] || 'Vérifiez votre message (4 000 caractères maximum).';
  return 'Impossible de joindre la messagerie. Votre brouillon est conservé. Réessayez.';
}
