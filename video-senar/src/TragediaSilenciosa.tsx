import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FPS = 30;
const s = (seg: number) => Math.round(seg * FPS);
export const DURACAO_TOTAL = s(46);
const TRANSICAO = 10; // frames de crossfade entre cenas

const COR = {
  fundo: "#050A08",
  verde: "#8DDB2C",
  verdeEscuro: "#0B1A10",
  azul: "#1F5A8C",
  amarelo: "#FFD400",
  vermelho: "#FF453A",
  branco: "#FFFFFF",
};

const FONTE = "'Inter Display', Inter, sans-serif";
const ALTURA_IMAGEM = 1320; // área da foto (o resto é o "palco" das legendas)

type Props = { variante: "reels" | "ads"; comNarracao: boolean };

/* =====================================================================
   LEGENDAS: blocos de 2–3 palavras, palavra ativa destacada (karaokê)
   ===================================================================== */
type Bloco = { texto: string; de: number; ate: number; cor?: Record<string, string> };

const LEGENDAS: Bloco[] = [
  { texto: "Ninguém gosta", de: 0.5, ate: 2.3 },
  { texto: "de gastar", de: 2.3, ate: 3.8, cor: { gastar: COR.vermelho } },
  { texto: "com dedetização", de: 3.8, ate: 6, cor: { dedetização: COR.amarelo } },

  { texto: "Todo mundo prefere", de: 6.3, ate: 8.2 },
  { texto: "lazer,", de: 8.2, ate: 9.4, cor: { lazer: COR.verde } },
  { texto: "uma viagem...", de: 9.4, ate: 12, cor: { viagem: COR.verde } },

  { texto: "Até o dia", de: 12.3, ate: 14 },
  { texto: "em que o pior", de: 14, ate: 15.8, cor: { pior: COR.vermelho } },
  { texto: "acontece.", de: 15.8, ate: 18 },

  { texto: "Quanto custa", de: 18.3, ate: 20 },
  { texto: "a emergência", de: 20, ate: 22.2, cor: { emergência: COR.vermelho } },
  { texto: "no hospital?", de: 22.2, ate: 24 },
  { texto: "E o antídoto?", de: 24, ate: 26, cor: { antídoto: COR.amarelo } },

  { texto: "Ver seu filho", de: 26.3, ate: 28.2, cor: { filho: COR.amarelo } },
  { texto: "ou seu pai", de: 28.2, ate: 30, cor: { pai: COR.amarelo } },
  { texto: "na UTI", de: 30, ate: 32, cor: { UTI: COR.vermelho } },
  { texto: "por uma picada?", de: 32, ate: 34 },

  { texto: "A Senar é", de: 34.4, ate: 36, cor: { Senar: COR.verde } },
  { texto: "um seguro de vida", de: 36, ate: 38.2, cor: { seguro: COR.verde, vida: COR.verde } },
  { texto: "para sua família", de: 38.2, ate: 40, cor: { família: COR.verde } },
];

const limpa = (p: string) => p.replace(/[.,?!:…]/g, "");

const Legendas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bloco = LEGENDAS.find((b) => frame >= s(b.de) && frame < s(b.ate));
  if (!bloco) return null;

  const ini = s(bloco.de);
  const fim = s(bloco.ate);
  const palavras = bloco.texto.split(" ");
  const local = frame - ini;
  const entrada = spring({ frame: local, fps, config: { damping: 16, stiffness: 260, mass: 0.6 } });
  const saida = interpolate(frame, [fim - 4, fim], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // A palavra ativa avança ao longo do bloco (deixando a última um pouco mais)
  const passo = (fim - ini) / (palavras.length + 0.4);
  const ativa = Math.min(palavras.length - 1, Math.floor(local / passo));

  return (
    <div
      style={{
        position: "absolute",
        top: 1330,
        left: 70,
        right: 70,
        height: 300,
        display: "flex",
        flexWrap: "wrap",
        alignContent: "center",
        justifyContent: "center",
        gap: "14px 20px",
        opacity: entrada * saida,
        transform: `translateY(${(1 - entrada) * 26}px) scale(${interpolate(entrada, [0, 1], [0.92, 1])})`,
      }}
    >
      {palavras.map((p, i) => {
        const corEnfase = bloco.cor?.[limpa(p)];
        const ehAtiva = i === ativa;
        const pulso = ehAtiva ? spring({ frame: local - i * passo, fps, config: { damping: 12, stiffness: 300 } }) : 1;
        return (
          <span
            key={i}
            style={{
              fontFamily: FONTE,
              fontWeight: 900,
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              padding: "10px 20px 14px",
              borderRadius: 18,
              color: ehAtiva ? COR.verdeEscuro : corEnfase ?? COR.branco,
              background: ehAtiva ? corEnfase ?? COR.verde : "transparent",
              boxShadow: ehAtiva ? "0 12px 30px rgba(0,0,0,.45)" : "none",
              textShadow: ehAtiva ? "none" : "0 4px 0 rgba(0,0,0,.9), 0 0 24px rgba(0,0,0,.8)",
              transform: `scale(${interpolate(pulso, [0, 1], [1.12, 1])})`,
              transition: "none",
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
};

/* =====================================================================
   CENA DE FOTO: largura total, movimento de câmera e fusão suave
   ===================================================================== */
type Movimento = { zoom: [number, number]; x?: [number, number]; y?: [number, number] };

const Foto: React.FC<{
  src: string;
  foco?: string; // object-position
  mov: Movimento;
  brilho?: [number, number];
  tom?: string; // overlay de cor (grade)
  tremor?: boolean;
}> = ({ src, foco = "50% 50%", mov, brilho = [1, 1], tom, tremor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const zoom = interpolate(p, [0, 1], mov.zoom);
  const tx = interpolate(p, [0, 1], mov.x ?? [0, 0]);
  const ty = interpolate(p, [0, 1], mov.y ?? [0, 0]);
  const br = interpolate(p, [0, 1], brilho);
  const shake = tremor ? Math.sin(frame * 2.1) * interpolate(frame, [0, 16], [26, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      {/* Extensão desfocada da própria imagem: preenche o palco das legendas sem "borda" */}
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: -80,
          width: "calc(100% + 160px)",
          height: "calc(100% + 160px)",
          objectFit: "cover",
          objectPosition: foco,
          filter: `blur(60px) brightness(${0.28 * br}) saturate(1.3)`,
        }}
      />
      {/* Foto principal em largura total, com fusão em gradiente na base */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: ALTURA_IMAGEM,
          overflow: "hidden",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: foco,
            transform: `translate(${tx + shake}px, ${ty}px) scale(${zoom})`,
            filter: `brightness(${br}) contrast(1.08) saturate(1.08)`,
          }}
        />
        {tom && <AbsoluteFill style={{ background: tom }} />}
        {/* Topo levemente escurecido (área da interface do Reels) */}
        <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.45), transparent 18%)" }} />
      </div>
    </AbsoluteFill>
  );
};

/* Crossfade de entrada/saída para cada cena */
const Fusao: React.FC<{ children: React.ReactNode; entrada?: boolean; saida?: boolean }> = ({
  children,
  entrada = true,
  saida = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = Math.min(
    entrada ? interpolate(frame, [0, TRANSICAO], [0, 1], { extrapolateRight: "clamp" }) : 1,
    saida ? interpolate(frame, [durationInFrames - TRANSICAO, durationInFrames], [1, 0], { extrapolateLeft: "clamp" }) : 1
  );
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

const Logo: React.FC<{ largura: number; brilho?: boolean }> = ({ largura, brilho }) => (
  <Img
    src={staticFile("img/logo.png")}
    style={{
      width: largura,
      filter: brilho
        ? "drop-shadow(0 0 50px rgba(141,219,44,.5)) drop-shadow(0 24px 50px rgba(0,0,0,.7))"
        : "drop-shadow(0 18px 40px rgba(0,0,0,.6))",
    }}
  />
);

/* =====================================================================
   CENAS
   ===================================================================== */
/* Panorâmica: imagem larga (escorpião + pé) com movimento horizontal de câmera */
const PROPORCAO_PANO = 2580 / 818;
const Panorama: React.FC<{
  altura: [number, number]; // altura da imagem na tela (início → fim)
  centroX: [number, number]; // ponto da imagem (0–1) no centro da tela (início → fim)
  brilho?: [number, number];
  tom?: string;
  tremor?: boolean;
}> = ({ altura, centroX, brilho = [1, 1], tom, tremor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const h = interpolate(p, [0, 1], altura);
  const w = h * PROPORCAO_PANO;
  const cx = interpolate(p, [0, 1], centroX);
  const left = Math.min(0, Math.max(1080 - w, 540 - cx * w));
  const br = interpolate(p, [0, 1], brilho);
  const shake = tremor ? Math.sin(frame * 2.1) * interpolate(frame, [0, 16], [24, 0], { extrapolateRight: "clamp" }) : 0;
  const src = staticFile("img/hd/escorpiao-pe.jpg");
  const centroY = 660;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: -100,
          width: "calc(100% + 200px)",
          height: "calc(100% + 200px)",
          objectFit: "cover",
          objectPosition: `${cx * 100}% 50%`,
          filter: `blur(70px) brightness(${0.3 * br}) saturate(1.3)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: left + shake,
          top: centroY - h / 2,
          width: w,
          height: h,
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 88%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 4%, #000 88%, transparent 100%)",
        }}
      >
        <Img src={src} style={{ width: "100%", height: "100%", filter: `brightness(${br}) contrast(1.06) saturate(1.05)` }} />
        {tom && <AbsoluteFill style={{ background: tom }} />}
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.45), transparent 16%)" }} />
    </AbsoluteFill>
  );
};

const Cena1 = () => {
  const frame = useCurrentFrame();
  const surgir = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: surgir }}>
      {/* Só o escorpião: o pé fica fora do quadro até a cena 3 */}
      <Panorama
        altura={[540, 610]}
        centroX={[0.33, 0.335]}
        brilho={[0.35, 1]}
        tom="radial-gradient(ellipse at 40% 50%, transparent 35%, rgba(0,0,0,.65) 100%)"
      />
    </AbsoluteFill>
  );
};

const Cena2 = () => (
  <Foto src="img/hd/bebe.jpg" foco="78% 55%" mov={{ zoom: [1.0, 1.1], y: [0, -10] }} brilho={[1.05, 1.12]} tom="linear-gradient(rgba(255,190,120,.10), rgba(255,190,120,.06))" />
);

const Cena3 = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 2, 12], [1, 0.95, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {/* Revelação: a câmera desliza do escorpião até o pé da criança */}
      <Panorama
        altura={[700, 600]}
        centroX={[0.33, 0.78]}
        brilho={[1, 0.92]}
        tremor
        tom="radial-gradient(ellipse at 60% 50%, transparent 40%, rgba(110,0,0,.5) 100%)"
      />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

const ecg = (largura: number, meio: number, passo = 270) => {
  let d = `M 0 ${meio}`;
  for (let x = 0; x < largura + passo; x += passo) {
    d += ` L ${x + 90} ${meio} L ${x + 108} ${meio - 26} L ${x + 126} ${meio} L ${x + 144} ${meio}`;
    d += ` L ${x + 156} ${meio + 40} L ${x + 174} ${meio - 230} L ${x + 192} ${meio + 90} L ${x + 207} ${meio}`;
    d += ` L ${x + 228} ${meio - 34} L ${x + 249} ${meio} L ${x + passo} ${meio}`;
  }
  return d;
};

const Cena4 = () => {
  const frame = useCurrentFrame();
  const varredura = (frame % 75) / 75;
  const pisca = Math.floor(frame / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #0A2A22 0%, #020807 75%)" }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(rgba(141,219,44,.07) 1px, transparent 1px) 0 0/60px 60px, linear-gradient(90deg, rgba(141,219,44,.07) 1px, transparent 1px) 0 0/60px 60px",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 60%, transparent 75%)",
        }}
      />
      <div style={{ position: "absolute", top: 260, left: 70, right: 70, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: pisca ? 1 : 0.35 }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: COR.vermelho, boxShadow: `0 0 34px ${COR.vermelho}` }} />
          <span style={{ fontFamily: FONTE, fontWeight: 800, fontSize: 46, color: COR.vermelho, letterSpacing: 6 }}>EMERGÊNCIA</span>
        </div>
        <div style={{ fontFamily: "JetBrains Mono, monospace", color: COR.verde, textAlign: "right" }}>
          <div style={{ fontSize: 34, opacity: 0.7, letterSpacing: 4 }}>BPM</div>
          <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1, textShadow: `0 0 30px ${COR.verde}` }}>
            {148 + Math.round(Math.sin(frame / 8) * 7)}
          </div>
        </div>
      </div>
      <svg width={1080} height={1320} style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <linearGradient id="rastro" x1="0" x2="1">
            <stop offset={Math.max(0, varredura - 0.45)} stopColor={COR.verde} stopOpacity={0} />
            <stop offset={varredura} stopColor={COR.verde} stopOpacity={1} />
            <stop offset={Math.min(1, varredura + 0.002)} stopColor={COR.verde} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={ecg(1080, 820)} stroke="url(#rastro)" strokeWidth={9} fill="none" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 16px ${COR.verde})` }} />
        <circle cx={varredura * 1080} cy={820} r={0} />
      </svg>
    </AbsoluteFill>
  );
};

const Cena5 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escudo = spring({ frame: frame - 150, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <Foto src="img/hd/familia.jpg" foco="42% 8%" mov={{ zoom: [1.06, 1.0], x: [-20, 10] }} brilho={[0.9, 1.1]} />
      <div style={{ position: "absolute", top: 960, right: 60, opacity: escudo, transform: `scale(${escudo})` }}>
        <Logo largura={240} />
      </div>
    </AbsoluteFill>
  );
};

const Cena6 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 140 } });
  const luz = interpolate(frame, [0, 45], [0.45, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Foto src="img/hd/aplicacao.jpg" foco="30% 60%" mov={{ zoom: [1.1, 1.22] }} brilho={[luz * 0.55, 0.6]} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(141,219,44,.28), transparent 55%)" }} />
      <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])})` }}>
          <Logo largura={620} brilho />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Whats = ({ tam }: { tam: number }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z" />
  </svg>
);

const Cena7: React.FC<{ variante: Props["variante"] }> = ({ variante }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = (atraso: number) => spring({ frame: frame - atraso, fps, config: { damping: 14, stiffness: 160 } });
  const pulso = 1 + Math.sin(frame / 5) * 0.03;
  const linhas = variante === "reels" ? ["Clica no", "link da bio"] : ["Toque em", "Enviar mensagem"];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 28%, #12301F 0%, #040A07 65%)", alignItems: "center" }}>
      <div style={{ marginTop: 230, opacity: e(0), transform: `translateY(${(1 - e(0)) * 50}px)` }}>
        <Logo largura={400} brilho />
      </div>
      <div style={{ marginTop: 70, textAlign: "center", opacity: e(8), transform: `translateY(${(1 - e(8)) * 40}px)` }}>
        <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 112, lineHeight: 1, color: COR.branco, textTransform: "uppercase" }}>{linhas[0]}</div>
        <div
          style={{
            display: "inline-block",
            marginTop: 18,
            fontFamily: FONTE,
            fontWeight: 900,
            fontSize: variante === "ads" ? 92 : 112,
            lineHeight: 1,
            color: COR.verdeEscuro,
            background: COR.verde,
            padding: "12px 28px 18px",
            borderRadius: 22,
            textTransform: "uppercase",
          }}
        >
          {linhas[1]}
        </div>
      </div>
      <div
        style={{
          marginTop: 70,
          display: "flex",
          alignItems: "center",
          gap: 22,
          background: "#25D366",
          color: "#fff",
          borderRadius: 999,
          padding: "28px 56px",
          fontFamily: FONTE,
          fontWeight: 800,
          fontSize: variante === "reels" ? 62 : 54,
          boxShadow: "0 22px 60px rgba(37,211,102,.4)",
          opacity: e(16),
          transform: `scale(${e(16) * pulso})`,
        }}
      >
        <Whats tam={64} />
        <span>{variante === "reels" ? "(81) 99301-8101" : "Fale com a Senar"}</span>
      </div>
      <div style={{ marginTop: 56, fontFamily: FONTE, fontWeight: 800, fontSize: 50, color: COR.amarelo, letterSpacing: 2, opacity: e(26) }}>
        NÃO ESPERE O SUSTO.
      </div>
    </AbsoluteFill>
  );
};

/* Grão de filme + vinheta: dá acabamento e disfarça a suavidade das fotos */
const Acabamento = () => {
  const frame = useCurrentFrame();
  const ox = (frame * 37) % 200;
  const oy = (frame * 53) % 200;
  const ruido =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
  return (
    <>
      <AbsoluteFill style={{ backgroundImage: ruido, backgroundPosition: `${ox}px ${oy}px`, opacity: 0.07, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.45) 100%)" }} />
    </>
  );
};

/* =====================================================================
   COMPOSIÇÃO
   ===================================================================== */
export const TragediaSilenciosa: React.FC<Props> = ({ variante, comNarracao }) => {
  // Cada cena começa TRANSICAO frames antes para fundir com a anterior
  const cena = (de: number, ate: number, filho: React.ReactNode, opts: { entrada?: boolean; saida?: boolean } = {}) => {
    const from = Math.max(0, s(de) - (opts.entrada === false ? 0 : TRANSICAO));
    return (
      <Sequence from={from} durationInFrames={s(ate) - from}>
        <Fusao entrada={opts.entrada !== false && de > 0} saida={opts.saida !== false}>
          {filho}
        </Fusao>
      </Sequence>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      {cena(0, 6, <Cena1 />)}
      {cena(6, 12, <Cena2 />, { saida: false })}
      {cena(12, 18, <Cena3 />, { entrada: false })}
      {cena(18, 26, <Cena4 />)}
      {cena(26, 34, <Cena5 />)}
      {cena(34, 40, <Cena6 />)}
      {cena(40, 46, <Cena7 variante={variante} />, { saida: false })}

      <Legendas />
      <Acabamento />

      {/* Trilha e efeitos sonoros */}
      <Audio src={staticFile("sfx/drone.wav")} volume={comNarracao ? 0.18 : 0.35} />
      <Sequence from={s(6) - 10}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} /></Sequence>
      <Sequence from={s(12)}><Audio src={staticFile("sfx/impacto.wav")} volume={0.9} /></Sequence>
      <Sequence from={s(18)} durationInFrames={s(8)}><Audio src={staticFile("sfx/bipe.wav")} volume={0.35} /></Sequence>
      <Sequence from={s(26) - 10}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} /></Sequence>
      <Sequence from={s(34) + 6}><Audio src={staticFile("sfx/logo.wav")} volume={0.7} /></Sequence>
      <Sequence from={s(40) + 16}><Audio src={staticFile("sfx/notificacao.wav")} volume={0.7} /></Sequence>

      {/* Narração opcional: salve em public/narracao.mp3 e renderize com comNarracao=true */}
      {comNarracao && <Audio src={staticFile("narracao.mp3")} volume={1} />}
    </AbsoluteFill>
  );
};
