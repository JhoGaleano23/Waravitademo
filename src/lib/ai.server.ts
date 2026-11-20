import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";

export const diagnosticoSchema = z.object({
  identificada: z.boolean(),
  especie: z.string(),
  nombre_cientifico: z.string(),
  confianza: z.number(),
  alternativas: z.array(z.object({ especie: z.string(), confianza: z.number() })),
  vigor: z.number(),
  estado: z.string(),
  patogenos: z.string(),
  coloracion: z.string(),
  humedad: z.string(),
  explicacion: z.string(),
  recomendacion: z.string(),
});
export type Diagnostico = z.infer<typeof diagnosticoSchema>;

export async function analizarPlanta(imageDataUrl: string, descripcion: string, contexto: string) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("Falta configurar la IA.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions:
      "Eres un fitopatólogo experto en flora nativa colombiana. Analiza la foto de la planta y responde en español de Colombia, con lenguaje sencillo para personas sin conocimientos técnicos. " +
      "vigor: 0-100 (Índice de Vigor Fitosanitario). estado: una palabra (Óptimo, Bueno, Regular, Crítico). patogenos ej. 'Negativo (Sin plagas)'. coloracion ej. 'Normal'. humedad ej. 'Seco superficial'. " +
      "confianza en 0-100. Da exactamente 2 alternativas. Si la imagen no muestra una planta o no puedes identificarla, identificada=false, especie='' y explica en 'explicacion' qué foto tomar. recomendacion: una acción concreta con plazo.",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `Planta registrada: ${contexto}. Descripción del usuario: ${descripcion || "(sin descripción)"}` },
          { type: "image", image: imageDataUrl },
        ],
      },
    ],
    output: Output.object({ schema: diagnosticoSchema }),
    providerOptions: {
      openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
    },
  });
  return (await result.output) as Diagnostico;
}
