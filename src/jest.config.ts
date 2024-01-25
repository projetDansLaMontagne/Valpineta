import type { Config } from "jest";
import { defaults as tsjPreset } from "ts-jest/presets";

const config: Config = {
  preset: "jest-expo",
  verbose: true,
  displayName: "Tests Valpineta",
  notify: true,
  notifyMode: "always",
};

export default config;
