import { landingMarkup } from "./landing-markup";
import SiteEffects from "./site-effects";

export default function Home() {
  return (
    <>
      {/* splash.js edits this markup before hydration (inert, removing the overlay); React must leave it alone. */}
      <div dangerouslySetInnerHTML={{ __html: landingMarkup }} suppressHydrationWarning />
      <SiteEffects />
    </>
  );
}
