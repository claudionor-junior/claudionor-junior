import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export const FPS = 30;
const s = (seg: number) => Math.round(seg * FPS);

// Linha do tempo (em segundos), seguindo o roteiro "Tragédia Silenciosa"
const CENAS = {
  c1: [0, 6],
  c2: [6, 12],
  c3: [12, 18],
  c4: [18, 26],
  c5: [26, 34],
  c6: [34, 40],
  c7: [40, 46],
} as const;
export const DURACAO_TOTAL = s(46);

const COR = {
  fundo: "#060D0A",
  verde: "#8DDB2C",
  azul: "#1F5A8C",
  amarelo: "#FFD400",
  vermelho: "#FF3B30",
  branco: "#FFFFFF",
};

type Props = { variante: "reels" | "ads"; comNarracao: boolean };

/* ---------- Legendas estilo "Hormozi": palavra por palavra ---------- */
type Frase = { texto: string; destaque?: Record<string, string>; de: number; ate: number };

const Legenda: React.FC<{ frases: Frase[]; topo?: number }> = ({ frases, topo = 1180 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const atual = frases.find((f) => frame >= s(f.de) && frame < s(f.ate));
  if (!atual) return null;
  const inicio = s(atual.de);
  const palavras = atual.texto.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        top: topo,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px 34px",
        textAlign: "center",
      }}
    >
      {palavras.map((p, i) => {
        const f = frame - inicio - i * 4;
        const pop = spring({ frame: f, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
        const cor = atual.destaque?.[p.replace(/[.,?!:]/g, "")] ?? COR.branco;
        const destacada = cor !== COR.branco;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: "'Inter Display', Inter, sans-serif",
              fontWeight: 900,
              fontSize: destacada ? 124 : 104,
              lineHeight: 1.05,
              color: cor,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              opacity: f < 0 ? 0 : 1,
              transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])}) rotate(${destacada ? -2 : 0}deg)`,
              textShadow: "0 8px 0 rgba(0,0,0,.85), 0 0 40px rgba(0,0,0,.9)",
              WebkitTextStroke: "3px rgba(0,0,0,.9)",
              paintOrder: "stroke fill",
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Cena com foto: fundo desfocado + cartão com Ken Burns ---------- */
const CenaFoto: React.FC<{
  src: string;
  zoomDe?: number;
  zoomAte?: number;
  brilhoDe?: number;
  brilhoAte?: number;
  aspecto?: number;
  tremor?: boolean;
  vinheta?: string;
  children?: React.ReactNode;
}> = ({ src, zoomDe = 1.05, zoomAte = 1.2, brilhoDe = 1, brilhoAte = 1, aspecto = 1.25, tremor, vinheta, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(p, [0, 1], [zoomDe, zoomAte]);
  const brilho = interpolate(p, [0, 1], [brilhoDe, brilhoAte]);
  const shake = tremor ? Math.sin(frame * 2.3) * interpolate(frame, [0, 14], [22, 0], { extrapolateRight: "clamp" }) : 0;
  const largura = 980;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: -120,
          width: "calc(100% + 240px)",
          height: "calc(100% + 240px)",
          objectFit: "cover",
          filter: `blur(40px) brightness(${0.35 * brilho}) saturate(1.2)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 210,
          left: (1080 - largura) / 2,
          width: largura,
          height: largura / aspecto,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(0,0,0,.7)",
          border: "4px solid rgba(255,255,255,.12)",
          transform: `translateX(${shake}px)`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom})`,
            filter: `brightness(${brilho}) contrast(1.05)`,
          }}
        />
        {vinheta && (
          <div style={{ position: "absolute", inset: 0, background: vinheta }} />
        )}
      </div>
      {children}
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ largura: number; style?: React.CSSProperties }> = ({ largura, style }) => (
  <Img
    src={staticFile("img/logo.png")}
    style={{ width: largura, filter: "drop-shadow(0 18px 40px rgba(0,0,0,.6))", ...style }}
  />
);

const FadeEntrada: React.FC<{ children: React.ReactNode; duracao?: number }> = ({ children, duracao = 10 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = interpolate(frame, [0, duracao, durationInFrames - 6, durationInFrames], [0, 1, 1, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

/* ---------- Cena 1: escorpião surge do escuro ---------- */
const Cena1: React.FC = () => {
  const frame = useCurrentFrame();
  const surgir = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity: surgir }}>
      <CenaFoto
        src="img/escorpiao1.png"
        zoomDe={1.25}
        zoomAte={1.05}
        brilhoDe={0.4}
        brilhoAte={1}
        vinheta="radial-gradient(circle at 50% 55%, transparent 35%, rgba(0,0,0,.75) 100%)"
      >
        <Legenda
          frases={[
            { texto: "Dedetização:", destaque: { "Dedetização": COR.amarelo }, de: 0.4, ate: 2.4 },
            { texto: "Ninguém gosta de gastar.", destaque: { gastar: COR.vermelho }, de: 2.4, ate: 6 },
          ]}
        />
      </CenaFoto>
    </AbsoluteFill>
  );
};

/* ---------- Cena 2: paz e cuidado ---------- */
const Cena2: React.FC = () => (
  <FadeEntrada>
    <CenaFoto src="img/bebe.png" zoomDe={1.02} zoomAte={1.18} brilhoDe={1.05} brilhoAte={1.1} aspecto={1.3}>
      <Legenda
        frases={[
          { texto: "Todo mundo prefere...", de: 0.2, ate: 2.6 },
          { texto: "Lazer ou viagem.", destaque: { Lazer: COR.verde, viagem: COR.verde }, de: 2.6, ate: 6 },
        ]}
      />
    </CenaFoto>
  </FadeEntrada>
);

/* ---------- Cena 3: corte brusco, ameaça escondida ---------- */
const Cena3: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 3, 12], [1, 0.9, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <CenaFoto
        src="img/escorpiao2.png"
        zoomDe={1.35}
        zoomAte={1.1}
        brilhoDe={0.9}
        brilhoAte={0.75}
        tremor
        vinheta="radial-gradient(circle at 50% 50%, transparent 30%, rgba(120,0,0,.55) 100%)"
      >
        <Legenda
          frases={[
            { texto: "Até o dia em que...", de: 0.2, ate: 2.4 },
            { texto: "O pior acontece.", destaque: { pior: COR.vermelho }, de: 2.4, ate: 6 },
          ]}
        />
      </CenaFoto>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ---------- Cena 4: monitor cardíaco (sem imagem chocante) ---------- */
const ecgPath = (largura: number, meio: number) => {
  // Um batimento a cada 180px
  let d = `M 0 ${meio}`;
  for (let x = 0; x < largura; x += 180) {
    d += ` L ${x + 60} ${meio} L ${x + 72} ${meio - 18} L ${x + 84} ${meio} L ${x + 96} ${meio}`;
    d += ` L ${x + 104} ${meio + 30} L ${x + 116} ${meio - 150} L ${x + 128} ${meio + 60} L ${x + 138} ${meio}`;
    d += ` L ${x + 152} ${meio - 24} L ${x + 166} ${meio} L ${x + 180} ${meio}`;
  }
  return d;
};

const Cena4: React.FC = () => {
  const frame = useCurrentFrame();
  const larguraLinha = 980;
  const progresso = (frame % 60) / 60; // varredura a cada 2s
  const pisca = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.35;
  return (
    <FadeEntrada duracao={6}>
      <AbsoluteFill style={{ backgroundColor: "#020806" }}>
        <div
          style={{
            position: "absolute",
            top: 210,
            left: 50,
            width: larguraLinha,
            height: 784,
            borderRadius: 40,
            background:
              "linear-gradient(rgba(141,219,44,.06) 1px, transparent 1px) 0 0/ 49px 49px, linear-gradient(90deg, rgba(141,219,44,.06) 1px, transparent 1px) 0 0/ 49px 49px, #03140C",
            border: "4px solid rgba(141,219,44,.25)",
            overflow: "hidden",
            boxShadow: "0 0 120px rgba(141,219,44,.12) inset",
            filter: "blur(.4px)",
          }}
        >
          <div style={{ position: "absolute", top: 36, left: 44, display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: COR.vermelho, opacity: pisca, boxShadow: `0 0 30px ${COR.vermelho}` }} />
            <span style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 40, color: COR.vermelho, letterSpacing: 4, opacity: pisca }}>
              EMERGÊNCIA
            </span>
          </div>
          <div style={{ position: "absolute", top: 30, right: 44, fontFamily: "JetBrains Mono, monospace", color: COR.verde, textAlign: "right" }}>
            <div style={{ fontSize: 30, opacity: 0.7 }}>BPM</div>
            <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1 }}>{142 + Math.round(Math.sin(frame / 9) * 6)}</div>
          </div>
          <svg width={larguraLinha} height={784} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset={Math.max(0, progresso - 0.35)} stopColor={COR.verde} stopOpacity={0} />
                <stop offset={progresso} stopColor={COR.verde} stopOpacity={1} />
                <stop offset={Math.min(1, progresso + 0.001)} stopColor={COR.verde} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={ecgPath(larguraLinha, 470)} stroke="url(#g)" strokeWidth={7} fill="none" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${COR.verde})` }} />
          </svg>
        </div>
        <Legenda
          frases={[
            { texto: "Quanto custa a emergência?", destaque: { emergência: COR.vermelho }, de: 0.2, ate: 4.4 },
            { texto: "E o antídoto?", destaque: { antídoto: COR.amarelo }, de: 4.4, ate: 8 },
          ]}
        />
      </AbsoluteFill>
    </FadeEntrada>
  );
};

/* ---------- Cena 5: família segura + escudo Senar ---------- */
const Cena5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escudo = spring({ frame: frame - 30, fps, config: { damping: 14 } });
  return (
    <FadeEntrada duracao={18}>
      <CenaFoto src="img/familia.png" zoomDe={1.15} zoomAte={1.02} brilhoDe={0.85} brilhoAte={1.1} aspecto={1.25}>
        <div style={{ position: "absolute", top: 720, right: 70, transform: `scale(${escudo})`, opacity: escudo }}>
          <Logo largura={250} />
        </div>
        <Legenda
          topo={1200}
          frases={[
            { texto: "Ver seu filho pequeno", destaque: { filho: COR.amarelo }, de: 0.2, ate: 2.8 },
            { texto: "ou pai idoso...", destaque: { pai: COR.amarelo }, de: 2.8, ate: 5.2 },
            { texto: "na UTI.", destaque: { UTI: COR.vermelho }, de: 5.2, ate: 8 },
          ]}
        />
      </CenaFoto>
    </FadeEntrada>
  );
};

/* ---------- Cena 6: casa protegida + logo grande ---------- */
const Cena6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 140 } });
  const brilho = interpolate(frame, [0, 40], [0.5, 1.15], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Img
        src={staticFile("img/familia.png")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${brilho * 0.5}) blur(16px)`, transform: `scale(${1.1 + frame / 2000})` }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, rgba(141,219,44,.25), transparent 60%)" }} />
      <div style={{ position: "absolute", top: 230, width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.3, 1])})`, opacity: pop }}>
          <Logo largura={640} style={{ filter: "drop-shadow(0 0 60px rgba(141,219,44,.55)) drop-shadow(0 30px 60px rgba(0,0,0,.7))" }} />
        </div>
      </div>
      <Legenda
        topo={1220}
        frases={[
          { texto: "É um seguro de vida", destaque: { seguro: COR.verde, vida: COR.verde }, de: 0.5, ate: 3.2 },
          { texto: "para sua família.", destaque: { família: COR.verde }, de: 3.2, ate: 6 },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ---------- Cena 7: chamada para ação ---------- */
const Cena7: React.FC<{ variante: Props["variante"] }> = ({ variante }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 14 } });
  const pulso = 1 + Math.sin(frame / 5) * 0.035;
  const seta = Math.sin(frame / 4) * 18;
  const titulo = variante === "reels" ? ["CLICA NO", "LINK DA BIO"] : ["TOQUE EM", "ENVIAR MENSAGEM"];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #0F2A1C, #030806 70%)", alignItems: "center" }}>
      <div style={{ marginTop: 200, opacity: entrada, transform: `translateY(${(1 - entrada) * 60}px)` }}>
        <Logo largura={380} />
      </div>
      <div style={{ marginTop: 60, textAlign: "center", transform: `scale(${pulso})` }}>
        {titulo.map((l, i) => (
          <div
            key={l}
            style={{
              fontFamily: "'Inter Display', Inter",
              fontWeight: 900,
              fontSize: variante === "ads" && i === 1 ? 104 : 128,
              lineHeight: 1.02,
              color: i === 1 ? COR.verde : COR.branco,
              letterSpacing: "-0.02em",
              textShadow: "0 8px 0 rgba(0,0,0,.8)",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 56,
          display: "flex",
          alignItems: "center",
          gap: 22,
          background: "#25D366",
          color: "#fff",
          borderRadius: 999,
          padding: "26px 52px",
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: variante === "reels" ? 64 : 50,
          boxShadow: "0 20px 60px rgba(37,211,102,.45)",
          transform: `scale(${spring({ frame: frame - 12, fps, config: { damping: 12 } })})`,
        }}
      >
        <svg width="66" height="66" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z" />
        </svg>
        <span>{variante === "reels" ? "(81) 99301-8101" : "Fale com a Senar"}</span>
      </div>
      <div style={{ marginTop: 50, fontFamily: "Inter", fontWeight: 800, fontSize: 52, color: COR.amarelo, letterSpacing: 1 }}>
        NÃO ESPERE O SUSTO.
      </div>
      {variante === "ads" && (
        <div style={{ marginTop: 20, fontSize: 110, transform: `translateY(${seta}px)` }}>👇</div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- Composição principal ---------- */
export const TragediaSilenciosa: React.FC<Props> = ({ variante, comNarracao }) => {
  const seq = (c: readonly [number, number]) => ({ from: s(c[0]), durationInFrames: s(c[1] - c[0]) });
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Sequence {...seq(CENAS.c1)}><Cena1 /></Sequence>
      <Sequence {...seq(CENAS.c2)}><Cena2 /></Sequence>
      <Sequence {...seq(CENAS.c3)}><Cena3 /></Sequence>
      <Sequence {...seq(CENAS.c4)}><Cena4 /></Sequence>
      <Sequence {...seq(CENAS.c5)}><Cena5 /></Sequence>
      <Sequence {...seq(CENAS.c6)}><Cena6 /></Sequence>
      <Sequence {...seq(CENAS.c7)}><Cena7 variante={variante} /></Sequence>

      {/* Trilha e efeitos */}
      <Audio src={staticFile("sfx/drone.wav")} volume={comNarracao ? 0.18 : 0.35} />
      <Sequence from={s(6) - 8}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} /></Sequence>
      <Sequence from={s(12)}><Audio src={staticFile("sfx/impacto.wav")} volume={0.9} /></Sequence>
      <Sequence from={s(18)} durationInFrames={s(8)}><Audio src={staticFile("sfx/bipe.wav")} volume={0.35} /></Sequence>
      <Sequence from={s(26) - 8}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} /></Sequence>
      <Sequence from={s(34) + 8}><Audio src={staticFile("sfx/logo.wav")} volume={0.7} /></Sequence>
      <Sequence from={s(40) + 12}><Audio src={staticFile("sfx/notificacao.wav")} volume={0.7} /></Sequence>
      <Sequence from={s(43)}><Audio src={staticFile("sfx/notificacao.wav")} volume={0.5} /></Sequence>

      {/* Narração opcional: grave e salve em public/narracao.mp3 e renderize com --props='{"comNarracao":true}' */}
      {comNarracao && <Audio src={staticFile("narracao.mp3")} volume={1} />}
    </AbsoluteFill>
  );
};
