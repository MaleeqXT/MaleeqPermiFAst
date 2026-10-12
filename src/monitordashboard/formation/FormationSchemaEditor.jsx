import { useCallback, useEffect, useRef, useState } from "react";
import { Bike, Eraser, Eye, ImagePlus, MousePointer2, Pencil, Redo2, RotateCw, Save, Trash2, Type, Undo2, Upload, X } from "lucide-react";
import http from "../../helpers/http.jsx";
import { ROAD_BACKGROUNDS, roadBackground } from "./roadBackgrounds.js";

const DRAWING_COLORS = [
  { name: "Rose foncé", value: "#a32b63" }, { name: "Rouge", value: "#cc2b20" },
  { name: "Orange", value: "#e47727" }, { name: "Jaune", value: "#f2c94c" },
  { name: "Vert", value: "#58b27d" }, { name: "Bleu clair", value: "#4698d4" },
  { name: "Bleu foncé", value: "#4457ad" }, { name: "Violet", value: "#7d2fa1" },
];
const OBJECT_TYPES = [
  { type: "car-yellow", label: "Voiture jaune", color: "#f4da27" },
  { type: "car-red", label: "Voiture rouge", color: "#e63331" },
  { type: "car-blue", label: "Voiture bleue", color: "#2177d6" },
  { type: "rider-purple", label: "Motard violet", color: "#643b85" },
  { type: "rider-dark", label: "Motard foncé", color: "#274736" },
];
const CANVAS = { width: 1000, height: 620 };
const BACKGROUNDS_KEY = "passpermis-formation-schema-backgrounds";
const blankDiagram = () => ({ version: 1, canvas: CANVAS, strokes: [], objects: [], background: null });
const copy = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const id = () => globalThis.crypto?.randomUUID?.() || `schema-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function normalizeDiagram(value) {
  const source = value && typeof value === "object" ? value : blankDiagram();
  const strokes = Array.isArray(source.strokes) ? source.strokes.slice(0, 250).map((stroke) => ({
    color: /^#[0-9a-f]{6}$/i.test(stroke?.color || "") ? stroke.color : "#17233d",
    width: clamp(stroke?.width, 1, 30) || 5,
    points: Array.isArray(stroke?.points) ? stroke.points.slice(0, 1000).map((point) => ({ x: clamp(point?.x, 0, 1000), y: clamp(point?.y, 0, 1000) })) : [],
  })).filter((stroke) => stroke.points.length > 1) : [];
  const types = new Set([...OBJECT_TYPES.map((item) => item.type), "text"]);
  const objects = Array.isArray(source.objects) ? source.objects.slice(0, 100).filter((object) => types.has(object?.type)).map((object) => ({
    id: String(object.id || id()).slice(0, 80), type: object.type, x: clamp(object.x, 0, 1000), y: clamp(object.y, 0, 1000),
    width: clamp(object.width, 25, 250) || 92, height: clamp(object.height, 25, 250) || 58, rotation: clamp(object.rotation, -3600, 3600),
    text: object.type === "text" ? String(object.text || "Texte").slice(0, 200) : undefined,
  })) : [];
  const knownRoad = roadBackground(source.background?.id);
  const background = knownRoad
    ? { id: knownRoad.id, asset: knownRoad.asset, src: knownRoad.src, name: knownRoad.name, width: knownRoad.width, height: knownRoad.height }
    : source.background?.src?.match(/^data:image\/(png|jpeg|webp);base64,/i)
      ? { id: source.background?.id ? String(source.background.id).slice(0, 80) : null, asset: source.background?.asset ? String(source.background.asset).slice(0, 240) : null, src: source.background.src, name: String(source.background.name || "Fond du schéma").slice(0, 160), width: clamp(source.background.width, 320, 2000) || 1000, height: clamp(source.background.height, 240, 2000) || 620 }
      : null;
  return { version: 1, canvas: CANVAS, strokes, objects, background };
}

function persistedBackground(background) {
  if (!background) return null;
  const knownRoad = roadBackground(background.id);
  if (knownRoad) return { id: knownRoad.id, asset: knownRoad.asset, name: knownRoad.name, width: knownRoad.width, height: knownRoad.height };
  return { id: background.id || null, asset: background.asset || null, src: background.src, name: background.name || "Fond du schéma", width: background.width || 1000, height: background.height || 620 };
}

function loadPersonalBackgrounds() {
  try {
    const backgrounds = JSON.parse(window.localStorage.getItem(BACKGROUNDS_KEY) || "[]");
    return Array.isArray(backgrounds) ? backgrounds.filter((background) => background?.src?.match(/^data:image\//)).slice(0, 6) : [];
  } catch { return []; }
}

function savePersonalBackgrounds(backgrounds) {
  try { window.localStorage.setItem(BACKGROUNDS_KEY, JSON.stringify(backgrounds.slice(0, 6))); } catch { /* Browser storage may be unavailable. */ }
}

function pointFromEvent(event, element) {
  const rect = element.getBoundingClientRect();
  return { x: clamp(((event.clientX - rect.left) / rect.width) * 1000, 0, 1000), y: clamp(((event.clientY - rect.top) / rect.height) * 1000, 0, 1000) };
}

function VehicleIcon({ type }) {
  const vehicle = OBJECT_TYPES.find((item) => item.type === type);
  if (type.startsWith("car")) return <svg viewBox="0 0 160 78" className="mf-schema-object-svg mf-schema-car-svg" aria-hidden="true"><path d="M31 4h98c17 0 28 14 28 35s-11 35-28 35H31C14 74 3 60 3 39S14 4 31 4Z" fill={vehicle?.color} stroke="#65707c" strokeWidth="2" /><path d="M27 14h106M27 64h106" stroke="#ffffffa8" strokeWidth="2" /><path d="M36 14c11-5 20-6 29-6v62c-10 0-20-2-29-6-6-8-9-16-9-25s3-17 9-25Z" fill="#d9dbdd" stroke="#68737d" strokeWidth="1.5" /><path d="M124 14c-11-5-20-6-29-6v62c10 0 20-2 29-6 6-8 9-16 9-25s-3-17-9-25Z" fill="#d9dbdd" stroke="#68737d" strokeWidth="1.5" /><path d="M69 9h22c9 8 13 18 13 30s-4 22-13 30H69c-9-8-13-18-13-30s4-22 13-30Z" fill={vehicle?.color} stroke="#7a3130" strokeWidth="1.5" /><path d="M80 8v62M46 20l-7 7m7 24-7-7m75-24 7 7m-7 24 7-7" stroke="#ffffffb0" strokeWidth="2" strokeLinecap="round" /><path d="M20 15h14v8H19zm0 40h14v8H19zm106-40h14v8h-15zm0 40h14v8h-15z" fill="#4d5560" /><path d="M2 39h13m130 0h13" stroke="#4d5560" strokeWidth="3" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 76 128" className="mf-schema-object-svg" aria-hidden="true"><ellipse cx="38" cy="14" rx="8" ry="12" fill="#10151a" /><ellipse cx="38" cy="114" rx="10" ry="13" fill="#10151a" /><path d="M29 25h18l6 17-6 51H29l-6-51 6-17Z" fill={vehicle?.color} stroke="#10151a" strokeWidth="3" strokeLinejoin="round" /><path d="M31 29h14v22H31z" fill="#111820" /><path d="M27 49h22l7 14-7 16H27l-7-16 7-14Z" fill={vehicle?.color} stroke="#10151a" strokeWidth="3" strokeLinejoin="round" /><path d="M30 53h16v28H30z" fill="#070b0e" /><path d="M22 38h11m10 0h11" fill="none" stroke="#10151a" strokeWidth="5" strokeLinecap="round" /><path d="M27 67h22M32 97h12" fill="none" stroke="#10151a" strokeWidth="4" strokeLinecap="round" /><circle cx="38" cy="46" r="3" fill="#f5fbff" /><path d="M38 2v8M38 119v7" fill="none" stroke="#10151a" strokeWidth="3" strokeLinecap="round" /></svg>;
}

function SchemaObjectVisual({ object }) {
  return object.type === "text" ? <span className="mf-schema-text-object">{object.text}</span> : <VehicleIcon type={object.type} />;
}

async function resizeBackground(file) {
  if (!file?.type.match(/^image\/(png|jpeg|webp)$/i)) throw new Error("Choisissez une image PNG, JPEG ou WebP.");
  const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const image = await new Promise((resolve, reject) => { const next = new Image(); next.onload = () => resolve(next); next.onerror = reject; next.src = source; });
  const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  const result = canvas.toDataURL("image/jpeg", 0.82);
  if (result.length > 980000) throw new Error("Cette image est trop lourde. Choisissez un fond plus léger.");
  return result;
}

export default function FormationSchemaEditor({ studentId, lesson, monitorId, onClose, onSaved, apiBase, readOnly = false }) {
  const [diagram, setDiagram] = useState(blankDiagram);
  const [savedDiagram, setSavedDiagram] = useState(blankDiagram);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editable, setEditable] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(DRAWING_COLORS[6].value);
  const [brushSize, setBrushSize] = useState(6);
  const [selectedId, setSelectedId] = useState(null);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [personalBackgrounds, setPersonalBackgrounds] = useState(() => typeof window === "undefined" ? [] : loadPersonalBackgrounds());
  const surfaceRef = useRef(null);
  const canvasRef = useRef(null);
  const diagramRef = useRef(blankDiagram());
  const drawingRef = useRef(null);
  const objectActionRef = useRef(null);
  const fileInputRef = useRef(null);
  const params = monitorId ? { monitor_id: monitorId } : {};
  const schemaEndpoint = apiBase || `/monitor/formation/${studentId}`;
  const selected = diagram.objects.find((object) => object.id === selectedId) || null;
  const canEdit = editable && !saving;
  const changed = JSON.stringify(diagram) !== JSON.stringify(savedDiagram);

  const applyLive = useCallback((next) => { const current = copy(next); diagramRef.current = current; setDiagram(current); }, []);
  const remember = useCallback((before) => { if (JSON.stringify(before) !== JSON.stringify(diagramRef.current)) { setPast((items) => [...items.slice(-49), copy(before)]); setFuture([]); } }, []);
  const commit = useCallback((next) => { const before = copy(diagramRef.current); applyLive(next); remember(before); }, [applyLive, remember]);

  const loadSchema = useCallback(async (quiet = false) => {
    if (!studentId || !lesson?.id) return;
    if (!quiet) setLoading(true);
    setError("");
    try {
      const { data } = await http.get(`${schemaEndpoint}/${lesson.id}/schema`, { params });
      const restored = normalizeDiagram(data?.data?.schema); diagramRef.current = restored; setDiagram(restored); setSavedDiagram(copy(restored)); setPast([]); setFuture([]); setSelectedId(null); setEditable(!readOnly && Boolean(data?.data?.editable));
      if (quiet) setNotice("Schéma enregistré rechargé.");
    } catch (requestError) { setError(requestError.response?.data?.message || "Impossible de charger le schéma de cette leçon."); }
    finally { setLoading(false); }
  }, [studentId, lesson?.id, monitorId]);

  useEffect(() => { loadSchema(); }, [loadSchema]);
  useEffect(() => {
    const canvas = canvasRef.current; const surface = surfaceRef.current;
    if (!canvas || !surface) return undefined;
    const draw = () => { const rect = surface.getBoundingClientRect(); if (!rect.width || !rect.height) return; const ratio = window.devicePixelRatio || 1; canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio); const context = canvas.getContext("2d"); context.setTransform(ratio, 0, 0, ratio, 0, 0); context.clearRect(0, 0, rect.width, rect.height); diagram.strokes.forEach((stroke) => { context.beginPath(); stroke.points.forEach((point, index) => { const x = (point.x / 1000) * rect.width; const y = (point.y / 1000) * rect.height; if (index) context.lineTo(x, y); else context.moveTo(x, y); }); context.strokeStyle = stroke.color; context.lineWidth = Math.max(1, (stroke.width / 1000) * rect.width); context.lineCap = "round"; context.lineJoin = "round"; context.stroke(); }); };
    draw(); const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(draw); observer?.observe(surface); return () => observer?.disconnect();
  }, [diagram]);

  const addObject = (type, point) => {
    const text = type === "text" ? window.prompt("Texte à placer sur le schéma :", "")?.trim() : "";
    if (type === "text" && !text) return;
    const object = { id: id(), type, x: point.x, y: point.y, width: type === "text" ? 190 : (type.startsWith("car") ? 100 : 62), height: type === "text" ? 48 : (type.startsWith("car") ? 64 : 108), rotation: 0, ...(type === "text" ? { text } : {}) };
    commit({ ...diagramRef.current, objects: [...diagramRef.current.objects, object] }); setSelectedId(object.id); setTool("select");
  };
  const canvasDown = (event) => {
    if (!canEdit) return;
    const point = pointFromEvent(event, surfaceRef.current);
    if (tool === "pen") { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); const before = copy(diagramRef.current); drawingRef.current = { pointerId: event.pointerId, before }; applyLive({ ...diagramRef.current, strokes: [...diagramRef.current.strokes, { color, width: brushSize, points: [point] }] }); return; }
    if (tool === "eraser") { const index = diagramRef.current.strokes.findLastIndex((stroke) => stroke.points.some((item) => Math.hypot(item.x - point.x, item.y - point.y) < Math.max(16, stroke.width * 2))); if (index >= 0) commit({ ...diagramRef.current, strokes: diagramRef.current.strokes.filter((_, position) => position !== index) }); return; }
    if (OBJECT_TYPES.some((item) => item.type === tool) || tool === "text") { addObject(tool, point); return; }
    setSelectedId(null);
  };
  const canvasMove = (event) => {
    const drawing = drawingRef.current; if (!drawing || drawing.pointerId !== event.pointerId) return;
    const point = pointFromEvent(event, surfaceRef.current); const current = copy(diagramRef.current); const stroke = current.strokes.at(-1); const last = stroke?.points.at(-1); if (!stroke || (last && Math.hypot(last.x - point.x, last.y - point.y) < 1.2)) return;
    if (stroke.points.length < 1000) { stroke.points.push(point); applyLive(current); }
  };
  const canvasUp = (event) => { const drawing = drawingRef.current; if (!drawing || drawing.pointerId !== event.pointerId) return; drawingRef.current = null; remember(drawing.before); if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); };
  const objectDown = (event, object, mode = "move") => { event.preventDefault(); event.stopPropagation(); if (tool === "trash" && canEdit) { commit({ ...diagramRef.current, objects: diagramRef.current.objects.filter((item) => item.id !== object.id) }); setSelectedId(null); return; } setSelectedId(object.id); if (!canEdit) return; event.currentTarget.setPointerCapture?.(event.pointerId); objectActionRef.current = { pointerId: event.pointerId, id: object.id, mode, before: copy(diagramRef.current), origin: copy(object), start: pointFromEvent(event, surfaceRef.current) }; };
  const objectMove = (event) => { const action = objectActionRef.current; if (!action || action.pointerId !== event.pointerId) return; event.preventDefault(); const point = pointFromEvent(event, surfaceRef.current); const current = copy(diagramRef.current); const object = current.objects.find((item) => item.id === action.id); if (!object) return; const dx = point.x - action.start.x; const dy = point.y - action.start.y; if (action.mode === "move") { object.x = clamp(action.origin.x + dx, 0, 1000); object.y = clamp(action.origin.y + dy, 0, 1000); } if (action.mode === "resize") { const ratio = action.origin.height / action.origin.width; object.width = clamp(action.origin.width + dx * 1.45, 25, 250); object.height = clamp(object.width * ratio, 25, 250); } if (action.mode === "rotate") object.rotation = Math.atan2(point.y - action.origin.y, point.x - action.origin.x) * 180 / Math.PI + 90; applyLive(current); };
  const objectUp = (event) => { const action = objectActionRef.current; if (!action || action.pointerId !== event.pointerId) return; objectActionRef.current = null; remember(action.before); if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); };
  const undo = () => setPast((items) => { const previous = items.at(-1); if (!previous) return items; setFuture((next) => [copy(diagramRef.current), ...next].slice(0, 50)); applyLive(previous); setSelectedId(null); return items.slice(0, -1); });
  const redo = () => setFuture((items) => { const next = items[0]; if (!next) return items; setPast((previous) => [...previous.slice(-49), copy(diagramRef.current)]); applyLive(next); setSelectedId(null); return items.slice(1); });
  const chooseBackground = (background) => { if (!canEdit) return; commit({ ...diagramRef.current, background: background ? { ...background } : null }); setGalleryOpen(false); };
  const uploadBackground = async (event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; try { const src = await resizeBackground(file); chooseBackground({ id: id(), name: file.name, src, width: 1000, height: 620 }); } catch (reason) { setError(reason.message || "Impossible de préparer cette image."); } };
  const createBackground = () => { const src = canvasRef.current?.toDataURL("image/png"); if (!src) return; const backgrounds = [{ id: id(), name: `Fond créé le ${new Date().toLocaleDateString("fr-FR")}`, src, width: 1000, height: 620 }, ...personalBackgrounds].slice(0, 6); setPersonalBackgrounds(backgrounds); savePersonalBackgrounds(backgrounds); setGalleryOpen(true); setNotice("Fond créé. Sélectionnez-le dans la galerie."); };
  const removeSelected = () => { if (canEdit && selected) { commit({ ...diagramRef.current, objects: diagramRef.current.objects.filter((object) => object.id !== selected.id) }); setSelectedId(null); } };
  const clearDiagram = () => { if (canEdit && window.confirm("Effacer les traits, objets et le fond de ce schéma ?")) { commit(blankDiagram()); setSelectedId(null); } };
  const save = async () => { if (!canEdit) return; setSaving(true); setError(""); setNotice(""); try { const schema = { ...diagramRef.current, background: persistedBackground(diagramRef.current.background) }; const { data } = await http.put(`${schemaEndpoint}/${lesson.id}/schema`, { schema }, { params }); const persisted = normalizeDiagram(data?.data?.schema); diagramRef.current = persisted; setDiagram(persisted); setSavedDiagram(copy(persisted)); setNotice("Schéma enregistré pour cette leçon."); onSaved?.(); } catch (requestError) { setError(requestError.response?.data?.message || "Impossible d’enregistrer le schéma."); } finally { setSaving(false); } };
  const close = () => { if (!changed || window.confirm("Fermer sans enregistrer les modifications du schéma ?")) onClose(); };

  return <div className="mf-schema-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) close(); }}><section className={`mf-schema-modal${readOnly ? " mf-schema-readonly" : ""}`} role="dialog" aria-modal="true" aria-label="Schéma de la leçon"><header className="mf-schema-header"><div><span>Formation</span><h2>Schéma de la leçon</h2><p>{lesson?.date || "Leçon"}</p></div><button type="button" onClick={close} disabled={saving} aria-label="Fermer le schéma"><X size={22} /></button></header>{loading ? <p className="mf-schema-loading">Chargement du schéma…</p> : <>{!editable && <p className="mf-schema-locked">Ce schéma est disponible en lecture seule.</p>}<div className="mf-schema-toolbar" role="toolbar" aria-label="Outils de dessin"><div className="mf-schema-tool-group mf-schema-colors" aria-label="Couleurs">{DRAWING_COLORS.map((item) => <button key={item.value} type="button" title={item.name} aria-label={item.name} disabled={!canEdit} className={color === item.value ? "selected" : ""} style={{ "--schema-color": item.value }} onClick={() => { setColor(item.value); setTool("pen"); }} />)}</div><div className="mf-schema-tool-group mf-schema-pen-controls"><button type="button" className={tool === "pen" ? "active" : ""} onClick={() => setTool("pen")} disabled={!canEdit} title="Pinceau"><Pencil size={20} /></button><span className="mf-schema-preview" style={{ "--schema-color": color, "--schema-size": `${Math.max(3, brushSize)}px` }} /><input type="range" min="2" max="24" value={brushSize} disabled={!canEdit} aria-label="Épaisseur du pinceau" onChange={(event) => { setBrushSize(Number(event.target.value)); setTool("pen"); }} /></div><div className="mf-schema-tool-group"><button type="button" className={tool === "select" ? "active" : ""} onClick={() => setTool("select")} disabled={!canEdit} title="Sélectionner"><MousePointer2 size={20} /></button><button type="button" className={tool === "text" ? "active" : ""} onClick={() => setTool("text")} disabled={!canEdit} title="Ajouter du texte"><Type size={20} /></button><button type="button" className={tool === "eraser" ? "active" : ""} onClick={() => setTool("eraser")} disabled={!canEdit} title="Effacer un trait"><Eraser size={20} /></button><button type="button" onClick={undo} disabled={!canEdit || !past.length} title="Annuler"><Undo2 size={20} /></button><button type="button" onClick={redo} disabled={!canEdit || !future.length} title="Rétablir"><Redo2 size={20} /></button></div><div className="mf-schema-tool-group mf-schema-object-tools">{OBJECT_TYPES.map((object) => <button key={object.type} type="button" title={object.label} aria-label={object.label} disabled={!canEdit} className={tool === object.type ? "active" : ""} onClick={() => setTool(object.type)}><VehicleIcon type={object.type} /></button>)}<button type="button" className={tool === "trash" ? "active danger" : "danger"} title="Supprimer un objet" aria-label="Supprimer un objet" disabled={!canEdit} onClick={() => setTool("trash")}><Trash2 size={20} /></button></div></div><div className="mf-schema-workspace"><div ref={surfaceRef} className={`mf-schema-surface tool-${tool} ${diagram.background ? "has-template-background" : ""}`} style={diagram.background ? { aspectRatio: `${diagram.background.width} / ${diagram.background.height}` } : undefined} onPointerDown={canvasDown} onPointerMove={canvasMove} onPointerUp={canvasUp} onPointerCancel={canvasUp}>{diagram.background?.src && <img className="mf-schema-background" src={diagram.background.src} alt="Fond du schéma" draggable="false" />}<canvas ref={canvasRef} className="mf-schema-canvas" aria-label="Zone de dessin" />{diagram.objects.map((object) => <div key={object.id} className={`mf-schema-object ${selectedId === object.id ? "selected" : ""}`} style={{ left: `${object.x / 10}%`, top: `${object.y / 10}%`, width: `${object.width / 10}%`, height: `${object.height / 10}%`, transform: `translate(-50%, -50%) rotate(${object.rotation}deg)` }} onPointerDown={(event) => objectDown(event, object)} onPointerMove={objectMove} onPointerUp={objectUp} onPointerCancel={objectUp}><SchemaObjectVisual object={object} />{selectedId === object.id && canEdit && <><button type="button" className="mf-schema-rotate-handle" aria-label="Tourner l’objet" onPointerDown={(event) => objectDown(event, object, "rotate")}><RotateCw size={13} /></button><button type="button" className="mf-schema-resize-handle" aria-label="Redimensionner l’objet" onPointerDown={(event) => objectDown(event, object, "resize")} /></>}</div>)}{!diagram.strokes.length && !diagram.objects.length && !diagram.background && <p className="mf-schema-hint">Choisissez un pinceau, un véhicule ou un fond pour commencer.</p>}</div></div><footer className="mf-schema-footer"><div className="mf-schema-background-actions"><button type="button" disabled={!canEdit} onClick={() => setGalleryOpen(true)}><ImagePlus size={19} />Ajouter fond</button><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadBackground} hidden /><button type="button" disabled={!canEdit} onClick={() => fileInputRef.current?.click()}><Upload size={18} />Importer</button><button type="button" disabled={!canEdit} onClick={createBackground}><Bike size={18} />Créer fond</button></div><div className="mf-schema-main-actions"><button type="button" disabled={!canEdit || !selected} onClick={removeSelected}><Trash2 size={18} />Supprimer objet</button><button type="button" disabled={!canEdit} onClick={clearDiagram}><Eraser size={18} />Effacer</button><button type="button" onClick={() => loadSchema(true)} disabled={loading || saving}><Eye size={18} />Revoir</button><button type="button" className="mf-schema-save" disabled={!canEdit || saving} onClick={save}><Save size={18} />{saving ? "Enregistrement…" : "Enregistrer"}</button></div></footer>{galleryOpen && <div className="mf-road-gallery-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setGalleryOpen(false); }}><section className="mf-road-gallery" role="dialog" aria-modal="true" aria-label="Choisir un fond"><header><div><span>Schéma de la leçon</span><h3>Choisir un fond</h3><p>Le fond reste verrouillé. Les véhicules et les tracés restent modifiables au-dessus.</p></div><button type="button" onClick={() => setGalleryOpen(false)} aria-label="Fermer la galerie"><X size={21} /></button></header><div className="mf-road-gallery-grid">{ROAD_BACKGROUNDS.map((background) => { const selectedBackground = background.id === "blank" ? !diagram.background : diagram.background?.id === background.id; return <button key={background.id} type="button" className={selectedBackground ? "selected" : ""} onClick={() => chooseBackground(background.id === "blank" ? null : background)}><img src={background.src} alt="" /><span>{background.name}</span><small>{background.category}</small></button>; })}</div>{personalBackgrounds.length > 0 && <section className="mf-road-gallery-custom"><h4>Mes fonds créés</h4><div className="mf-road-gallery-grid">{personalBackgrounds.map((background) => <button key={background.id} type="button" className={diagram.background?.id === background.id ? "selected" : ""} onClick={() => chooseBackground(background)}><img src={background.src} alt="" /><span>{background.name}</span><small>Personnel</small></button>)}</div></section>}</section></div>}{error && <p className="mf-error mf-schema-message" role="alert">{error}</p>}{notice && <p className="mf-success mf-schema-message" role="status">{notice}</p>}</>}</section></div>;
}