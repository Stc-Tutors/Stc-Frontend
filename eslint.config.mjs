import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships true flat-config arrays, not the legacy
// eslintrc shape - going through FlatCompat.extends("next/core-web-vitals")
// (the old boilerplate) re-parses an already-flat plugin object as an
// eslintrc-style shareable config and crashes validating it. Import the
// flat configs directly instead.
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // public/ holds static files served as-is, including a vendored, minified third-party bundle (the LiveKit client used by the
    // recorder page) that produced ~1,300 findings in code we do not own or edit.
    ignores: ["public/**", "next.config.ts"],
  },
];

export default eslintConfig;
