import lugarGlb from "@/assets/models/immersive/lugar.glb";

export type RoomImmersiveExperience = {
  ctaLabel: string;
  description: string;
  id: string;
  modelAsset: number;
  modelLabel: string;
  promptTitle: string;
  roomId: string;
  title: string;
};

const immersiveRoomExperiences: Record<string, RoomImmersiveExperience> = {
  SALA_1: {
    id: "immersive-sala-1",
    roomId: "SALA_1",
    title: "Sala inmersiva Sipan",
    promptTitle: "Modo inmersivo disponible",
    description:
      "Esta sala ofrece una reconstruccion 3D para recorrer el espacio desde dentro antes de continuar con la visita normal.",
    ctaLabel: "Entrar al modo inmersivo",
    modelAsset: lugarGlb,
    modelLabel: "lugar.glb",
  },
};

export function getRoomImmersiveExperience(roomId?: string) {
  if (!roomId) {
    return undefined;
  }

  return immersiveRoomExperiences[roomId];
}
