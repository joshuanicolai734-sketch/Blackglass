/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { Button, JsonLd, Label, Pane } from "@/components/site/ui";
import { getFaq, getFaqLive } from "@/content/faq";
import { app, coaching, contact, site } from "@/content/site";

const hasPlay = Boolean(app.android.playUrl);
const hasApk = !hasPlay && Boolean(app.android.apkUrl);
const hasDownload = hasPlay || hasApk;

export const metadata: Metadata = {
  title: "Get Blackglass for Android",
  description: hasDownload
    ? "Download Blackglass for Android and follow the install steps. Your programme, sessions, movement guides and food targets in one app."
    : "Blackglass for Android is in development. Join the free preview list to hear first when there's a build you can install. There is no iPhone app.",
  alternates: { canonical: "/get" },
  openGraph: { title: "Get Blackglass for Android", description: hasDownload ? "Download Blackglass for Android." : "Blackglass for Android is in development. Join the preview list.", url: "/get", images: [{ url: "/og/get.png", width: 1200, height: 630, alt: "Get Blackglass for Android" }] },
};

export default function Get() {
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
    { "@type": "ListItem", position: 2, name: "Get Blackglass", item: `${site.url}/get` },
  ] };
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header current="/get" />
      <main id="main" data-page="get">
        <section className="page-hero" aria-labelledby="get-title">
          <div className="ambient" data-ambient aria-hidden="true" />
          <div className="wrap">
            <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Get Blackglass</nav>
            <h1 id="get-title" className="display">{hasDownload ? "Blackglass for Android." : "Be first on the Android build."}</h1>
            <p className="lede">
              {hasDownload
                ? "Your programme, today's session, movement guides and food targets, on your phone."
                : "Blackglass is an Android app in development. It isn’t publicly available yet. Join the preview list and you’ll hear first when there’s a build you can install."}
            </p>
          </div>
        </section>

        <section className="section" aria-label="Platforms">
          <div className="wrap split">
            <div>
              <p className="platform-note" data-platform-note hidden />
              <div className="platforms">
                <article className="platform is-primary" id="android">
                  <div className="platform-head"><h2 className="h3">Android</h2>
                    <span className={hasDownload ? "badge live" : "badge"}>{hasDownload ? "Available" : "In development"}</span></div>
                  {hasPlay && <>
                    <p>Install from Google Play. Updates come through the Play Store.</p>
                    <div className="actions"><Button href={app.android.playUrl!} track="outbound_play" external>Open Google Play</Button></div>
                  </>}
                  {hasApk && <>
                    <p>Blackglass is downloaded as an APK file, the standard Android app package, directly from this site rather than from the Play Store.</p>
                    <div className="actions"><Button href={app.android.apkUrl!} track="outbound_apk">Download the APK</Button></div>
                    <p className="fileinfo">
                      {app.android.apkVersion && <>Version {app.android.apkVersion}<br /></>}
                      {app.android.apkSize && <>Size {app.android.apkSize}<br /></>}
                      {app.android.minAndroid && <>Needs Android {app.android.minAndroid} or later<br /></>}
                      {app.android.apkSha256 && <>SHA-256 {app.android.apkSha256}</>}
                    </p>
                    <ol className="install">
                      <li>Tap <strong>Download the APK</strong>. Your browser may warn that this type of file can harm your device; that warning appears for every app installed outside the Play Store. Choose <strong>Download anyway</strong> if you trust this site.</li>
                      <li>Open the downloaded file. If Android asks, allow your browser to <strong>install unknown apps</strong> (Settings → Apps → your browser → Install unknown apps).</li>
                      <li>Tap <strong>Install</strong>. Google Play Protect may scan the app first.</li>
                      <li>Open Blackglass.</li>
                    </ol>
                    <p className="footnote">You can switch “install unknown apps” off again afterwards. Updates are installed the same way until Blackglass is on the Play Store.</p>
                  </>}
                  {!hasDownload && <>
                    <p>In development and not yet publicly available. Join the preview list to hear when there’s a build you can try.</p>
                    <div className="actions"><Button href="#preview" track="cta_preview_anchor" down>Join the preview list</Button></div>
                  </>}
                </article>
                <article className="platform" id="iphone">
                  <div className="platform-head"><h2 className="h3">iPhone</h2><span className="badge">Not available</span></div>
                  <p>There is no iPhone app.{coaching.available && <> If you want structured training now, <a href="/coaching">coaching with {site.founder}</a> works with any phone.</>}</p>
                </article>
                <article className="platform" id="web">
                  <div className="platform-head"><h2 className="h3">Web</h2><span className="badge">Not available</span></div>
                  <p>There is no web version of the app. This website is for finding out about Blackglass and getting in touch.</p>
                </article>
              </div>
              <div className="qr">
                {/* eslint-disable-next-line @next/next/no-img-element -- static QR code */}
                <img src="/qr/get.svg" alt="QR code that opens blackglass.co.nz/get on your phone" width="132" height="132" loading="lazy" />
                <p><strong>On a computer?</strong>Scan with your phone’s camera to open this page there{hasDownload ? " and install Blackglass." : "."}</p>
              </div>
            </div>

            <div>
              {!hasDownload ? (
                <form className="form-card" id="preview" data-form="preview" data-email={contact.email} data-founder={site.founder} noValidate>
                  <h2>Join the Android preview list</h2>
                  <p>Free. One email when there’s a build you can try. No newsletter.</p>
                  <div className="field"><label htmlFor="p-name">Your name</label>
                    <input id="p-name" name="name" type="text" autoComplete="name" maxLength={80} required /></div>
                  <div className="field"><label htmlFor="p-email">Email address</label>
                    <input id="p-email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={120} required /></div>
                  <div className="field"><label htmlFor="p-note">What do you want from a training app?<span className="opt">OPTIONAL</span></label>
                    <input id="p-note" name="goal" type="text" maxLength={200} /></div>
                  <div className="trap" aria-hidden="true"><label htmlFor="p-website">Leave blank</label><input id="p-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
                  <input type="hidden" name="route" value="app" />
                  <button className="btn btn-primary" type="submit"><span>Join the preview list</span>
                    <svg className="arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" /></svg></button>
                  <p className="form-note">{site.founder} uses your name and email only to contact you about Blackglass for Android. <a href="/privacy">Privacy</a></p>
                  <div className="msg" data-form-msg role="status" aria-live="polite" hidden />
                </form>
              ) : (
                <Pane src="/assets/dashboard.webp" alt="Blackglass Today screen with a session in progress and food targets" caption="Today · current Android build" />
              )}
              <p className="footnote">Already testing Blackglass? <a href={`mailto:${contact.email}?subject=${encodeURIComponent("Blackglass test build")}`}>Email {site.founder}</a> for the latest build.</p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="get-faq" style={{ paddingTop: 0 }}>
          <div className="wrap faq-grid">
            <div className="section-head"><Label>Questions</Label><h2 id="get-faq" className="h2">Before you<br />sign up.</h2></div>
            <Faqs items={hasDownload ? getFaqLive : getFaq} />
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={crumbs} />
    </>
  );
}
