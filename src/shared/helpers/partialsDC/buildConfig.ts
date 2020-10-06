import { BildSchema } from "../dockerComposeWriter";

export function buildConfig(name: string, withTarget?: boolean): BildSchema {
  const base: BildSchema = {
    context: `./services/${name}`,
    dockerfile: "./docker/Dockerfile",
  };

  if (withTarget) {
    base.target = "${BUILD_TARGET}";
  }

  return base;
}
