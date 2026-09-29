/* eslint-disable @next/next/no-html-link-for-pages -- Pages use full document loads so the enhancement script initialises on each one. */
import type { Metadata } from "next";
import { Footer, Header } from "@/components/site/chrome";
import { Faqs } from "@/components/site/faqs";
import { PreviewForm } from "@/components/site/forms";
import { Brackets, Button, JsonLd, Pane, SectionHead, Signal, TextLink } from "@/components/site/ui";
import { getFaq, getFaqLive, previewSteps } from "@/content/faq";
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
        <section className="page-hero get-hero" aria-labelledby="get-title" data-sec>
          <div className="wrap split">
            <div>
              <nav className="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a> / Get Blackglass</nav>
              <h1 id="get-title" className="display">{hasDownload ? "Blackglass for Android." : "Be first on the Android build."}</h1>
              <p className="body-2">
                {hasDownload
                  ? "Your programme, today's session, movement guides and food targets, on your phone."
                  : "Blackglass is an Android app in development. It isn’t publicly available yet. Join the preview list and you’ll hear first when there’s a build you can install."}
              </p>
              {/* Both notes ship hidden; site.js shows the one for the visitor's phone (space is reserved on phones). */}
              <div className="platform-note" data-platform-note>
                <p data-note="ios" hidden>You&rsquo;re on an iPhone. There&rsquo;s no iPhone app{coaching.available ? <>, but <a href="/coaching">coaching</a> works with any phone.</> : "."}</p>
                <p data-note="android" hidden>You&rsquo;re on Android, so you&rsquo;re in the right place.</p>
              </div>
              {!hasDownload && (
                <ol className="next-steps get-steps" aria-label="What happens when you join">
                  {previewSteps.map((t) => <li key={t}>{t}</li>)}
                </ol>
              )}
            </div>

            <div>
              {!hasDownload ? (
                <PreviewForm />
              ) : (
                <Pane src="/assets/dashboard.webp" alt="Blackglass Today screen with a session in progress and food targets" caption="Today · current Android build" />
              )}
              <p className="footnote">Already testing Blackglass? <a href={`mailto:${contact.email}?subject=${encodeURIComponent("Blackglass test build")}`}>Email {site.founder}</a> for the latest build.</p>
            </div>
          </div>
        </section>

        <section className="section" aria-label="Platforms" data-sec>
          <div className="wrap">
            <SectionHead title="Platforms" meta="03 platforms" />
            <div className="platforms">
              <article className="spec snap platform" id="android">
                <Brackets />
                <p className="spec-k label"><Signal /><span className="i">01</span><span>Platform</span></p>
                <h2 className="title">Android</h2>
                <dl className="label"><dt>Status</dt><dd>{hasDownload ? "Available" : "In development"}</dd></dl>
                {hasPlay && <>
                  <p>Install from Google Play. Updates come through the Play Store.</p>
                  <div className="actions"><Button href={app.android.playUrl!} track="outbound_play" external>Open Google Play</Button></div>
                </>}
                {hasApk && <>
                  <p>Blackglass is downloaded as an APK file, the standard Android app package, directly from this site rather than from the Play Store.</p>
                  <div className="actions"><Button href={app.android.apkUrl!} track="outbound_apk">Download the APK</Button></div>
                  <p className="fileinfo label">
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
                  <div className="actions"><TextLink href="#preview" track="cta_preview_anchor">Join the preview list</TextLink></div>
                </>}
              </article>
              <article className="spec snap platform" id="iphone">
                <Brackets />
                <p className="spec-k label"><span className="i">02</span><span>Platform</span></p>
                <h2 className="title">iPhone</h2>
                <dl className="label"><dt>Status</dt><dd>Not available</dd></dl>
                <p>There is no iPhone app.{coaching.available && <> If you want structured training now, <a href="/coaching">coaching with {site.founder}</a> works with any phone.</>}</p>
              </article>
              <article className="spec snap platform" id="web">
                <Brackets />
                <p className="spec-k label"><span className="i">03</span><span>Platform</span></p>
                <h2 className="title">Web</h2>
                <dl className="label"><dt>Status</dt><dd>Not available</dd></dl>
                <p>There is no web version of the app. This website is for finding out about Blackglass and getting in touch.</p>
              </article>
            </div>
            <div className="qr">
              {/* eslint-disable-next-line @next/next/no-img-element -- static QR code */}
              <img src="/qr/get.svg" alt="QR code that opens blackglass.co.nz/get on your phone" width="132" height="132" loading="lazy" />
              <p><strong>On a computer?</strong>Scan with your phone’s camera to open this page there{hasDownload ? " and install Blackglass." : "."}</p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="get-faq" data-sec>
          <div className="wrap faq-grid">
            <div className="section-head"><SectionHead title="Questions" meta={`${String((hasDownload ? getFaqLive : getFaq).length).padStart(2, "0")} answers`} /><h2 id="get-faq" className="display">Before you sign up.</h2></div>
            <Faqs items={hasDownload ? getFaqLive : getFaq} />
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={crumbs} />
    </>
  );
}
