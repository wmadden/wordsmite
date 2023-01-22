import { EmulatorsConfig, NullEmulatorsConfig } from "./EmulatorsConfig";
import makeEnvVarAccessors from "./makeEnvironmentVariableAccessors";

const { requireEnvVar, getEnvVar, getEnvVarBoolean } = makeEnvVarAccessors({
  environmentNameVariable: "VITE_ENVIRONMENT_NAME",
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function environment() {
  return {
    requireEnvVar,
    getEnvVar,
    firebaseConfig: () => ({
      apiKey: requireEnvVar("VITE_FIREBASE_API_KEY"),
      authDomain: requireEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
      projectId: requireEnvVar("VITE_FIREBASE_PROJECT_ID"),
      storageBucket: requireEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
      appId: requireEnvVar("VITE_FIREBASE_APP_ID"),
      cloudFunctionsRegion: requireEnvVar(
        "VITE_FIREBASE_CLOUD_FUNCTIONS_REGION",
      ),
    }),
    firebaseEmulatorConfig: (): EmulatorsConfig | NullEmulatorsConfig => {
      const enabledEmulators = {
        functions: getEnvVarBoolean("VITE_USE_FUNCTIONS_EMULATOR"),
        auth: getEnvVarBoolean("VITE_USE_AUTH_EMULATOR"),
        firestore: getEnvVarBoolean("VITE_USE_FIRESTORE_EMULATOR"),
      };

      const anyEmulatorsEnabled = Object.values(enabledEmulators).find(
        (enabled) => enabled,
      );

      if (!anyEmulatorsEnabled) return { enabled: false };

      return {
        enabled: true,
        emulators: enabledEmulators,
        emulatorHub: {
          host: requireEnvVar("VITE_FIREBASE_EMULATOR_HOST"),
          port: parseInt(requireEnvVar("VITE_FUNCTIONS_EMULATOR_PORT"), 10),
        },
      };
    },
    name: requireEnvVar("VITE_ENVIRONMENT_NAME"),
  };
}
