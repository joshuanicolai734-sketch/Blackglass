import { app, coaching, site } from "./site";

export type Faq = { q: string; a: string };

const price = `${coaching.currency}${coaching.weekly}`;

export const homeFaq: Faq[] = [
  {
    q: "Can I download Blackglass now?",
    a: app.android.playUrl || app.android.apkUrl
      ? "Yes, on Android. The Get Blackglass page has the download and install steps."
      : "Not yet. The Android app is in development and is not publicly available. Join the preview list on the Get Blackglass page and Josh will email you when there is a build you can install.",
  },
  {
    q: "Is there an iPhone version?",
    a: "No. Blackglass is being built for Android, and there is no iPhone app.",
  },
  {
    q: "What does the app do?",
    a: "It keeps your programme, today's session, movement guides and food targets together. You can see the week's plan, pick up a session where you left off, check how a lift should look phase by phase, and log food against a calorie and protein target.",
  },
  {
    q: "What will the app cost?",
    a: "Pricing hasn't been set. Joining the preview list is free and doesn't commit you to anything.",
  },
  ...(coaching.available ? [{
    q: "Is the app part of coaching?",
    a: `Not at the moment. Coaching is run directly with ${site.founder}, who confirms the tools you'll use before you start. Coaching is ${price} a week for ${coaching.weeks} weeks.`,
  }] : []),
];

export const getFaq: Faq[] = [
  {
    q: "What happens when I join the preview list?",
    a: "Your name and email are saved so Josh can contact you about Blackglass for Android. You'll get an email when there's a build you can try. There's no newsletter, and you can ask to be removed at any time.",
  },
  {
    q: "Why isn't it on the Play Store?",
    a: "The app is still in development. When it's ready to share, this page will show exactly how to install it and where the download comes from.",
  },
  {
    q: "Will it work on my phone?",
    a: "Blackglass is being built for Android phones. Supported Android versions will be listed here with the first public build.",
  },
];

export const coachingFaq: Faq[] = [
  {
    q: "What happens after I enquire?",
    a: "Josh reads your enquiry and contacts you to talk through your goal, start date and whether coaching is a good fit. You'll see the written scope and terms before committing. No payment is taken through this form.",
  },
  {
    q: "What does the founding price cover?",
    a: `${price} each week for ${coaching.weeks} weeks, ${coaching.currency}${coaching.total} in total. It includes an initial training plan built around your week, one check-in each week, and training adjustments as you progress. Josh confirms the full service and payment terms in writing before you commit.`,
  },
  {
    q: "Do I need the app to start coaching?",
    a: "No. The Android app is in development and isn't part of the paid coaching offer. Josh will confirm the tools used for coaching before you start.",
  },
  {
    q: "Can I get a programme without weekly coaching?",
    a: "Yes. Choose \"A personal training programme\" in the enquiry form. Its scope and price are agreed separately.",
  },
];

/** Shown on /get once a download is live (a Play Store link or APK in content/site.ts). */
export const getFaqLive: Faq[] = [
  ...(app.android.playUrl ? [] : [{
    q: "Why does Android warn me about the APK?",
    a: "Android shows that warning for any app installed from outside the Play Store. The Blackglass APK is downloaded directly from blackglass.co.nz, and the SHA-256 checksum on this page lets you confirm the file is the one published here.",
  }]),
  {
    q: "Is there an iPhone version?",
    a: "No. Blackglass is Android only.",
  },
];
