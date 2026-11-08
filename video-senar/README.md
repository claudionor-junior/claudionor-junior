# Vídeo Senar Confort: "Tragédia Silenciosa" (Remotion)

Vídeo vertical 1080x1920, 46s, 30 fps.

| Arquivo | Uso |
|---|---|
| `out/senar-tragedia-silenciosa-reels.mp4` | Reels orgânico: termina com "Clica no link da bio" + WhatsApp |
| `out/senar-tragedia-silenciosa-anuncio.mp4` | Meta Ads: termina com "Toque em Enviar mensagem" (link da bio não é clicável em anúncio) |

## Comandos
```bash
npm install
npm run studio         # abre o editor visual no navegador
npm run render:reels
npm run render:ads
```

## Adicionar narração
1. Grave a narração seguindo os tempos abaixo e salve como `public/narracao.mp3`.
2. Renderize com: `npx remotion render SenarReels out/reels-narrado.mp4 --props='{"variante":"reels","comNarracao":true}'`
   (a trilha de fundo abaixa automaticamente).

| Tempo | Fala |
|---|---|
| 0–6s | "Ninguém gosta de gastar dinheiro com dedetização." |
| 6–12s | "Todo mundo prefere gastar com lazer, com uma viagem, com algo legal." |
| 12–18s | "Até o dia em que o pior acontece." |
| 18–26s | "Eu pergunto pra você: quanto custa o atendimento de emergência no hospital? O antídoto?" |
| 26–34s | "O desespero de ver seu filho pequeno ou seu pai idoso dando entrada numa UTI por causa da picada?" |
| 34–40s | "O investimento com a Senar é irrisório perto do seguro de vida que você está comprando pra sua família." |
| 40–46s | "Não espere o susto acontecer. Clica no link da bio e fala direto com a nossa equipe." (anúncio: "Toca em Enviar mensagem e fala com a nossa equipe.") |

## Estrutura
- `src/TragediaSilenciosa.tsx`: cenas, legendas palavra por palavra, efeitos e CTA
- `public/img/`: recortes do criativo original da Senar (escorpião, bebê, família, logo)
- `public/sfx/`: efeitos sonoros gerados por `scripts/gerar_sfx.py` (sem direitos autorais)
