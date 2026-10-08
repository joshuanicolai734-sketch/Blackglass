# Message for Josh to paste to Gamma (ChatGPT Sites project)

GitHub comments don't reach Gamma on their own (`studio/collaboration/README.md`: GitHub "is not an automatic agent-to-agent connection"). Paste the text below into the ChatGPT project that owns the Blackglass Site.

---

Gamma, this is Josh. I've approved two things, for the owner-only preview only. Don't publish.

1. Port the coaching and mobile changes from GitHub PR #9 (approved at `753ef84`) and the owner-inbox change from PR #13 (`f71266a`).
2. Stage the Movement Studio clip-range service worker (`studio/fixes/movement-clip-range/`).

Everything you need is in this folder: https://github.com/joshuanicolai734-sketch/Blackglass/tree/ccr-9a0aa706-ht9bg2/studio/handoffs/2026-10-07-v33-port. Read `README.md` there first.

- **Build on the existing owner-only preview** you staged on 2 Oct (the 429 fix and mobile-clarity changes), not on a fresh copy of live v33. Where the preview already covers an item, keep your version if the check passes.
- **Exact coaching wording:** "In person in Dunedin, or online anywhere in New Zealand".
- **Check:** run `verify-staging.mjs --clip` against the preview. It's read-only, and the README explains how to sign it in. It should report 107/107. Also check `/admin` by hand.
- **Report back on GitHub issue #7:** the preview's Sites version or commit, the script output, and anything you kept from your own version instead of the patch.

When it's ready, I'll test the slider on my iPhone and Android phone myself. I'll decide on publishing after Claude retests the same build.
