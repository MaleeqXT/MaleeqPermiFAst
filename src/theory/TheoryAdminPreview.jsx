import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiAssetUrl } from "../config/api.js";
import http from "../helpers/http.jsx";
import "./TheoryAdminPreview.css";
const mediaUrl = (path) => {
  if (!path) return null;
  const rawPath = String(path);
  const localStorageMatch = rawPath.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/storage\/.+)$/i);
  if (/^https?:\/\//i.test(rawPath) && !localStorageMatch) return rawPath;
  const normalizedPath = (localStorageMatch?.[1] || rawPath).replace(/^\//, "");
  return apiAssetUrl(`${normalizedPath.startsWith("theory/questions/") ? "storage/" : ""}${normalizedPath}`);
};
const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
const frenchVoice = (voices = []) => {
  const frenchVoices = voices.filter((voice) => /^fr(?:-|_)/i.test(voice.lang || ""));
  if (!frenchVoices.length) return null;

  // Windows, Chrome and Edge do not return voices in a consistent order. Prefer
  // the higher-quality voices when the operating system has one installed.
  const score = (voice) => {
    const name = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
    let value = 0;
    if (/natural|neural|online|enhanced|premium/.test(name)) value += 100;
    if (/microsoft|google|apple/.test(name)) value += 20;
    if (/france|français|french/.test(name)) value += 5;
    if (voice.default) value += 1;
    return value;
  };

  return [...frenchVoices].sort((left, right) => score(right) - score(left))[0];
};
const equal = (a, b) => [...a].sort().join("|") === [...b].sort().join("|");
const optionOffset = (parts, partIndex) => parts.slice(0, partIndex).reduce((total, part) => total + (part.options || []).length, 0);

export default function TheoryAdminPreview({ questions, title = "Aperçu administrateur", onClose }) {
  const panelRef = useRef(null), mp3Ref = useRef(null), ttsAudioRef = useRef(null), runRef = useRef(0);
  const [index, setIndex] = useState(0), [answers, setAnswers] = useState({}), [validated, setValidated] = useState({}), [voices, setVoices] = useState([]), [muted, setMuted] = useState(false), [failedImages, setFailedImages] = useState({});
  const question = questions[index];
  const parts = useMemo(() => {
    if (!question) return [];
    if (!question.parts?.length) return [{ id: question.id, question_text: question.question_text, answer_type: question.answer_type, explanation: question.explanation, options: question.options || [] }];
    const shared = question.options || [];
    return question.parts.map((part, partIndex) => {
      if (part.options?.length) return part; // Legacy multiple questions retain their stored options.
      const positions = partIndex === 0 ? [0, 1] : [2, 3];
      return {
        ...part,
        options: positions.map((position) => ({
          ...shared[position],
          id: shared[position]?.id || `${part.id}-${position}`,
          globalIndex: position,
          is_correct: (part.correct_option_positions || []).includes(position + 1),
        })).filter((option) => option.label),
      };
    });
  }, [question]);
  const stopMp3 = useCallback(() => { if (mp3Ref.current && !mp3Ref.current.paused) mp3Ref.current.pause(); }, []);
  const stopGeneratedTts = useCallback(() => { const audio = ttsAudioRef.current; if (!audio) return; audio.pause(); audio.removeAttribute("src"); audio.load(); ttsAudioRef.current = null; }, []);
  const stopSpeech = useCallback(() => { runRef.current += 1; stopGeneratedTts(); if (canSpeak()) window.speechSynthesis.cancel(); }, [stopGeneratedTts]);
  const speakBrowser = useCallback((items) => { if (!canSpeak() || muted) return; stopMp3(); window.speechSynthesis.cancel(); const run = ++runRef.current; let at = 0; const phrases = items.filter(Boolean); const next = (voiceAttempts = 0) => { if (runRef.current !== run || at >= phrases.length) return; const availableVoices = voices.length ? voices : window.speechSynthesis.getVoices();
    // Chrome loads system voices asynchronously. Do not lock the narration to
    // the default robotic voice while a French Natural/Neural voice is loading.
    if (!availableVoices.length && voiceAttempts < 8) { window.setTimeout(() => next(voiceAttempts + 1), 100); return; }
    const u = new window.SpeechSynthesisUtterance(phrases[at]); u.lang = "fr-FR"; u.rate = .96; u.pitch = 1; u.volume = 1; u.voice = frenchVoice(availableVoices) || null; u.onend = () => { if (runRef.current === run) { at += 1; window.setTimeout(next, 300); } }; u.onerror = () => { if (runRef.current === run) { at += 1; window.setTimeout(next, 300); } }; window.speechSynthesis.speak(u); }; next(); }, [muted, stopMp3, voices]);
  const speak = useCallback(async (items, narration = null) => { if (muted) return; const phrases = items.filter(Boolean); if (!narration || !question?.id) { speakBrowser(phrases); return; } stopMp3(); stopSpeech(); const run = ++runRef.current; try { const response = await http.post(`/admin/theory/questions/${question.id}/narration`, narration); const url = mediaUrl(response.data?.data?.audio_url); if (runRef.current !== run || !url) return; const audio = new Audio(url); ttsAudioRef.current = audio; audio.onended = () => { if (ttsAudioRef.current === audio) ttsAudioRef.current = null; }; audio.onerror = () => { if (runRef.current === run) speakBrowser(phrases); }; await audio.play(); } catch { if (runRef.current === run) speakBrowser(phrases); } }, [muted, question?.id, speakBrowser, stopMp3, stopSpeech]);
  const readQuestion = useCallback(() => speak(parts.flatMap((part, partIndex) => [`Question ${partIndex + 1}. ${part.question_text}`, ...(part.options || []).map((option, optionIndex) => `Réponse ${String.fromCharCode(65 + (option.globalIndex ?? optionOffset(parts, partIndex) + optionIndex))} : ${option.label}`)]), { kind: "question" }), [parts, speak]);
  const moveTo = (next) => { stopSpeech(); stopMp3(); setIndex(next); };
  useEffect(() => { setIndex(0); setAnswers({}); setValidated({}); setFailedImages({}); }, [questions]);
  useEffect(() => { if (!canSpeak()) return; const load = () => setVoices(window.speechSynthesis.getVoices()); load(); window.speechSynthesis.addEventListener?.("voiceschanged", load); return () => window.speechSynthesis.removeEventListener?.("voiceschanged", load); }, []);
  useEffect(() => () => { if (canSpeak()) window.speechSynthesis.cancel(); }, []);
  useEffect(() => { if (!question || muted) return; const timer = window.setTimeout(readQuestion, 0); return () => { clearTimeout(timer); stopSpeech(); }; }, [index, muted, question?.id]);
  if (!question) return null;
  const isValidated = Object.prototype.hasOwnProperty.call(validated, question.id);
  const results = validated[question.id] || {};
  const select = (part, optionId) => { if (isValidated) return; setAnswers((current) => { const chosen = current[part.id] || []; return { ...current, [part.id]: part.answer_type === "multiple" ? (chosen.includes(optionId) ? chosen.filter((id) => id !== optionId) : [...chosen, optionId]) : [optionId] }; }); };
  const validate = () => { const next = {}; parts.forEach((part) => { const chosen = answers[part.id] || []; next[part.id] = equal(chosen, (part.options || []).filter((option) => option.is_correct).map((option) => option.id)); }); setValidated((current) => ({ ...current, [question.id]: next })); };
  const image = question.image_url || question.image_path || (question.media_type === "image" ? question.media_path : null), video = question.video_url || question.video_path || (question.media_type === "video" ? question.media_path : null), audio = question.audio_url || question.audio_path; const canRenderImage = Boolean(image) && !failedImages[question.id];
  return <div className="theory-player-backdrop"><section ref={panelRef} className="theory-player" role="dialog" aria-modal="true"><header className="theory-player-top"><div><small>APERÇU ADMINISTRATEUR</small><strong>{title}</strong></div><div className="theory-player-toolbar"><span>Question {index + 1}/{questions.length}</span><button type="button" onClick={() => muted ? setMuted(false) : (stopSpeech(), setMuted(true))}>{muted ? "🔇" : "🔊"}</button><button type="button" onClick={() => document.fullscreenElement ? document.exitFullscreen() : panelRef.current?.requestFullscreen()}>⛶</button><button type="button" onClick={() => { stopSpeech(); stopMp3(); onClose(); }}>×</button></div></header>{(video || canRenderImage || audio) && <main className="theory-player-media">{video ? <video controls src={mediaUrl(video)} onPlay={stopSpeech} /> : canRenderImage ? <img loading="lazy" src={mediaUrl(image)} alt="Illustration de la situation routière" onError={() => setFailedImages((current) => ({ ...current, [question.id]: true }))} /> : null}{audio && <audio ref={mp3Ref} controls src={mediaUrl(audio)} onPlay={stopSpeech} />}</main>}<section className={`theory-player-question ${parts.length > 1 ? "theory-player-question--parts" : ""}`}>{parts.map((part, partIndex) => { const chosen = answers[part.id] || []; return <article className="theory-question-part" key={part.id}><div className="theory-player-meta"><span>Question {partIndex + 1}</span>{part.answer_type === "multiple" && <span>Plusieurs réponses possibles</span>}</div><h1>{part.question_text}</h1><div className="theory-player-options">{(part.options || []).map((option, optionIndex) => { const letter = String.fromCharCode(65 + (option.globalIndex ?? optionOffset(parts, partIndex) + optionIndex)); return <button type="button" key={option.id} disabled={isValidated} className={`${chosen.includes(option.id) ? "selected" : ""} ${isValidated && option.is_correct ? "correct" : ""} ${isValidated && chosen.includes(option.id) && !option.is_correct ? "wrong" : ""}`} onClick={() => select(part, option.id)}><b>{letter}</b>{option.label}{isValidated && option.is_correct && <em>✓</em>}{isValidated && chosen.includes(option.id) && !option.is_correct && <em>✕</em>}</button>; })}</div>{isValidated && <aside className={results[part.id] ? "good" : "bad"}><strong>{results[part.id] ? "Question correcte ✓" : "Question incorrecte ✕"}</strong><p>Bonne réponse : {(part.options || []).filter((option) => option.is_correct).map((option, optionIndex) => `${String.fromCharCode(65 + (option.globalIndex ?? optionOffset(parts, partIndex) + optionIndex))} — ${option.label}`).join(" · ")}</p><h3>Explication de la réponse</h3><p>{part.explanation || "Aucune explication pédagogique n’est encore enregistrée pour cette question."}</p>{part.explanation && <button type="button" className="theory-player-explanation" onClick={() => speak([part.explanation], { kind: "explanation", part_id: part.id })} disabled={muted}>🔊 Lire l’explication</button>}</aside>}</article>; })}{!isValidated && <button type="button" className="theory-player-validate" disabled={parts.some((part) => !(answers[part.id] || []).length)} onClick={validate}>VALIDER</button>}</section><footer className="theory-player-nav"><button type="button" disabled={index === 0} onClick={() => moveTo(index - 1)}>← Précédent</button><div>{questions.map((item, itemIndex) => <button type="button" key={item.id} className={itemIndex === index ? "active" : ""} onClick={() => moveTo(itemIndex)}>{itemIndex + 1}</button>)}</div><button type="button" disabled={index === questions.length - 1} onClick={() => moveTo(index + 1)}>Suivant →</button></footer></section></div>;
}
