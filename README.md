# Blackglass

Static website for www.blackglass.co.nz, hosted on GitHub Pages.

This is a copy of the site first published at blackglass.transhumanisticnicolai.chatgpt.site.
It needs no build step: the files in the repository root are the website.

## Changes from the original

- The enquiry form now opens the visitor's email app with the enquiry filled in, addressed to
  Joshuanicolai@live.com. The original sent it to a `/api/enquiries` backend, which static hosting
  cannot run. The privacy notice was updated to match.
- The canonical and social-preview URLs now point to https://www.blackglass.co.nz/.
- The hosting framework's JavaScript was removed. It is not needed for a static page.

## Going live on www.blackglass.co.nz

1. **Turn on GitHub Pages.** In the repo, go to Settings → Pages → Build and deployment. Set Source
   to "Deploy from a branch", then choose the branch holding these files (for example `main`) and
   the `/ (root)` folder.
2. **Set the custom domain.** On the same page, enter `www.blackglass.co.nz`. The `CNAME` file
   already holds this value.
3. **Add DNS records** at your .co.nz registrar or DNS host:

   | Type  | Host / Name | Value                               |
   |-------|-------------|-------------------------------------|
   | CNAME | `www`       | `joshuanicolai734-sketch.github.io` |
   | A     | `@`         | `185.199.108.153`                   |
   | A     | `@`         | `185.199.109.153`                   |
   | A     | `@`         | `185.199.110.153`                   |
   | A     | `@`         | `185.199.111.153`                   |

   The A records make `blackglass.co.nz` (without www) redirect to www. Delete any old A, AAAA or
   CNAME records for `@` and `www` that point somewhere else, such as the chatgpt.site host.
4. **Turn on HTTPS.** When DNS has updated (usually minutes, sometimes up to 24 hours), return to
   Settings → Pages and tick "Enforce HTTPS".
