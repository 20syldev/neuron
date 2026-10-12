# neuron - From ink to meaning

Interactive essay on neural networks, published at [neuron.sylvain.sh](https://neuron.sylvain.sh): a live handwritten-digit network, then attention in a transformer, in two languages. It replaces the former **digit** project and runs entirely in the browser, with no server, no account and no data sent anywhere.

## Features

- Digit recognized live: draw with the mouse, a finger or a stylus, and the 784-256-256-10 network recomputes its prediction at every stroke.
- A network you can open: pixel values, activations layer after layer, output probabilities and the weight field of each neuron.
- Attention within reach: query, key, value, dot product, softmax, attention grid, word order, multiple heads and causal mask, around the French sentence « L'animal n'a pas traversé le boulevard parce qu'il était trop fatigué / large ».
- A tired / wide switch that changes one word of the sentence and shows how the attention of « il » moves.
- Chapter navigation: table of contents, floating pill with the current chapter and progress indicator.
- English / French i18n (next-intl, served at `/` and `/fr/`), light / dark theme (next-themes), halftone identity called Trame.

## Stack

Next.js 16 (App Router, static export), React 19, strict TypeScript, Tailwind CSS v4, shadcn/ui (new-york, Radix primitives via `radix-ui`), next-intl, next-themes, lucide-react. Fonts (Bricolage Grotesque, Manrope, Geist Mono) are self-hosted by `next/font/google` at build time.

## Scripts

| Script           | Description                                |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Dev server on `127.0.0.1:1535`             |
| `npm run build`  | Production build (static export to `out/`) |
| `npm run start`  | Serve `out/` on port 1536                  |
| `npm run check`  | `tsc --noEmit` + ESLint + Prettier (check) |
| `npm run format` | Prettier + ESLint (write)                  |

## Structure

```
messages/              i18n messages, one folder per language (en/, fr/), one file per namespace
public/models/         digit.bin, the network weights
src/app/(site)/        Root layout + page for the default locale, served at /
src/app/[locale]/      Root layout + page for the other locales, served at /fr/
src/app/appearance/    Global styles: theme.css (tokens), base.css, header.css, wordmark.css
src/components/        Essay composition, shell, theme and language switches
src/components/header/ Masthead, compact bar, floating pill, table of contents
src/components/part1/  Prologue, part I (chapters 1 to 4), interlude
src/components/part2/  Part II (chapters 5 to 15), epilogue, footer, component kit
src/components/ui/     Generated shadcn/ui components
src/data/              Chapter list
src/hooks/             Model loading, current chapter, lens, fisheye, viewport
src/i18n/              next-intl routing and request
src/lib/               Network, preprocessing, attention, word order, heads, figures, halftone, formats
```

## Notes

- Static export: no middleware, `localePrefix: "as-needed"`. The default locale (en) is served at `/`, French at `/fr/`; each locale is a distinct root layout sharing the `Shell` component. On the first visit a small inline script redirects to `/fr/` when the browser is in French, and a choice saved in `localStorage` always wins.
- Keyboard shortcut: `Alt+L` switches the language.
- The model `digit.bin` is the 1.3.0 weights (commit `8ea7aca`) as little-endian int16 at a 1e-4 scale, a lossless conversion; `src/lib/mlp.ts` runs the inference without any math library.
