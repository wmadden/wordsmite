export type EmulatorsConfig = {
  enabled: true;
  emulators: Record<"auth" | "firestore" | "functions", boolean>;
  emulatorHub: {
    host: string;
    port: number;
  };
};

export type NullEmulatorsConfig = {
  enabled: false;
};
