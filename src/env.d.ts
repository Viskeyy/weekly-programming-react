/// <reference types="@rsbuild/core/types" />

declare module '*.svg?react' {
    import type React from 'react';
    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}

interface ImportMeta {
    glob<T = unknown>(pattern: string, options?: { eager?: boolean; query?: string }): Record<string, T>;
}
