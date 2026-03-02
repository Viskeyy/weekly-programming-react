import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

export default defineConfig({
    plugins: [pluginReact()],
    html: {
        title: 'Weekly Programming React',
        favicon: './public/favicon.svg',
        template: './src/index.html',
    },
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
            module: {
                rules: [
                    {
                        test: /\.md$/,
                        type: 'asset/source',
                    },
                ],
            },
        },
    },
});
