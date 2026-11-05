import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Landing } from "@/components/Landing";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Sobre WaraVita — Nuestro equipo" },
      { name: "description", content: "Por qué existe WaraVita y quiénes estamos detrás del proyecto." },
      { property: "og:title", content: "Sobre WaraVita — Nuestro equipo" },
      { property: "og:description", content: "Por qué existe WaraVita y quiénes estamos detrás del proyecto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Nosotros,
});

function Nosotros() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);
  return <Landing signedIn={signedIn} />;
}
