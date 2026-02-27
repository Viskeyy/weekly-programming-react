import { HomeIndex } from '../pages/index';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: HomeIndex,
});
