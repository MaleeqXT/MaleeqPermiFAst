import { useRef, useState } from 'react';

const EMOJIS = ['😀', '😊', '😂', '😍', '🥳', '👍', '👏', '🙏', '❤️', '🎉', '✅', '👋'];

function PaperclipIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9" /></svg>; }
function ImageIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></svg>; }
function DocumentIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg>; }

export default function ChatComposerExtras({ onEmoji, onFiles, files }) {
  const imageInput = useRef(null);
  const documentInput = useRef(null);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const choose = (input) => { setAttachmentOpen(false); input.current?.click(); };
  return <>
    <span className="nschat-composer-popover-wrap">
      <button type="button" onClick={() => { setAttachmentOpen((open) => !open); setEmojiOpen(false); }} aria-label="Ajouter une pièce jointe" aria-expanded={attachmentOpen}><PaperclipIcon /></button>
      {attachmentOpen && <span className="nschat-composer-popover nschat-attachment-popover">
        <button type="button" onClick={() => choose(imageInput)}><ImageIcon /><span>Ajouter des photos</span><small>Images</small></button>
        <button type="button" onClick={() => choose(documentInput)}><DocumentIcon /><span>Ajouter des documents</span><small>PDF, Word</small></button>
      </span>}
      <input ref={imageInput} className="nschat-file-input" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => { onFiles([...files, ...Array.from(event.target.files || [])].slice(0, 8)); event.target.value = ''; }} />
      <input ref={documentInput} className="nschat-file-input" type="file" multiple accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { onFiles([...files, ...Array.from(event.target.files || [])].slice(0, 8)); event.target.value = ''; }} />
    </span>
    <span className="nschat-composer-popover-wrap">
      <button type="button" className="nschat-emoji" aria-label="Ajouter un emoji" onClick={() => { setEmojiOpen((open) => !open); setAttachmentOpen(false); }}>☺</button>
      {emojiOpen && <span className="nschat-composer-popover nschat-emoji-popover">{EMOJIS.map((emoji) => <button type="button" key={emoji} onClick={() => { onEmoji(emoji); setEmojiOpen(false); }}>{emoji}</button>)}</span>}
    </span>
    {files.length > 0 && <span className="nschat-attachment-chips">{files.map((file, index) => <span className="nschat-attachment-chip" title={file.name} key={`${file.name}-${index}`}>{file.type.startsWith('image/') ? '🖼️' : '📄'}<span>{file.name}</span><button type="button" onClick={() => onFiles(files.filter((_, current) => current !== index))} aria-label={`Retirer ${file.name}`}>×</button></span>)}</span>}
  </>;
}
