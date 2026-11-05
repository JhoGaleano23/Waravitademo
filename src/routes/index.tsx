import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Landing } from "@/components/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WaraVita — Cuida la flora nativa colombiana con IA" },
      { name: "description", content: "Identifica, diagnostica y colecciona plantas nativas colombianas con inteligencia artificial." },
      { property: "og:title", content: "WaraVita — Cuida la flora nativa colombiana con IA" },
      { property: "og:description", content: "Identifica, diagnostica y colecciona plantas nativas colombianas con inteligencia artificial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/inicio", replace: true });
      setSignedIn(!!data.session);
    });
  }, [navigate]);
  return <Landing signedIn={signedIn} />;
}
