import { build } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  try {
    // Build client
    await build({
      configFile: resolve(__dirname, '../vite.config.ts'),
      build: {
        outDir: resolve(__dirname, '../dist/public'),
        emptyOutDir: true
      }
    })

    // Build server (if needed)
    // ...

    console.log('Build completed successfully')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

main()