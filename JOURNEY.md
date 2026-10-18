# Phil's Journey

Open `/journey/` after deployment, or run this from the repository root:

```sh
python3 scripts/preview_journey.py
```

Visit `http://localhost:4000/journey/`. Refresh after edits; stop with Ctrl+C. Use `--host 0.0.0.0` to test from a phone on the same Wi-Fi. This previews the game, not the full Jekyll site.

## Configure the journey

**Edit only `assets/journey/story.js` for normal content changes.** It contains `JOURNEY_CONFIG.defaults` and an ordered `sections` array. Move a section up or down to reorder the world. Add or remove a section without calculating coordinates or changing the engine. Every section begins with a named building and a framed image or monogram.

A complete example section:

```js
{
  id: "my-next-chapter",             // unique, stable identifier
  name: "The next chapter",          // progress label and timeline heading
  width: 1050,                       // optional minimum section width
  color: "#8fe0a3",                  // section accent
  scenery: "workshop",
  building: {
    name: "My new team",             // high-contrast building sign
    image: "my-team.jpg",            // filename in assets/journey/images/, or null
    imagePixels: 64                  // optional image detail: 16–96
  },
  coins: [
    {
      title: "A new beginning",
      text: "The complete message to show when this coin is collected.",
      height: 28                     // walk into this coin
    },
    {
      title: "A little higher",
      text: "Another complete message. Jump to collect this one.",
      height: 102                    // jump for this coin
    }
  ],
  platforms: [                       // optional; omit for an open walking section
    { at: 0.45, rise: 70, width: 160, ladder: true }
  ]
}
```

There is no need to set `x`, `y`, the total world length, the ending position, or an absolute building location. The last section supplies the ending text; put your future chapter last.

### Coins and spacing

The game reserves the entrance area for the building, then distributes the coins evenly across the rest of the section. Adding coins automatically extends the section if needed to retain `defaults.minCoinSpacing`. A section's `width` is a minimum, not a hard limit.

`height` is measured above the walking surface beneath the coin: ground on an open path, or the highest platform at that position. Use **28** for an easy pickup and **102** for a jump. Supported heights are **20–120**; omitting height uses `defaults.coinHeight`. Coins on a platform require reaching that platform first.

Each coin's `title` and `text` becomes its speech bubble. Prefer one complete idea per coin. Text longer than 180 characters is split into additional coins at sentence/word boundaries, inheriting the configured height; the section grows and spaces them automatically. All the text also appears in the accessible timeline. `bonus: true` makes a blue star diamond for optional extras; main-story coins are gold and round. Shapes, labels and separate counters make the difference clear. Placement rules are the same. Coins in an `optional: true` section default to bonus unless explicitly set to false.

Consulting, Platform Engineering, Kyckr and Leadership each use three coins with `stage: "challenge"`, `stage: "choice"` and `stage: "outcome"`. The bubble labels show the stage. Each section uses:

```js
event: {
  type: "simplify", // use selfservice or leadership for the other scenes
  trigger: "coin",
  coinStage: "choice",
  duration: 1.5
}
```

`coinStage` selects the coin that starts the animation: the challenge leaves the problem visible, the choice transforms it, and the outcome describes what changed. Omit `coinStage` to trigger on any coin in the section. Stage values and matching triggers are validated. Long text split into extra coins retains its stage; subsequent coins never replay an event. Keep the three beats short and use existing facts rather than inventing results or metrics. The accessible timeline uses each section's `details` as the complete narrative.

Bubble space is measured for the longest configured message when the viewport changes and stays fixed while playing. Coin collection changes text without resizing the canvas or resetting the camera. Each new message gently shifts horizontally within the reserved area over 280ms and changes a small edge accent. The bubble then stays still while you read; reduced motion keeps it stationary and retains the accent cue. Offsets stay within the mobile margins. No scrolling text or dismissal button is required.

### Section images

1. Put your PNG, JPG, WebP or GIF in **`assets/journey/images/`**.
2. Set `building.image` to its filename, such as `"winchester.jpg"`.
3. Refresh the preview.

The browser fits the complete image inside a small pixel grid, reduces it to at most 216 colours, and scales it up without smoothing. Conversion happens once per loaded image, stays local, and does not modify the original file. No AI service, upload, image editor or image build step is needed. `imagePixels: 40` looks chunkier; `64` is the clearer default, and `96` keeps the most detail. The on-screen frame stays the same size.

Use modest image files, preferably below 1 MB. Subfolders and spaces in filenames work. URLs outside the repository are intentionally unsupported. `image: null`, a missing image or a failed conversion displays the section's monogram instead. Asset paths work with the Jekyll baseurl and the Python preview's `--baseurl /preview` option.

### Scenery and platforms

Available `scenery` values are `campus`, `computer`, `workshop`, `map`, `pipeline`, `garage`, `city`, `repos`, `system`, `team`, `network`, `park`, and `horizon`. This chooses the illustrated environment; the entrance building always comes from `building`.

Platforms use `at` (0–1 across the area after the building), `rise` (24–180 pixels above ground), `width` (60–600) and `ladder` (true/false). Platforms above 110 pixels automatically receive a ladder so they remain reachable. An empty or omitted `platforms` array leaves a walking section.

Optional `effect` values are `selfservice` for `pipeline` scenery, `governance` for `system`, and `leadership` for `team`. If the section has an event, walking across its trigger activates the effect; otherwise its first coin does. `optional: true` labels a side story in the timeline.

### Story events, characters and atmosphere

A section can tell its story through the environment:

```js
atmosphere: "enterprise",
event: {
  type: "leadership",
  at: 0.38,                         // fraction of the entire section (0–1)
  duration: 2.4                      // seconds for the change; 0.2–8
},
characters: [
  { name: "Engineer", at: 0.65, color: "#7ca9c8", speech: "A clearer way through." }
]
```

Events trigger once when Phil walks past `at`. Set `event.trigger: "coin"` to wait for a coin in that section instead (used by graduation, Consulting, Platform Engineering, Kyckr and Leadership). Walking triggers need no button or coin and never block travel or remove the safe ground. Revisiting preserves the changed scene; Restart restores its initial state. Reduced-motion preferences show the completed change immediately.

| Event type | What changes |
| --- | --- |
| `classroom` | Phil wears a graduation gown and mortarboard, holding a rolled scroll. Collecting the first coin lights the campus windows. Playable ledges look like books. |
| `firstbuild` | The first build travels between terminals and the second screen shows its result. Configure its `event.resultLines` array. |
| `sharing` | A notebook passes between the existing workstations and rests beside the second screen. |
| `hackathon` | Three representative team workstations contribute to a shared demo when the choice coin is collected. The consulting bubbles explain the hackathon for around 90 engineers and the turn towards building capabilities and technical teams. |
| `map` | Survey markers and a faint trail become a connected route. |
| `selfservice` | Queued packages wait at the start of the pipeline. The choice coin enables self-service and sends the packages through to completion. |
| `simplify` | A laptop connects to a Microsoft Azure cloud. Apps, Data and Services start scattered and tilted with tangled connections; collecting the coin aligns the cards, untangles the links and turns the status indicators green. Reduced motion shows the organised state immediately. |
| `converge` | The existing skyline windows light up in sequence as the engineering capability grows. |
| `repositories` | Shared structure markers reveal themselves across the repository platforms. |
| `governance` | Labelled Practices, Quality, Security and Delivery boxes align and a shared path appears. |
| `leadership` | Collecting the coin brings three engineers running in from beyond the right edge of the viewport to the workstations; each turns a red status light green on arrival, then their shared output takes shape. |
| `ecosystem` | Small signals travel along the labelled web connecting People, Practices, Platforms, Quality, Governance, Delivery and Customers. |
| `personal` | The piano banner plays a sequence of highlighted keys; Emma and the cats respond to their introduction coins. |
| `finale` | People and objects from visited sections return at the bridge. |

Use events with the matching scenery from the existing sections. They add decoration and animation while the configured platforms remain the collision geometry.

Available `atmosphere` values are `morning`, `terminal`, `workshop`, `meadow`, `industrial`, `enterprise`, `dusk` and `horizon`. Colours transition between sections. Terminal scenery is enclosed; enterprise scenery has a skyline. HUD text automatically uses black or white for contrast during transitions.

The main journey keeps narrative in story bubbles and section signs. Labels on the organisation web, governance boxes and Azure cloud explain those diagrams; terminal screens retain their configured display. Extra people and floating captions are hidden, except the coin-triggered leadership engineers, Emma in the personal section, and the callback ending. `characters` remains accepted as legacy metadata. The ending cast is now configured explicitly in the last section’s `ending.cast`, rather than choosing names from visited sections.

Keep each coin to one memorable idea. The current journey uses fewer, shorter bubbles; the original longer copy is preserved in each section's optional **`details`** field for the timeline. Edit `details` too when changing the underlying facts, or omit it to let the timeline use the coin text instead.

### Computer screens

For the paired computers (`scenery: "computer"` or `"workshop"`), add this to the section:

```js
computers: {
  screen: "terminal",
  scrollSpeed: 10,
  lines: ["READY.", "> LOAD IDEAS", "HELLO, WORLD!", "> KEEP LEARNING"]
}
```

This draws black screens with green text continuously scrolling upward. The two screens start at different lines. `scrollSpeed` is pixels per second (0–40); zero gives a static screen. Text wraps at 16 characters to fit the small display. Reduced-motion preferences stop scrolling. Omitting `computers`, or using `screen: "symbol"`, retains the original symbol screens. The same option also works on the monitors in `"team"` scenery.

The Discovering technology section already uses terminal screens. Edit its `lines` to change what they say.

### Defaults

- `sectionWidth`: 1050, unless a section overrides it; grows when needed.
- `minCoinSpacing`: 160; controls the minimum horizontal distance between coins.
- `coinHeight`: 28; used when an individual coin omits height.
- `imagePixels`: 64; used when a building omits imagePixels.

Invalid IDs, missing names/content and out-of-range values produce a configuration message on the title screen. Run `node tests/journey-config.test.cjs` to check configuration and generated placement after editing.

The personal section also includes matching banners for musical theatre, Kansas City Chiefs and piano, plus Emma running in from offscreen after her introduction coin is collected. She stops on Phil’s right, clear of the cats. Edit the `Meet Emma.` coin in `story.js` to personalise her introduction.

### Maggie and Matilda

Add `action: "meetCats"` to their coin to summon the cats when it is collected. This is already configured in the personal section. The cats run towards Phil; stop on the ground nearby and he bends down to stroke them. Walking, jumping or climbing immediately resumes normal movement. After Emma has been introduced, leaving Outside Work makes her settle with a cat toy and the cats gather around her. Return to the section to resume their greeting. Everyone stays within their section, and Restart resets both interactions. If a long bubble splits into several coins, only the first triggers the greeting.

## Presenting

Start, then use ← → to move, Space to jump, and ↑ / ↓ to climb. Up also jumps away from ladders. Touch controls offer the same actions. Release a ladder to hold safely; there are no hazards or permanent falls. Coins reveal speech bubbles automatically; pause movement to read them. At the end, Phil stops one equal space after Teacher, Engineer, Team Builder and Leader. The last bubble appears automatically, even if earlier coins were skipped, and a right-pointing More about me link leads to the main site. The scene stays visible.

**Present** requests fullscreen, with a layout fallback if fullscreen is unavailable. Use Escape or **Exit presentation** to leave it. **Restart** resets coins, events and effects. Sound starts off. **View journey as timeline** provides all the content without movement.

Presenter navigation is available without replaying the world:

- **[ / ]**: previous / next section while the canvas has focus.
- **Home / End**: first / last section.
- The section selector and ◀ / ▶ buttons offer the same navigation on touchscreens.

Navigation clears held movement, places Phil safely at the selected entrance, and retains collected coins and completed events. It hides the previous bubble until another coin is collected.

## Ending lineup

The final section’s `ending.cast` contains four entries with `name`, optional `outfit` and optional `color`. It currently reads Teacher, Engineer, Team Builder and Leader. Change these in `story.js` to rename or dress the figures. `ending.playerName` controls the label above Phil.

The compiler places all five figures 100 game pixels apart. The final section’s last coin supplies the last bubble; it is revealed automatically at Phil’s stopping point, without a floating token or modal dialog. Earlier final-section coins remain normal pickups. The desktop camera frames the lineup, while narrow screens follow Phil and keep the invitation in view. Use Restart or presenter navigation to leave the stopping pose and explore again. The More about me link in `journey.html` uses Jekyll’s `relative_url` filter to point to the existing home/About Me page.

## Files and checks

- `story.js`: editable sections and defaults.
- `world.js`: validates configuration and computes sections, platforms and coin positions.
- `portraits.js`: local image loading, pixel conversion and caching.
- `scenes.js`: quiet section events, atmospheres and the callback ending.
- `cats.js`: coin-triggered cat movement and the petting interaction.
- `game.js`: movement, rendering, stable bubbles and presentation controls.
- `journey.css`: responsive styles; `journey.html` and `_layouts/journey.html`: Jekyll integration.

All JavaScript files live in `assets/journey/`. No npm, external fonts, remote images, runtime APIs, analytics or backend are needed. The existing website retains its layout and theme.

Run:

```sh
node tests/journey-config.test.cjs
node tests/journey-scenes.test.cjs
node tests/journey.test.cjs
JOURNEY_MOBILE=1 JOURNEY_REDUCED_MOTION=1 node tests/journey.test.cjs
```

Tests cover section ordering and automatic extension/spacing, coin heights, preserved content, configuration validation, image colour reduction/fit/caching/failure fallback, baseurl paths, all configured coins/platforms, camera stability, every scene before/after activation, readable atmosphere transitions, reduced motion, ending, cat greeting/petting/reset, restart, presenter navigation, timeline and touch controls. The interaction tests use a simulated DOM and do not replace browser or visual checks.

For full-site verification use a compatible Jekyll environment with `jekyll-remote-theme`, then run `jekyll build` and `jekyll build --baseurl /preview`. The local Ruby installation previously blocked that build. No browser was connected for visual testing. Before presenting, check the actual laptop/projector and phone, including your supplied images, text size, fullscreen exit and sound.

## Phil’s outfits

Set `defaults.outfit` in `story.js` to `"casual"`, `"suit"`, `"hoodie"`, `"hiking"`, `"chiefs"` or `"graduation"`. These provide a blue shirt, dark suit with shirt and tie, green hoodie, hiking clothes with a backpack, red KC jersey, or graduation gown with mortarboard and a held scroll.

Set `outfit` on an individual section to override the default for that section. The university uses `"outfit": "graduation"`. The leadership section currently uses `"outfit": "suit"`; remove that line to use the default there. Clothes apply while walking, jumping, climbing and crouching with the cats. Reduced motion keeps the walking pose still.

Characters and cats use rounded silhouettes. Walking keeps arms close to the torso and moves the legs through a forward stride. Section animations stay within the existing scenery; they add no extra story captions or background crowds. Reduced motion freezes repeated movement and shows completed section changes immediately.

The Consulting chapter sits between Kyckr and Specsavers. Section order in `story.js` controls the chronology; coins and animations are positioned automatically. Its building image is `null` until you add a suitable local image.

Rendering uses separate passes for section scenery, solid routes, characters, collectible markers and collection feedback. Section scenery is clipped to its own boundaries; characters moving in from offscreen are drawn by their actual positions. Diagram connections sit behind their nodes and labels. Governance connectors follow the boxes throughout alignment, and hackathon contributions ease into the shared demo. Hobby banners sit clear of the elevated park platform.
