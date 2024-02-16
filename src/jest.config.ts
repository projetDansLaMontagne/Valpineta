import type { Config } from "jest";

const config: Config = {
  preset: "jest-expo",
  verbose: true,
  displayName: "Tests Valpineta",
  notify: true,
  notifyMode: "always",
  setupFiles: ["<rootDir>/test/setup.ts"],
};

export default config;