import { landingMarkup } from "./landing-markup";
import SiteEffects from "./site-effects";

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: landingMarkup }} />
      <SiteEffects />
    </>
  );
}
