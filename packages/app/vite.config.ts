import { defineConfig } from "vite"
import desktopPlugin from "./vite"

export default defineConfig(({ command, mode }) => {
  const isLibMode = mode === "lib"

  return {
    plugins: [desktopPlugin] as any,
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      port: 3000,
    },
    build: {
      target: "esnext",
      // sourcemap: true,
      // 库模式配置
      ...(isLibMode
        ? {
            lib: {
              entry: "./src/index.ts",
              name: "OpenCodeApp",
              formats: ["es", "umd"],
              fileName: (format) => `opencode-app.${format}.js`,
            },
            rollupOptions: {
              // 不外部化任何依赖，全部打包
              external: [],
              output: {
                globals: {},
                // 确保样式也被打包
                assetFileNames: "opencode-app.[ext]",
              },
            },
            cssCodeSplit: false,
          }
        : {}),
    },
    // 确保库模式下也能正确处理 SolidJS JSX
    esbuild: isLibMode
      ? {
          jsxFactory: "h",
          jsxFragment: "Fragment",
          jsxInject: `import { h, Fragment } from 'solid-js/h'`,
        }
      : undefined,
  }
})
