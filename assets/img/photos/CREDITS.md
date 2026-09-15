# Photo credits

All four photographs are Polish subjects sourced from Wikimedia Commons. Three
are **CC BY**, which makes the footer credit line a licence obligation rather
than a courtesy; the fourth is **CC0** and is credited anyway, as on the other
pages. The line is rendered from the `data-photo-credit` element and generated
from `PHOTO_CREDIT` in `_tooling/localise_pl.py`. If you swap any photo, update
this file **and** that constant, then re-run `localise_pl.py`, `assemble.py
poland` and `build_unipage.py poland`.

CC BY-SA, NC and ND images were deliberately avoided, as on the other eleven
pages. That rule is more expensive in Poland than anywhere else in this set:
the great majority of high-resolution Polish city and monument photography on
Commons is **CC BY-SA 3.0 PL**, the licence Wiki Loves Monuments Poland uses.
Every frame delivered here had to be re-searched several times to find a CC BY
or CC0 equivalent. Both files are cropped and resized, which makes them
adaptations, and ShareAlike would then reach the adaptation.

Each file was cropped and resized from the Commons original with `sips`. The
output dimensions match the UAE, Malaysian, Singapore, French, Australian, New
Zealand, German, Irish and Canadian files, which in turn match the slots, so
the layout cannot shift.

The four subjects sit in **three distinct cities** — Warsaw, Wrocław and
Poznań. Warsaw appears twice, which is a deliberate departure from the "four
different cities" spread most of these pages keep: it is the capital, the seat
of the Office for Foreigners, and the two Warsaw frames do not repeat each
other at all — one is a winter tower skyline shot from the air, the other a
formal 18th-century park at ground level in summer.

**No photograph has an identifiable person as its subject** — the same rule the
other eleven pages follow. It cost two otherwise excellent candidates here, and
both rejections are worth recording because they are the kind of thing that is
easy to wave through at thumbnail size:

* `File:02024 0143 Main Market Square in Kraków.jpg` (CC0, 4928×3264) was the
  first choice for the hero — the Main Market Square is the archetypal image of
  a Polish student city, and Kraków is where the Jagiellonian University is.
  Rejected: a couple stands in the immediate foreground **facing the camera**,
  close enough that both faces are fully resolvable at the delivered size.
* `File:Ogród Saski Warszawa 01.jpg` (CC0, 4000×3000, exactly the 4:3 the
  family slot needs) was the first choice for `family.jpg`. Rejected on a
  magnified check: what reads as an anonymous scattering of park visitors at
  900 px is, at full resolution, a tour group of a dozen people at moderate
  distance with several faces clearly resolvable. **Magnify the region before
  accepting a frame with people in it** — the thumbnail is not evidence.
* `File:Wawel castle.jpg` (CC BY 3.0) was the third candidate for the hero and
  was rejected for a different reason: besides a large tour crowd in the
  courtyard, the frame carries orange construction plant and roadworks across
  the middle distance. It is the same defect that got Al Fahidi dropped from
  the UAE page — the frame reads as a monument mid-renovation.

---

## students-campus.jpg — hero (`#home`), 1200×1143

> **The filename does not describe the subject**, and it is kept because
> `students-campus.jpg` is a literal key in the compiled stylesheet — the class
> `bg-[url('/assets/img/photos/students-campus.jpg')]` plus the matching escaped
> selector and `url()` in `assets/css/main.css`, and the `<link rel="preload">`
> in the page shell. Renaming the file means editing all of those together;
> `verify_site.py` fails on a mismatch, the browser fails silently.

- **Depicts:** central Warsaw at sunrise in winter, from the air — the Palace of
  Culture and Science in the centre, the Warsaw Spire, Varso Tower, Złota 44 and
  the Rondo ONZ cluster around it, snow on the ground.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:Skyline_of_Warsaw,_Poland.jpg
- **Author / photographer:** Quintin Soloviev
- **Licence:** CC BY 4.0 — https://creativecommons.org/licenses/by/4.0
- **Attribution required:** **yes** (and CC BY 4.0 also requires indicating that
  changes were made, which the credit line does: "Cropped and resized.")
- **Crop:** original 7740×5160 (exactly 1.5:1) → `sips -c 5160 5417
  --cropOffset 0 2323` (1.0499:1) → resized to 1200×1143, quality 82.
- **Why an offset crop and not a centred one:** the Palace of Culture sits at
  roughly 68% of the original width, so a centred near-square crop clips it. The
  crop is pushed to the right-hand limit (x=2323, the maximum that still fills
  the width), which lands the Palace at about 54% of the delivered frame —
  effectively centred — and drops the low-rise western edge instead.
- **Why 1.05:1 and not 3:2:** the hero panel measures about **596×584 CSS px on
  desktop (1.02:1) and 319×292 on mobile (1.09:1)** — essentially square at
  every breakpoint. The div is `bg-cover bg-center`, so a 1.5:1 file would have
  a third of its width thrown away. A near-square crop suits this subject
  unusually well, because the Palace of Culture is a single vertical spike — the
  same reason the UAE page crops the Burj Khalifa this way and the Malaysian
  page the Petronas Twin Towers.
- **Safe to reshape:** referenced only as a CSS `background-image` and a
  `<link rel="preload">` — there is no `<img>` tag for it on either page, so its
  ratio has no effect on layout.
- **No people:** it is an aerial frame at sunrise. There is no figure anywhere
  in it at any magnification.

## team-working.jpg — `#relocate` ("The Pathway to Settlement"), 1400×933

- **Depicts:** the Old Market Square in Poznań — the Renaissance town hall in
  the centre, the row of restored burgher houses along the western side, and the
  Bamberka fountain in the foreground.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:Stary_Rynek_Poznań_panorama.jpg
- **Author / photographer:** Borzpoz
- **Licence:** CC0 — https://creativecommons.org/publicdomain/zero/1.0
- **Attribution required:** no (credited anyway)
- **Crop:** original 6379×3569 (1.7873:1) → `sips -c 3569 5354 --cropOffset 0
  1025` (exact 3:2) → resized to 1400×933, quality 82.
- **Note:** this image is rendered with `w-full h-auto object-cover`, so **its
  aspect ratio drives the layout**. Any replacement must also be 3:2.
- **Why Poznań for the settlement panel, and not the capital:** every other page
  in this set puts the seat of the deciding authority in this slot — Putrajaya
  on the Malaysian page, Canberra on the Australian, Abu Dhabi on the UAE one.
  **Poland has no single seat to photograph.** A temporary residence permit is
  decided by the **voivode of the province you live in** — sixteen separate
  offices — and the Office for Foreigners in Warsaw is the appeal body, not the
  decision-maker. So the honest subject for "The Pathway to Settlement" is a
  city a graduate might actually settle in rather than an office they will never
  visit, and Poznań is one of the country's largest university cities.
- **People:** a strip of pedestrians runs along the bottom edge of the square at
  distance. Checked at full resolution: nobody is a subject of the frame, no
  face resolves, and the crop's vertical framing puts the town hall, not the
  pavement, at the centre.

## family.jpg — `#relocate` ("Relocating with Your Family?"), 1400×1050

- **Depicts:** Łazienki Royal Park in Warsaw — mown lawn and gravel paths, two
  Roman busts on ivy-grown plinths, park benches along a low balustrade, and the
  edge of one of the park's garden pavilions on the right.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:Łazienki_Królewskie_-_panoramio_(11).jpg
- **Author / photographer:** Mister No
- **Licence:** CC BY 3.0 — https://creativecommons.org/licenses/by/3.0
- **Attribution required:** **yes**
- **Crop:** **none.** The original is 3072×2304, which is exactly 4:3, so it was
  only resized to 1400×1050 at quality 82. Nothing is cropped away.
- **Why a public park, and specifically this one:** the slot sits under
  "Relocating with Your Family?", where the copy's actual condition is that
  reunification needs **two years of consecutive residence permits** — so the
  frame has to say *living here*, not *visiting here*. Łazienki is Warsaw's
  largest park and the one families in the city actually use at the weekend;
  the benches and the kept lawn carry that better than a monument would. This
  is the same reasoning that put Zabeel Park in this slot on the UAE page.
- **No people:** checked at full resolution. The frame is empty of figures — the
  only human forms in it are the two stone busts and a distant garden statue.

## poland-city.jpg — `#universities` ("Why Poland?") background panel, 1400×933

> Referenced by the Tailwind arbitrary-value class
> `bg-[url('/assets/img/photos/poland-city.jpg')]`, which is a **literal key**
> into `assets/css/main.css`. Both the class in the HTML and the escaped
> selector plus `url()` in the stylesheet must be changed together — this file
> was repointed from `uae-city.jpg` when the shared CSS was copied over.

- **Depicts:** Ostrów Tumski, the cathedral island in Wrocław, floodlit at night
  and reflected in the Oder — the twin spires of the Cathedral of St John the
  Baptist on the right, the Church of the Holy Cross on the left.
- **Commons file page:** https://commons.wikimedia.org/wiki/File:Ostrów_Tumski_Wrocław.jpg
- **Author / photographer:** Jg44.89
- **Licence:** CC BY 4.0 — https://creativecommons.org/licenses/by/4.0
- **Attribution required:** **yes**
- **Crop:** **none.** The original is 4485×2990, which is exactly 3:2, so it was
  only resized to 1400×933 at quality 82.
- **Why Wrocław and not a second Warsaw frame:** the hero is already Warsaw, and
  this panel sits behind "Why Poland?" — the question a student is actually
  weighing. Wrocław is one of Poland's largest student cities, with the
  University of Wrocław and Wrocław University of Science and Technology (both
  QS-ranked, at #7 and #9 in this directory) plus several more institutions in
  the same directory; a reader could genuinely live and study in the frame.
- **No people:** a long-exposure night shot across the river. There is no figure
  in it.
