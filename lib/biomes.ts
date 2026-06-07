export type BiomeKey = "storm" | "summit" | "ocean" | "river" | "forest";

export interface Biome {
  moodId: string;
  name: string;
  gradient: string;
  ambient: {
    file: string;
    label: string;
  };
  animation: {
    key: BiomeKey;
    primaryRgba: string;    // primary particle color
    secondaryRgba: string;  // secondary glow color
  };
  accent: string;           // hex accent
  accentRgb: string;        // "r, g, b" for rgba() composition
  script: string;
}

export const BIOMES: Record<string, Biome> = {
  Rattled: {
    moodId: "Rattled",
    name: "Storm Plains",
    gradient:
      "linear-gradient(to bottom, #130a20 0%, #0c0615 55%, #060310 100%)",
    ambient: {
      file: "/sounds/storm.mp3",
      label: "Rolling Thunder",
    },
    animation: {
      key: "storm",
      primaryRgba: "rgba(124, 58, 237, 0.22)",
      secondaryRgba: "rgba(167, 139, 250, 0.5)",
    },
    accent: "#8B5CF6",
    accentRgb: "139, 92, 246",
    script:
      "Storms move fast and forget nothing they've touched. This one will too. Watch it without becoming it — the lightning is energy passing through, not settling in you. Markets have sessions like this: pressurized, reactive, clearing. Your work right now is not to trade the weather. It is to stay dry long enough to see the sky open again.",
  },

  Charged: {
    moodId: "Charged",
    name: "Mountain Summit",
    gradient:
      "linear-gradient(to bottom, #061625 0%, #04101c 55%, #020b14 100%)",
    ambient: {
      file: "/sounds/mountain.mp3",
      label: "Alpine Wind",
    },
    animation: {
      key: "summit",
      primaryRgba: "rgba(56, 189, 248, 0.2)",
      secondaryRgba: "rgba(148, 220, 255, 0.85)",
    },
    accent: "#38BDF8",
    accentRgb: "56, 189, 248",
    script:
      "At altitude, the air is thin and the mind sharpens differently. What looked complex from the valley resolves into terrain up here — ridgelines, paths, clear sight lines. Breathe slowly. The energy you're carrying is real; let this height direct it. Your edge lives in this view, not in the speed of the descent.",
  },

  Heavy: {
    moodId: "Heavy",
    name: "Deep Ocean",
    gradient:
      "linear-gradient(to bottom, #030f1e 0%, #020b16 55%, #01070e 100%)",
    ambient: {
      file: "/sounds/ocean.mp3",
      label: "Deep Current",
    },
    animation: {
      key: "ocean",
      primaryRgba: "rgba(6, 182, 212, 0.18)",
      secondaryRgba: "rgba(6, 182, 212, 0.9)",
    },
    accent: "#06B6D4",
    accentRgb: "6, 182, 212",
    script:
      "Depth has its own physics. Pressure doesn't crush — it holds shape. The heaviness you brought here is not a flaw. It is information. The ocean receives it without judgment. Breathe at this tempo: slow, vast, anchored. What feels immovable at the surface often drifts here, rearranges, rises lighter than it fell.",
  },

  Numb: {
    moodId: "Numb",
    name: "Thawing River",
    gradient:
      "linear-gradient(to bottom, #071414 0%, #050e0e 55%, #030808 100%)",
    ambient: {
      file: "/sounds/river.mp3",
      label: "Ice Melt",
    },
    animation: {
      key: "river",
      primaryRgba: "rgba(103, 232, 249, 0.2)",
      secondaryRgba: "rgba(186, 230, 253, 0.9)",
    },
    accent: "#67E8F9",
    accentRgb: "103, 232, 249",
    script:
      "The river remembers how to move. Even frozen, the current holds its direction under the ice — muted, present, patient. Numbness is the system conserving itself after too much signal. It is not damage. Notice the edges: soft light, the faint sound of cracking. The thaw does not announce itself. It simply begins.",
  },

  Clear: {
    moodId: "Clear",
    name: "Golden Forest",
    gradient:
      "linear-gradient(to bottom, #14100a 0%, #0e0c06 55%, #080704 100%)",
    ambient: {
      file: "/sounds/forest.mp3",
      label: "Forest Morning",
    },
    animation: {
      key: "forest",
      primaryRgba: "rgba(245, 158, 11, 0.2)",
      secondaryRgba: "rgba(253, 230, 138, 0.85)",
    },
    accent: "#F59E0B",
    accentRgb: "245, 158, 11",
    script:
      "This light finds you because the conditions aligned — your preparation, your patience, the moment. Walk without urgency. The forest rewards those who follow the path they laid, not those who chase the breaks in the canopy. Breathe here. Notice the quality of the stillness. This is the state you return to. Remember what it feels like.",
  },
};

export const BIOME_ORDER: string[] = ["Clear", "Charged", "Heavy", "Numb", "Rattled"];

export function getBiome(moodId: string): Biome {
  return BIOMES[moodId] ?? BIOMES.Clear;
}
