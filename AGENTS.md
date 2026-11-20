<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## WaraVita
- Signed-in screens live under src/routes/_authenticated (client-only gate); public pages are index, nosotros, auth. Why: session lives in browser storage.
- Purchases, Premium activation and AI-analysis counting run in security-definer DB functions (confirmar_pedido, activar_premium, consumir_analisis); profiles only allow users to edit their name. Why: users must not grant themselves plans or extra analyses.
- AI diagnosis runs only in src/lib/diagnostico.functions.ts (server) calling src/lib/ai.server.ts. Why: keep the AI key server-side.
