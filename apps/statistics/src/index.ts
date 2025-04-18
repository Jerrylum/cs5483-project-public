import { app } from './app';

app.listen(8081);

console.log(`🚀 Statistics Server is running at ${app.server?.hostname}:${app.server?.port}`);
