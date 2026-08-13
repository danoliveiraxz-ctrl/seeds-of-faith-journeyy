import { useEffect, useRef, useState } from "react";
import { VSL_URL, isPlaceholder } from "@/config/site";
import { track } from "@/lib/tracking";

/**
 * Player da VSL: grande, responsivo, sem autoplay com áudio.
 * O player só é montado quando o bloco entra em tela (performance no mobile).
 * Suporta vídeo MP4 hospedado nos assets Lovable ou iframes de embed (YouTube/Vimeo/etc.).
 */
export function VslPlayer() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pending = isPlaceholder(VSL_URL);
  const isHostedVideo =
    !pending &&
    (VSL_URL.endsWith(".mp4") ||
      VSL_URL.includes("/__l5e/assets-v1/"));

  useEffect(() => {
    const el = ref.current;
    if (!el || pending) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          track("ViewContent", { content_name: "VSL Sementes de Fé" });
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pending]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl border border-gold/40 bg-ink shadow-[var(--shadow-lift)] sm:rounded-3xl"
      style={{ aspectRatio: "16 / 9" }}
    >
      {pending ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary px-6 text-center text-primary-foreground">
          <span className="grid size-14 place-items-center rounded-full bg-gold text-gold-foreground">
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
          <p className="text-sm font-semibold sm:text-base">Vídeo de apresentação</p>
          <p className="text-xs opacity-80">[INSERIR URL DA VSL]</p>
        </div>
      ) : visible && isHostedVideo ? (
        <video
          src={VSL_URL}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full"
          aria-label="Apresentação do Sementes de Fé"
          onPlay={() => track("VideoPlay", { content_name: "VSL Sementes de Fé" })}
          onEnded={() => track("VideoComplete", { content_name: "VSL Sementes de Fé" })}
        />
      ) : visible ? (
        <iframe
          src={VSL_URL}
          title="Apresentação do Sementes de Fé"
          className="absolute inset-0 size-full"
          allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : null}
    </div>
  );
}
