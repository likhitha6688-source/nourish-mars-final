import { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, inIframe, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuide(true);
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyUrl = async () => {
    if (!appUrl) return;
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        title="Install NOURISH-Mars App"
      >
        <Download className="w-4 h-4 text-lime-300 shrink-0" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 text-slate-900">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#070d1f] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-lime-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Install NOURISH-Mars App
                  </h3>
                  <p className="text-xs text-slate-500">
                    Save on your desktop, tablet, or phone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close install guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inIframe && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 space-y-2">
                <p className="text-xs font-bold text-amber-950">
                  Why isn’t the install icon visible right now?
                </p>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Inside the AI Studio preview window, browsers hide the native Install button. Open the app in its own browser tab first—then the Install button appears immediately!
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-lime-300 text-xs font-extrabold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Browser Tab
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-amber-300 text-amber-950 text-xs font-bold hover:bg-amber-100"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Link Copied!' : 'Copy App Link'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs text-slate-700">
              {isIOS ? (
                <div className="rounded-xl bg-sky-50 border border-sky-200 p-3.5 space-y-1.5">
                  <p className="font-extrabold text-sky-950 flex items-center gap-1.5">
                    <Share className="w-4 h-4" /> iPhone / iPad (Safari)
                  </p>
                  <p>1. Open the app link in Safari.</p>
                  <p>2. Tap the <strong>Share</strong> icon in Safari’s toolbar.</p>
                  <p>3. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                    <p className="font-extrabold text-slate-900">Desktop (Chrome / Edge)</p>
                    <p>
                      Open the app in a normal browser tab, then click the <strong>Install App</strong> icon in the address bar (or menu <strong>⋮ → Cast, save, and share → Install NOURISH-Mars</strong>).
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                    <p className="font-extrabold text-slate-900">Phone / Tablet (Android &amp; iOS)</p>
                    <p>
                      Open the link on your phone: tap <strong>Install App</strong> / <strong>Add to Home screen</strong> in Chrome (Android) or <strong>Share → Add to Home Screen</strong> in Safari (iPhone/iPad).
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
