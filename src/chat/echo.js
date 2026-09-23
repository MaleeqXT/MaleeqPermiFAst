import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import http from '../helpers/http.jsx';

export function createChatEcho(onAuthError, client = http) {
  const localFixture = import.meta.env.DEV ? window.__PPF_CHAT_REVERB__ : null;
  const key = localFixture?.key || import.meta.env.VITE_REVERB_APP_KEY;
  if (!key) return null;
  return new Echo({
    broadcaster: 'reverb',
    client: new Pusher(key, {
      wsHost: localFixture?.host || import.meta.env.VITE_REVERB_HOST || window.location.hostname,
      wsPort: Number(localFixture?.port || import.meta.env.VITE_REVERB_PORT || 8080),
      wssPort: Number(localFixture?.port || import.meta.env.VITE_REVERB_PORT || 443),
      forceTLS: (localFixture?.scheme || import.meta.env.VITE_REVERB_SCHEME) === 'https',
      enabledTransports: ['ws', 'wss'],
      cluster: 'mt1',
      disableStats: true,
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          client.post('/broadcasting/auth', { socket_id: socketId, channel_name: channel.name })
            .then(({ data }) => callback(null, data))
            .catch((error) => { onAuthError(error); callback(error, null); });
        },
      }),
    }),
  });
}
