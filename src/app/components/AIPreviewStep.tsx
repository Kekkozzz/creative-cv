"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Maximize2, Minimize2, RotateCcw, ArrowRight } from "lucide-react";
import Image from "next/image";
import PreviewLoading from "./PreviewLoading";
import { createDraftQuote } from "@/app/actions/quotes";

const SECTORS = [
  "Ristorazione",
  "Moda",
  "Tech",
  "Salute",
  "Immobiliare",
  "Educazione",
];
const STYLES = ["Minimal", "Moderno", "Corporate", "Creativo", "Elegante"];
const COLOR_PRESETS = ["#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c"];

type GenerationState = "idle" | "generating-image" | "complete" | "error";

export type AIFormData = {
  businessName: string;
  sector: string;
  style: string;
  colors: string[];
  description: string;
  referenceUrls: string;
};

type AIPreviewStepProps = {
  serviceName: string;
  serviceId: string;
  tierName: string;
  tierKey: string;
  tierPrice: number;
  features: string[];
  addOns: string[];
  addOnsData: { name: string; price: string; priceNumeric: number; recurring: boolean }[];
  initialData?: AIFormData | null;
  persistedImage?: string | null;
  persistedPreviewId?: string | null;
  onImageChange?: (img: string | null) => void;
  onPreviewIdChange?: (id: string | null) => void;
  onProceed: () => void;
  onStateChange?: (state: { canGenerate: boolean; isGenerating: boolean; isComplete: boolean }) => void;
  onFormDataChange?: (data: AIFormData) => void;
  onDraftCreated?: (quoteId: string) => void;
  triggerGenerate?: number;
};

function deriveInitialSectorState(initialSector?: string) {
  if (!initialSector) return { sector: "", customSector: "" };
  if (SECTORS.includes(initialSector)) {
    return { sector: initialSector, customSector: "" };
  }
  return { sector: "Altro", customSector: initialSector };
}

export default function AIPreviewStep({
  serviceName,
  serviceId,
  tierName,
  tierKey,
  tierPrice,
  features,
  addOns,
  addOnsData,
  initialData,
  persistedImage,
  onImageChange,
  onPreviewIdChange,
  onProceed,
  onStateChange,
  onFormDataChange,
  onDraftCreated,
  triggerGenerate,
}: AIPreviewStepProps) {
  const initialSectorState = deriveInitialSectorState(initialData?.sector);

  const [businessName, setBusinessName] = useState(initialData?.businessName ?? "");
  const [sector, setSector] = useState(initialSectorState.sector);
  const [customSector, setCustomSector] = useState(initialSectorState.customSector);
  const [style, setStyle] = useState(initialData?.style ?? "");
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.colors ?? []);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [referenceUrls, setReferenceUrls] = useState(initialData?.referenceUrls ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [state, setState] = useState<GenerationState>(persistedImage ? "complete" : "idle");
  const [imageBase64, setImageBase64Local] = useState<string | null>(persistedImage ?? null);

  const setImageBase64 = useCallback((img: string | null) => {
    setImageBase64Local(img);
    onImageChange?.(img);
  }, [onImageChange]);

  const setPreviewId = useCallback((id: string | null) => {
    onPreviewIdChange?.(id);
  }, [onPreviewIdChange]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!fullscreenRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      fullscreenRef.current.requestFullscreen();
    }
  }, []);

  const effectiveSector = sector === "Altro" ? customSector : sector;
  const canGenerate = businessName.trim() && effectiveSector.trim() && style;

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : prev.length < 3
          ? [...prev, color]
          : prev
    );
  }

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("#c9b99a");
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!showColorPicker) return;
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColorPicker]);

  function applyCustomColor(color: string) {
    setSelectedColors((prev) => {
      const withoutCustom = prev.filter((c) => COLOR_PRESETS.includes(c));
      return withoutCustom.length < 3
        ? [...withoutCustom, color]
        : prev;
    });
  }

  function handleCustomColor(e: React.ChangeEvent<HTMLInputElement>) {
    const color = e.target.value;
    setCustomColorInput(color);
    setSelectedColors((prev) => {
      const withoutCustom = prev.filter((c) => COLOR_PRESETS.includes(c));
      return withoutCustom.length < 3
        ? [...withoutCustom, color]
        : [...withoutCustom.slice(0, 2), color];
    });
  }

  function buildRequestBody() {
    return {
      businessName: businessName.trim(),
      sector: effectiveSector.trim(),
      style,
      colorPalette: selectedColors,
      description: description.trim(),
      referenceUrls: referenceUrls.trim() || undefined,
      serviceName,
      serviceId,
      tierName,
      features,
      addOns,
    };
  }

  async function handleGenerate() {
    if (!canGenerate) return;

    setState("generating-image");
    setErrorMsg("");
    setImageBase64(null);

    const body = buildRequestBody();

    const controller = new AbortController();
    abortRef.current = controller;
    const clientTimeout = setTimeout(() => controller.abort(), 200_000);

    try {
      const imgRes = await fetch("/api/generate-preview/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!imgRes.ok) {
        const data = await imgRes.json();
        throw new Error(data.error || "Errore generazione immagine");
      }

      const { imageBase64: img, previewId: pId, previewSaved } = await imgRes.json();
      setImageBase64(img);
      if (pId) setPreviewId(pId);
      if (!previewSaved) {
        console.warn("Preview image was not persisted to storage");
      }
      setState("complete");

      // Create draft quote and link preview
      try {
        const draftResult = await createDraftQuote({
          serviceId,
          serviceName,
          tierKey,
          tierName,
          tierPrice,
          addOns: addOnsData,
          features,
          businessName: businessName.trim(),
          sector: effectiveSector.trim(),
          style,
          colorPalette: selectedColors,
          description: description.trim(),
          referenceUrls: referenceUrls.trim() || undefined,
        }, pId || undefined);
        if (draftResult.success) {
          onDraftCreated?.(draftResult.quoteId);
        }
      } catch (draftErr) {
        console.error("Draft quote creation failed (non-fatal):", draftErr);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setErrorMsg("La richiesta ha impiegato troppo tempo. Verifica la connessione e riprova.");
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Errore imprevisto. Riprova.");
      }
      setState("error");
    } finally {
      clearTimeout(clientTimeout);
      abortRef.current = null;
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setLogoFile(file);
    }
  }

  const isGenerating = state === "generating-image";
  const isComplete = state === "complete";

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.({ canGenerate: !!canGenerate, isGenerating, isComplete });
  }, [canGenerate, isGenerating, isComplete, onStateChange]);

  // Notify parent of form data changes
  useEffect(() => {
    onFormDataChange?.({
      businessName,
      sector: effectiveSector,
      style,
      colors: selectedColors,
      description,
      referenceUrls,
    });
  }, [businessName, effectiveSector, style, selectedColors, description, referenceUrls, onFormDataChange]);

  // Parent triggers generation via incrementing triggerGenerate
  const prevTriggerRef = useRef(triggerGenerate);
  useEffect(() => {
    // Only trigger if the value actually changed (not on remount with stale value)
    if (
      triggerGenerate &&
      triggerGenerate > 0 &&
      triggerGenerate !== prevTriggerRef.current &&
      canGenerate &&
      !isGenerating &&
      state !== "complete"
    ) {
      handleGenerate();
    }
    prevTriggerRef.current = triggerGenerate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerGenerate]);

  const isResult = imageBase64 && state === "complete";

  return (
    <>
      {/* Header — hidden when preview result is shown (moves into grid) */}
      {!isResult && (
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2 font-mono">
            Step 5 di 6
          </p>
          <h3 className="font-display text-2xl md:text-3xl mb-2">
            Preview AI — {serviceName}
          </h3>
          <p className="text-sm text-muted mb-6">
            Raccontaci la tua attività e genereremo una preview personalizzata
          </p>
        </>
      )}

      {/* Form */}
      {(state === "idle" || state === "error") && (
        <div className="flex flex-col gap-4">
          {/* Row 1: Nome + Settore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-white mb-1.5 block">
                Nome Attività <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Es: Pizzeria Da Mario"
                maxLength={100}
                className="w-full bg-transparent border border-border px-4 py-2.5 text-sm placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-white mb-1.5 block">
                Settore <span className="text-accent">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSector(s)}
                    className={`px-2.5 py-1 text-xs border rounded-full transition-all duration-200 ${
                      sector === s
                        ? "border-accent text-accent bg-accent/5"
                        : "border-border text-muted hover:border-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSector("Altro")}
                  className={`px-2.5 py-1 text-xs border rounded-full transition-all duration-200 ${
                    sector === "Altro"
                      ? "border-accent text-accent bg-accent/5"
                      : "border-border text-muted hover:border-muted"
                  }`}
                >
                  Altro...
                </button>
              </div>
              {sector === "Altro" && (
                <input
                  type="text"
                  value={customSector}
                  onChange={(e) => setCustomSector(e.target.value)}
                  placeholder="Specifica il settore"
                  maxLength={50}
                  className="mt-1.5 w-full bg-transparent border border-border px-4 py-2 text-sm placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
                />
              )}
            </div>
          </div>

          {/* Row 2: Stile + Colori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-white mb-1.5 block">
                Stile Preferito <span className="text-accent">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-2.5 py-1 text-xs border rounded-full transition-all duration-200 ${
                      style === s
                        ? "border-accent text-accent bg-accent/5"
                        : "border-border text-muted hover:border-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-white mb-1.5 block">
                Palette Colori <span className="text-muted/50">(max 3)</span>
              </label>
              <div className="flex gap-2.5 items-center">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleColor(c)}
                    className="w-7 h-7 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: c,
                      boxShadow: selectedColors.includes(c)
                        ? `0 0 0 2px var(--color-background), 0 0 0 3px ${c}`
                        : "none",
                      transform: selectedColors.includes(c) ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                ))}
                {/* Custom color picker */}
                {(() => {
                  const customColor = selectedColors.find((c) => !COLOR_PRESETS.includes(c));
                  return (
                    <div className="relative" ref={colorPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-7 h-7 rounded-full border border-dashed border-border flex items-center justify-center text-muted hover:border-accent hover:text-accent transition-all duration-200"
                        style={customColor ? {
                          backgroundColor: customColor,
                          borderStyle: "solid",
                          borderColor: customColor,
                          boxShadow: `0 0 0 2px var(--color-background), 0 0 0 3px ${customColor}`,
                        } : undefined}
                        title="Colore personalizzato"
                      >
                        {!customColor && <span className="text-xs leading-none">+</span>}
                      </button>

                      {showColorPicker && (
                        <div className="absolute bottom-full mb-3 right-0 bg-surface border border-border p-3 shadow-lg z-20 w-52">
                          <p className="text-[10px] text-muted mb-2 uppercase tracking-wider">Colore personalizzato</p>
                          <input
                            type="color"
                            value={customColorInput}
                            onChange={handleCustomColor}
                            className="w-full h-8 cursor-pointer border-0 bg-transparent mb-2"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customColorInput}
                              onChange={(e) => {
                                setCustomColorInput(e.target.value);
                                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                                  applyCustomColor(e.target.value);
                                }
                              }}
                              placeholder="#000000"
                              className="flex-1 bg-transparent border border-border px-2 py-1.5 text-xs font-mono text-foreground focus:border-accent/50 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                applyCustomColor(customColorInput);
                                setShowColorPicker(false);
                              }}
                              className="bg-accent text-background px-3 py-1.5 text-xs font-medium hover:bg-foreground transition-colors"
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Row 3: Descrizione (full width) */}
          <div>
            <label className="text-[11px] text-muted mb-1.5 block">
              Descrizione Attività <span className="text-muted/50">(opzionale)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi brevemente la tua attività, cosa offri e a chi ti rivolgi..."
              rows={2}
              maxLength={500}
              className="w-full bg-transparent border border-border px-4 py-2.5 text-sm placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Row 4: Logo + URL riferimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-muted mb-1.5 block">
                Logo <span className="text-muted/50">(opzionale, max 2MB)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.svg,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              {logoFile ? (
                <div className="flex items-center gap-2 px-4 py-2 border border-border text-sm">
                  <span className="text-accent truncate flex-1">{logoFile.name}</span>
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-muted hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-border text-sm text-muted hover:border-accent/30 hover:text-foreground transition-all w-full"
                >
                  <Upload size={14} strokeWidth={1.5} />
                  Carica logo
                </button>
              )}
            </div>
            <div>
              <label className="text-[11px] text-muted mb-1.5 block">
                Siti di Riferimento <span className="text-muted/50">(opzionale)</span>
              </label>
              <input
                type="text"
                value={referenceUrls}
                onChange={(e) => setReferenceUrls(e.target.value)}
                placeholder="www.esempio.com"
                maxLength={200}
                className="w-full bg-transparent border border-border px-4 py-2 text-sm placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Error message */}
          {state === "error" && errorMsg && (
            <div className="px-4 py-3 border border-red-500/30 bg-red-500/5 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <PreviewLoading />
      )}

      {/* Image result — two-column layout starting from top */}
      {isResult && (
        <div className="grid grid-cols-1 md:grid-cols-[0.8fr_2fr] gap-6 items-start">
          {/* Left column: header + CTAs */}
          <div className="flex flex-col gap-4 md:gap-5 xl:gap-6">
            <div>
              <p className="text-[10px] xl:text-[11px] uppercase tracking-[0.2em] text-accent font-mono mb-1 xl:mb-2">
                Mockup — {businessName}
              </p>
              <h3 className="font-display text-xl md:text-2xl xl:text-3xl mb-1.5 xl:mb-2">
                Il tuo sito, immaginato
              </h3>
              <p className="text-xs xl:text-sm text-muted leading-relaxed">
                Visualizzala a schermo intero per coglierne ogni dettaglio.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 xl:gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="bg-foreground text-background px-4 py-2.5 xl:py-3 text-xs xl:text-sm font-medium tracking-wide hover:bg-accent transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <Maximize2 size={13} className="group-hover:scale-110 transition-transform xl:w-4! xl:h-4!" />
                Schermo Intero
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-2 xl:py-2.5 text-xs xl:text-sm font-medium tracking-wide border border-border text-muted hover:text-foreground hover:border-accent/50 transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={11} />
                Rigenera
              </button>
              <button
                type="button"
                onClick={onProceed}
                className="px-4 py-2 xl:py-2.5 text-xs xl:text-sm font-medium tracking-wide border border-accent text-accent hover:bg-accent/10 transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                Procedi
                <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* Right column: image filling available height */}
          <div
            ref={fullscreenRef}
            className="relative border border-border rounded overflow-hidden bg-black cursor-pointer"
            onClick={!isFullscreen ? toggleFullscreen : undefined}
          >
            <div className="px-3 py-1 border-b border-border bg-surface/30 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-accent font-mono">
                Preview
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="text-muted hover:text-accent transition-colors"
                title={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
            <div className={isFullscreen ? "" : "relative max-h-[min(50vh,360px)] overflow-hidden"}>
              <Image
                src={imageBase64}
                alt={`Mockup preview per ${businessName}`}
                width={1440}
                height={900}
                unoptimized
                className={isFullscreen
                  ? "w-full h-[calc(100vh-33px)] object-contain"
                  : "w-full object-cover object-top"
                }
              />
              {/* Overlay to invite fullscreen */}
              {!isFullscreen && (
                <>
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black via-black/60 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-300 group/overlay">
                    <div className="opacity-0 group-hover/overlay:opacity-100 transition-all duration-300 scale-90 group-hover/overlay:scale-100 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center backdrop-blur-sm bg-white/10">
                        <Maximize2 size={20} className="text-white" />
                      </div>
                      <span className="text-xs font-medium tracking-wide text-white">
                        Schermo intero
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
