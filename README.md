# Two Journeys on the Same Southern Roads

An ENGL 102 virtual museum exhibit about automobile travel, segregation, and freedom of movement in North Carolina, 1939–1956.

**Website:** https://jmcguigan10.github.io/engl-102-project/

The exhibit follows a simple sequence: introduction, five objects, and notes with an alphabetized Chicago bibliography. All content and navigation work without JavaScript.

## Assignment coverage

- A 451-word introduction explains the historical context, research question, audience, and purpose.
- Five archival objects represent photographic, textual, and cartographic media.
- Every object has a visible analytical label of 100–200 words, an image, identifying information, and an archival scan link.
- Numbered Chicago notes connect interpretations to their sources. The bibliography includes all five primary publications/objects and two peer-reviewed journal articles by Isabel Dorothea Kalous and Ethan Bottone.

Word counts apply to introduction prose and object labels, excluding headings, metadata, captions, and note markers.

## Run locally

This is a static website with no build step or API keys.

```sh
python3 -m http.server 8123
```

Open http://localhost:8123.

## Edit

- `index.html` contains the introduction, five object labels, captions, notes, and bibliography.
- `styles.css` controls the responsive layout and typography.
- `app.js` provides optional navigation highlighting.
- `assets/` contains archival images, including preserved full-page scans and the cropped Payne’s advertisement.

When changing prose, recheck the introduction’s 400–600-word range and each label’s 100–200-word range. Maintain sequential note links and bibliography entries for all sources used.

## Historical method

The calendar records the state’s promotion of leisure. The guide page records published racial categories for hotels and cinemas. The Green Book entries record recommended businesses in 1941. Payne’s advertisement records how the tourist home presented its accommodations in Fall 1956. The map shows western road connections in 1939. Historical racial terminology appears in original titles and scans.

The Payne’s image is a clearly identified crop of printed page 47. Western Carolina University’s numbered overlays on the 1939 highway map are identified as modern annotations.

The preceding interactive eight-city presentation is preserved in Git history at commit `7a7efe7e35f00a7576bd48683cf8e4264c880472`.

## Publish

GitHub Pages publishes the root of the `main` branch. After editing and checking locally:

```sh
git add .
git commit -m "Update exhibit"
git push origin main
```

GitHub then rebuilds the public site. The repository’s Pages settings are at https://github.com/jmcguigan10/engl-102-project/settings/pages.
