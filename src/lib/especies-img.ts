import salvia from "@/assets/especies/salvia-bogotana.jpg";
import peperomia from "@/assets/especies/peperomia.jpg";
import palma from "@/assets/especies/palma-de-cera.jpg";
import frailejon from "@/assets/especies/frailejon.jpg";
import mortino from "@/assets/especies/mortino.jpg";
import sieteCueros from "@/assets/especies/siete-cueros.jpg";
import orquidea from "@/assets/especies/orquidea-cattleya.jpg";
import cucharo from "@/assets/especies/cucharo.jpg";

const map: Record<string, string> = {
  "salvia-bogotana": salvia,
  peperomia,
  "palma-de-cera": palma,
  frailejon,
  mortino,
  "siete-cueros": sieteCueros,
  "orquidea-cattleya": orquidea,
  cucharo,
};

export function especieImg(slug: string | null | undefined) {
  return (slug && map[slug]) || salvia;
}
