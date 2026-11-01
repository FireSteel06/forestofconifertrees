# forest of conifer trees

An Eleventy site, made to be hosted on Cloudflare Workers (static assets). This was written without being run, so expect to fix a typo or two on the first build.

## Run it

You need Node.js 18 or newer (`node --version`).

    npm install
    npm start          # http://localhost:8080, reloads when you save

## Where things are

- `src/index.njk`, `posts.njk`, `art.njk`, `about.njk`: the pages
- `src/_includes/base.njk`: the shared frame (nav chips, fonts, script). Edit it once and every page changes
- `src/_includes/post.njk`: the layout for a post (the canvas)
- `src/_data/art.json`: your artworks. It is empty for now, so the page says "Nothing yet". See `examples/art.example.json` for one entry
- `src/posts/*.md`: one file per post. A new file is a new post, and it shows up in Post history and on the home page by itself
- `src/assets/`: css, js, video, images. Anything here is copied to the site as it is

## Writing a post

Copy `examples/canvas-post.md.example` to `src/posts/my-post.md` (without `.example`). Change the front matter (title, date, excerpt, canvas size) and move things around. Every item is a box with `left`, `top` and `width` in pixels, so `left:520px;top:130px` means 520px from the left edge of the canvas and 130px from the top. Overlap things if you want.

Put pictures in `src/assets/<post-name>/` and use `<img src="/assets/<post-name>/1.jpg" alt="">`.

## Deploy to Cloudflare

    npx wrangler login      # once
    npm run deploy          # builds, then uploads _site

Then in the Cloudflare dashboard: Workers & Pages > forest-of-conifer-trees > Settings > Domains & Routes > Add > Custom domain. Your domain is already on Cloudflare, so it sets up the DNS for you.

To deploy on every `git push`, connect the GitHub repo in the Worker's Settings > Builds. Build command `npm run build`, deploy command `npx wrangler deploy`.

## Video

Keep videos small. Export for the web with:

    ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 27 -movflags +faststart out.mp4

## Before you publish

Both the post list and the art list are empty on purpose, so the home page, Post history and Art in progress all say "Nothing yet" until you add a file. Add a contact line to `src/about.njk` if you want one.
