import Script from "next/script";

// Runs before first paint so a saved night-mode / text-size choice never flashes the wrong look.
const code = `(function(){try{var t=localStorage.getItem('stc-theme')||'light';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');r.style.colorScheme='dark';}var s=Number(localStorage.getItem('stc-text-scale'));if(s===112.5||s===125){r.style.fontSize=s+'%';}}catch(e){}})();`;

export default function DisplayPrefsScript() {
  return <Script id="stc-display-prefs" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: code }} />;
}
