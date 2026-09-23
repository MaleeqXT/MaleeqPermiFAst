import http from '../helpers/http.jsx';

// Request-scoped monitor identity; the shared login token stays unchanged.
export function createChatClient(monitorId) {
  const config = (options = {}) => ({
    ...options,
    headers: { ...options.headers, ...(monitorId ? { 'X-Chat-Monitor': monitorId } : {}) },
  });
  return {
    get: (url, options) => http.get(url, config(options)),
    post: (url, data, options) => http.post(url, data, config(options)),
    delete: (url, options) => http.delete(url, config(options)),
  };
}
