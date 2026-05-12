// Importar todas las imágenes explícitamente para que el bundler las incluya
import Sala01_01 from "@/assets/images/artworks/sala-01/01-senor-de-sipan.jpg";
import Sala01_02 from "@/assets/images/artworks/sala-01/02-tumba-principal-de-sipan.png";
import Sala01_03 from "@/assets/images/artworks/sala-01/03-conjunto-de-joyas-de-elite.png";
import Sala01_04 from "@/assets/images/artworks/sala-01/04-arete-ceremonial-de-oro.png";
import Sala01_05 from "@/assets/images/artworks/sala-01/05-pendiente-de-prestigio.webp";
import Sala01_06 from "@/assets/images/artworks/sala-01/06-textil-funerario.jpg";
import Sala01_07 from "@/assets/images/artworks/sala-01/07-baston-de-mando.jpg";
import Sala01_08 from "@/assets/images/artworks/sala-01/08-escena-de-caza-ritual.webp";
import Sala01_09 from "@/assets/images/artworks/sala-01/09-ceremonia-y-corte-moche.webp";
import Sala01_10 from "@/assets/images/artworks/sala-01/10-ofrenda-metalica-funeraria.jpg";
import Sala01_11 from "@/assets/images/artworks/sala-01/11-ajuar-de-tumbas-reales.jpg";
import Sala01_12 from "@/assets/images/artworks/sala-01/12-vasija-de-autoridad-moche.jpg";
import Sala02_01 from "@/assets/images/artworks/sala-02/01-collar-ceremonial.jpg";
import Sala02_02 from "@/assets/images/artworks/sala-02/02-corona-de-prestigio.webp";
import Sala02_03 from "@/assets/images/artworks/sala-02/03-cuchillo-ceremonial.jpg";
import Sala02_04 from "@/assets/images/artworks/sala-02/04-figura-mitica-de-naylamp.jpg";
import Sala02_05 from "@/assets/images/artworks/sala-02/05-pectoral-de-metal-repujado.jpg";
import Sala02_06 from "@/assets/images/artworks/sala-02/06-tocado-de-elite.jpg";
import Sala02_07 from "@/assets/images/artworks/sala-02/07-vaso-ceremonial.jpg";
import Sala02_08 from "@/assets/images/artworks/sala-02/08-representacion-de-guerrero.jpg";
import Sala02_09 from "@/assets/images/artworks/sala-02/09-escena-de-procesion-ritual.jpg";
import Sala02_10 from "@/assets/images/artworks/sala-02/10-ornamento-de-cierre-y-prestigio.jpg";

const artworkImageMap: Record<string, string> = {
  "artworks/sala-01/01-senor-de-sipan.jpg": Sala01_01,
  "artworks/sala-01/02-tumba-principal-de-sipan.png": Sala01_02,
  "artworks/sala-01/03-conjunto-de-joyas-de-elite.png": Sala01_03,
  "artworks/sala-01/04-arete-ceremonial-de-oro.png": Sala01_04,
  "artworks/sala-01/05-pendiente-de-prestigio.webp": Sala01_05,
  "artworks/sala-01/06-textil-funerario.jpg": Sala01_06,
  "artworks/sala-01/07-baston-de-mando.jpg": Sala01_07,
  "artworks/sala-01/08-escena-de-caza-ritual.webp": Sala01_08,
  "artworks/sala-01/09-ceremonia-y-corte-moche.webp": Sala01_09,
  "artworks/sala-01/10-ofrenda-metalica-funeraria.jpg": Sala01_10,
  "artworks/sala-01/11-ajuar-de-tumbas-reales.jpg": Sala01_11,
  "artworks/sala-01/12-vasija-de-autoridad-moche.jpg": Sala01_12,
  "artworks/sala-02/01-collar-ceremonial.jpg": Sala02_01,
  "artworks/sala-02/02-corona-de-prestigio.webp": Sala02_02,
  "artworks/sala-02/03-cuchillo-ceremonial.jpg": Sala02_03,
  "artworks/sala-02/04-figura-mitica-de-naylamp.jpg": Sala02_04,
  "artworks/sala-02/05-pectoral-de-metal-repujado.jpg": Sala02_05,
  "artworks/sala-02/06-tocado-de-elite.jpg": Sala02_06,
  "artworks/sala-02/07-vaso-ceremonial.jpg": Sala02_07,
  "artworks/sala-02/08-representacion-de-guerrero.jpg": Sala02_08,
  "artworks/sala-02/09-escena-de-procesion-ritual.jpg": Sala02_09,
  "artworks/sala-02/10-ornamento-de-cierre-y-prestigio.jpg": Sala02_10,
};

export function getArtworkImageSource(imagePath?: string | null) {
  if (!imagePath) {
    return null;
  }

  return artworkImageMap[imagePath] ?? null;
}
