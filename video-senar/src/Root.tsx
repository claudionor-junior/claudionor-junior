import { Composition } from "remotion";
import { TragediaSilenciosa, DURACAO_TOTAL, FPS } from "./TragediaSilenciosa";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Versão para Reels orgânico: CTA "link da bio" + WhatsApp */}
    <Composition
      id="SenarReels"
      component={TragediaSilenciosa}
      durationInFrames={DURACAO_TOTAL}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ variante: "reels" as const, comNarracao: false }}
    />
    {/* Versão para anúncio (Meta Ads): CTA para o botão "Enviar mensagem" */}
    <Composition
      id="SenarAds"
      component={TragediaSilenciosa}
      durationInFrames={DURACAO_TOTAL}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ variante: "ads" as const, comNarracao: false }}
    />
  </>
);
