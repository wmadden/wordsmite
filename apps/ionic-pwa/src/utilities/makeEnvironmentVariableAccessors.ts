import requireEnvVar from "./requireEnvVar";

const allEnvironments = "*";
type AllEnvironments = typeof allEnvironments;

export type EnvironmentVariableAccessors = {
  getEnvVar(
    name: string,
    options: { requiredIn: string[] },
  ): string | undefined;
  getEnvVar(name: string, options: { requiredIn: AllEnvironments }): string;
  getEnvVar(
    name: string,
    options: { requiredIn: string[] | AllEnvironments },
  ): string | undefined;
  getEnvVar(
    name: string,
    options?: { requiredIn: string[] | AllEnvironments },
  ): string | undefined;

  getEnvVarBoolean(
    name: string,
    options?: { requiredIn: string[] | AllEnvironments },
  ): boolean;

  requireEnvVar(name: string): string;
};

function makeEnvironmentVariableAccessors({
  environmentNameVariable,
}: {
  environmentNameVariable: string;
}): EnvironmentVariableAccessors {
  function getEnvVar(
    name: string,
    options: { requiredIn: string[] },
  ): string | undefined;
  function getEnvVar(
    name: string,
    options: { requiredIn: AllEnvironments },
  ): string;
  function getEnvVar(
    name: string,
    options: { requiredIn: string[] | AllEnvironments },
  ): string | undefined;
  function getEnvVar(
    name: string,
    options: { requiredIn: string[] | AllEnvironments } = { requiredIn: [] },
  ): string | undefined {
    const { requiredIn } = options;
    const value = process.env[name];

    if (value !== undefined && value !== "") return value;

    const environmentName = process.env[environmentNameVariable];
    if (!environmentName)
      throw new Error(
        `Missing environment variable ${environmentNameVariable}`,
      );

    const requiredInThisEnvironment =
      requiredIn === allEnvironments || requiredIn.includes(environmentName);

    if (requiredInThisEnvironment) {
      throw new Error(
        `Missing environment variable '${name}' required in environment ${environmentName}`,
      );
    }

    return undefined;
  }

  function getEnvVarBoolean(
    name: string,
    options: { requiredIn: string[] | AllEnvironments } = { requiredIn: [] },
  ): boolean {
    const value = getEnvVar(name, options);
    if (![undefined, "", "true", "false"].includes(value))
      throw new Error(
        `Env var ${name} must be "true" or "false" but was ${JSON.stringify(
          value,
        )}`,
      );

    return value === "true";
  }

  return {
    getEnvVar,
    getEnvVarBoolean,
    requireEnvVar,
  };
}

export default makeEnvironmentVariableAccessors;
