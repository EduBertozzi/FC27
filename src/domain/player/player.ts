import { type PositionCode } from "./positions";

export type PreferredFoot = "right" | "left" | "both";

export const FOOT_LABEL: Record<PreferredFoot, string> = {
  right: "Direito",
  left: "Esquerdo",
  both: "Ambidestro",
};

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  nationalityCode: string;
  birthDate: string; // ISO yyyy-mm-dd
  position: PositionCode;
  secondaryPositions?: PositionCode[];
  preferredFoot: PreferredFoot;
  heightCm: number;
  shirtNumber: number;
  overall: number;
  potential?: number;
  archetypeId: string;
  personality?: string;
}

export function displayName(player: Pick<Player, "firstName" | "lastName" | "nickname">): string {
  return player.nickname?.trim() || `${player.firstName} ${player.lastName}`;
}

export function fullName(player: Pick<Player, "firstName" | "lastName">): string {
  return `${player.firstName} ${player.lastName}`;
}

export function initials(player: Pick<Player, "firstName" | "lastName">): string {
  return `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
}

/** Idade completa em `onDate` (ISO). Ambas as datas são tratadas em UTC. */
export function ageAt(birthDate: string, onDate: string): number {
  const birth = new Date(`${birthDate.slice(0, 10)}T00:00:00Z`);
  const on = new Date(`${onDate.slice(0, 10)}T00:00:00Z`);
  let age = on.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < birth.getUTCMonth() ||
    (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}
