# Native enquiry 429 patch review

This is a review bundle, not an application change. Merging this bundle would not install or deploy the candidate: the application's `public/site.js` is untouched. Actual Site integration stays held for independent review and separate publication approval.

## Source and ownership

- Native implementation base: public Site version 33, commit `7daacb89a396bc3bda44ca8ea17a5f1675011d9d`
- GitHub PR base: `b87393d8a5ffff089ecc327ec0212e67161e1921`. This older runtime is only the storage/review parent; it is not the candidate's native base
- Approved scope and source boundaries: [PR #8 brief at e0fcf0f3](https://github.com/joshuanicolai734-sketch/Blackglass/blob/e0fcf0f3434b4e7802e2a5b69a0af156c64f3d3b/studio/briefs/NATIVE_RECONCILIATION_NEXT_STEP.md)
- Context: [Replit comparison](https://github.com/joshuanicolai734-sketch/Blackglass/issues/7#issuecomment-5955993208). Its port is not imported
- Gamma coordinates; an implementation worker prepared the change and its 22 tests; a separate worker supplied the 48-case regression suite and full native build verification. Claude is assigned independent exact-diff review; an assignment does not establish that review has run
- Concurrent draft PR #9 changes the label token and separate BG-002 documents. Its files do not overlap this bundle; no PR #9 work is incorporated

## Contents and change

`original/public/site.js` is the exact native baseline file. `candidate/public/site.js` changes only its existing message expression: HTTP 429 gets friendly retry-later feedback. `enquiry-feedback.patch` is the three-line addition/one-line removal and reconstructs the candidate exactly from the original. The two test files are unchanged copies of the tested synthetic suites. `manifest.json` records their sizes and SHA-256 hashes.

The new message retains entered values and the existing email alternative without inventing a wait duration or retrying automatically. Confirmed JSON receipt handling, the 15-second deadline covering headers/body, duplicate 409 feedback, uncertainty handling, single in-flight guard, focus/status behavior and submit-control recovery are unchanged. This is controlled-response coverage, not evidence that the live native service currently emits 429. No rate limiter, server contract, auth, schema or availability change is proposed.

## Reproduce the focused checks

Run from this bundle directory with Node 24 (verified on 24.19.0); no package installation or network is needed:

```sh
node --check candidate/public/site.js
node --test candidate/tests/enquiry-feedback.test.mjs
ENQUIRY_SOURCE=./candidate/public/site.js \
EXPECTED_SHA256=57449e61e578c4f00a4172e3ecbf6fb83f2c10c66cc94f9a75d556c0d59dd175 \
node --test tests/enquiry-regression.test.mjs
```

Candidate results rechecked during packaging on 2 October 2026: **22/22 and 48/48 pass**. Tests use synthetic inputs, mocked fetch and controlled timers; they make no network or database calls. The 22-case suite executes the full script; the independent 48-case suite executes its exact Forms section in a Node VM.

Regression proof: set `SITE_JS_PATH=./original/public/site.js` for the first suite and `ENQUIRY_SOURCE=./original/public/site.js` for the second (use the original hash from the manifest). The original yields **14 pass / 8 expected failures** and **40 pass / 8 expected failures**, respectively. Those failures concern the intended missing 429 feedback and retry-after-429 cases. They are evidence the tests detect the change, not failed candidate checks.

Coverage includes strict receipt success; 200 HTML, malformed/missing/false receipt; JSON/non-JSON 429 and 409; 503/500; network rejection; stalled headers and body; late completion; repeated clicks; explicit retry; preserved values; focused status; and restored controls. Synthetic assertions do not establish browser or assistive-technology behavior.

## Verification and remaining gates

The independent worker applied the patch to an isolated full copy of the exact native base. Frozen-lockfile installation, lint, TypeScript and production build passed. Only `public/site.js` differed among tracked files; all 295 canonical tracked-file hashes, clean status and native HEAD remained unchanged. The packaging review checked the source/test hashes, reran both candidate and original suites, and verified clean patch application and exact candidate reconstruction.

Backend/no-JavaScript form, 303 receipt/retry, short-lived HttpOnly cookie and conversion-counting behavior were preserved by unchanged-file/hash and source inspection, not runtime integration tests. No production form was submitted.

Repository CI for this bundle validates the older GitHub application plus these review files. Its current workflow does **not** run the two synthetic suites automatically, build the complete native v33 candidate, or establish Site/runtime parity. Check CI against the exact review-PR head and rerun the commands above when reviewing edits.

Pending: independent Claude review of this exact bundle; rendered 320/430-pixel and desktop, keyboard/reduced-motion and physical-phone evidence; no-JavaScript runtime/D1 integration where required by the brief; separately approved integration on a freshly verified native source. Existing receipts, owner authentication and newer native work must survive any integration. Do not apply this patch to the older GitHub runtime merely because its context happens to match.

No complete source archive, dependency/build output, private URL, client record or credential is included. No merge, deployment, source sync or account-permission change accompanies this review bundle.
