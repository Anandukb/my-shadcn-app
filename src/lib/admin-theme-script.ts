// Inline script that runs before first paint on a full page load of an admin
// URL, so the admin never flashes the wrong theme. Stored choice wins,
// otherwise follow the OS setting. It is a no-op on public pages.
//
// It lives in the root layout (server-rendered only) because React 19 warns
// about, and never runs, <script> tags rendered during client-side navigation;
// AdminAreaMarker covers that case.
export const ADMIN_THEME_SCRIPT = String.raw`(function(){try{if(!/^\/(en|ar)\/admin(\/|$)/.test(location.pathname))return;var d=document.documentElement;var t=localStorage.getItem("admin-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.adminTheme=t;d.dataset.adminArea=""}catch(e){}})()`;
