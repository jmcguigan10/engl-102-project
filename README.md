# Two Journeys on the Same Southern Roads

An ENGL 102 digital history exhibit comparing the 1939 North Carolina state guide and *Variety Vacationland* brochure with the 1941 and Fall 1956 *Green Books*. Eight city stops pair primary-source evidence with interpretation of travel, segregation, hospitality, and freedom of movement.

**Website:** https://jmcguigan10.github.io/engl-102-project/

## Run locally

This is a static website. It needs no build step or API keys.

```sh
python3 -m http.server 8123
```

Open http://localhost:8123. Serve the directory over HTTP rather than opening `index.html` directly.

## Edit

- `content.js` contains the stop narratives, verified historical listings, page references, and bibliography.
- `index.html`, `styles.css`, and `app.js` contain the presentation and interactions.
- `assets/` contains archival source images and the schematic journey illustration.

The interactive map uses Northwestern University Knight Lab's [StoryMapJS](https://storymap.knightlab.com/). Its connecting lines indicate narrative order, not a reconstruction of period highways. City markers indicate towns, not verified historic street addresses. Historical map evidence is identified separately in the exhibit.

## Historical method

The 1939 Federal Writers' Project guide is compared primarily with the 1941 *Green Book*. The Fall 1956 edition offers a later snapshot rather than a direct measure of change: listings can change for many reasons. Missing listings do not establish exclusion, and advertised or listed services do not guarantee safety.

The 1939 mainstream guide sometimes explicitly distinguishes accommodations for Black travelers. The exhibit preserves that evidence rather than treating all mainstream tourism writing as silent about segregation. Original publications use dated racial terminology; the site's interpretations use modern language.

## Publish

GitHub Pages publishes the root of the `main` branch. After editing and checking locally:

```sh
git add .
git commit -m "Update exhibit"
git push origin main
```

GitHub then rebuilds the public site. The repository's Pages settings are at https://github.com/jmcguigan10/engl-102-project/settings/pages.

## Source and image credits

Publication details, archival links, and image credits appear in the site's Sources section and at each stop. Archival images are reproduced as historical evidence. Decorative route graphics are modern illustrations and are labeled schematic.
