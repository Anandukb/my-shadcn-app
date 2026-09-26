// Runs before first paint so the admin never flashes the wrong theme.
// Stored choice wins; otherwise follow the OS setting.
const script = `(function(){try{var t=localStorage.getItem("admin-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.adminTheme=t}catch(e){}})()`;

export default function AdminThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
