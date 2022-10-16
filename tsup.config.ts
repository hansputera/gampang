import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    clean: true,
    dts: true,
    outDir: 'dist',
    platform: 'node',
    target: ['node14', 'node16'],
    minify: true,
});