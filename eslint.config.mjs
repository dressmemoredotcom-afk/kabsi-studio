import { config } from "@remotion/eslint-config-flat";

export default [...config, { ignores: ["node_modules/**", ".build-bundle/**", "out/**"] }];
