import routes from './routes';
export const matchRoute = (rawPathname) => {
    const pathname = rawPathname.split(/[?#]/)[0];
    for (const route of routes) {
        const paramNames = [];
        const pattern = route.path.replace(/:([^/]+)/g, (_, key) => {
            paramNames.push(key);
            return '([^/]+)';
        });
        const regex = new RegExp(`^${pattern}$`);
        const match = pathname.match(regex);
        if (match) {
            const params = {};
            paramNames.forEach((name, i) => {
                params[name] = match[i + 1];
            });
            return { route, params };
        }
    }
    return null;
};