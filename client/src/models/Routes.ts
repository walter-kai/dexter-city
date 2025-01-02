// routes.ts
export const routes = [
    { path: "/", component: "Home" },
    { path: "/dash", component: "Dashboard" },
    { path: "/shop", component: "Shop" },
    { path: '/shop/:botId', component: 'Shop' },
    { path: "/build", component: "Build" },
    { path: "/bots", component: "MyBots" },
    { path: "/profile", component: "Profile" },
    { path: "/share", component: "Share" },
    { path: "/guide", component: "UserGuide" },
    { path: "/support", component: "Support" },
    { path: "/quit", component: "Quit" },
    { path: "*", component: "NotFound" },
  ];
  