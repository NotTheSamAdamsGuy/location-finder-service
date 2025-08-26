// import { defineConfig } from 'vitest/config'

// export default defineConfig({
//   test: {
//     // ...
//   },
// })

import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Loads all env variables

  return {
    test: {
      env: env, // Assign loaded env variables to test environment
      coverage: {
        provider: "v8"
      }
    },
  };
});