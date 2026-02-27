import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

export default defineConfig({
    plugins: [pluginReact()],
    tools: {
        rspack: {
            resolve: {
                alias: {
                    '@': './src',
                },
            },
            plugins: [
                tanstackRouter({
                    target: 'react',
                    autoCodeSplitting: true,
                }),
            ],
        },
    },
});
