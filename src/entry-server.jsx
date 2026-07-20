import React from "react";
import { renderToString } from "react-dom/server";
import App, { getAllRoutePaths, seoFor, parsePath, SITE_URL, SITE_NAME } from "./App.jsx";

export function render(path) {
  const html = renderToString(
    <React.StrictMode>
      <App initialPath={path} />
    </React.StrictMode>
  );
  const route = parsePath(path);
  const seo = seoFor(route);
  return { html, seo, canonical: `${SITE_URL}${path === "/" ? "/" : path}` };
}

export { getAllRoutePaths, SITE_URL, SITE_NAME };
