import { config } from "@remotion/eslint-config-flat";

export default [...config, { ignores: ["node_modules/**", ".bundles/**", "kabsi/out/**", "roomy/out/**"] }];
