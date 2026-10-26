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

## Why Poland card photos (added 2026-10-12)

Three Why Poland cards that previously had only an icon now carry a photo.
Same rules as above: CC0 / CC BY only (no SA, NC or ND), and no identifiable
person as the subject. Each was resized to 800px wide; the Warsaw Spire frame
also had its bottom 5% cropped to remove the photographer's corner watermark.

| File | Card | Source | Author | Licence |
| --- | --- | --- | --- | --- |
| `why-degrees.jpg` | 02 Affordable, EU-recognised degrees | [Collegium Novum, Jagiellonian University, Kraków](https://commons.wikimedia.org/wiki/File:Jagiellonian_University_Collegium_Novum,_1882_designed_by_Feliks_Ksi%C4%99%C5%BCarski,_24_Go%C5%82%C4%99bia_street,_Old_Town,_Krak%C3%B3w,_Poland_(1).jpg) | Igor123121 | CC BY 4.0 |
| `why-work.jpg` | 04 Work with no weekly cap | [Warsaw Spire, Poland 23 June 2016](https://commons.wikimedia.org/wiki/File:Warsaw_Spire,_Poland_23_June_2016.jpg) | AGC Glass Europe | CC BY 2.0 |
| `why-research.jpg` | 06 Doctoral schools that fund you | [Close-up of the testing tubes with microscope](https://commons.wikimedia.org/wiki/File:Close-up_of_the_testing_tubes_with_microscope_in_a_blurry_background.jpg) | Shixart1985 | CC BY 2.0 |

The research photo is a generic laboratory still life rather than a Polish
subject: no CC0 / CC BY photograph of a Polish laboratory or reading room
without people in frame turned up. The footer credit line in `index.html` was
updated by hand; if `_tooling/localise_pl.py` regenerates it, add these three
to its `PHOTO_CREDIT` constant too.

## Hero photographs, HD (added 2026-10-12)

Five iconic views for the first section, in `assets/img/photos/hero/`, each saved at
2560px (desktop) and 1280px (`-1280`, phones) wide. Same licence rule as above: CC0 / CC BY
only, and no identifiable person as the subject.

| File | Subject | Source | Author | Licence |
| --- | --- | --- | --- | --- |
| `warsaw-old-town.jpg` | Castle Square and the Old Town, Warsaw, by night | [Warsaw Old Town (52278170319)](https://commons.wikimedia.org/wiki/File:Warsaw_Old_Town_(52278170319).jpg) | Radek Kucharski | CC BY 2.0 |
| `gdansk-crane.jpg` | The medieval crane on the Motława, Gdańsk | [Gdańsk Żuraw Gdańsk](https://commons.wikimedia.org/wiki/File:Gda%C5%84sk_%C5%BBuraw_Gda%C5%84sk.jpg) | Sylwiadek | CC BY 3.0 |
| `krakow-wawel.jpg` | Wawel Castle above the Vistula, Kraków | [Wawel Wisła from Above](https://commons.wikimedia.org/wiki/File:Wawel_Wis%C5%82a_from_Above.jpg) | Galileo01 | CC0 |
| `malbork-castle.jpg` | Malbork Castle across the Nogat | [Panorama of Malbork Castle - Edit Taxi](https://commons.wikimedia.org/wiki/File:Panorama_of_Malbork_Castle_-_Edit_Taxi.jpg) | DerHexer; derivative by Wladyslaw | CC BY 3.0 |
| `morskie-oko.jpg` | Morskie Oko, Tatra Mountains, at dawn | [Morskie Oko o poranku](https://commons.wikimedia.org/wiki/File:Morskie_Oko_o_poranku.jpg) | Aneta Pawska | CC BY 3.0 |

The footer credit line in `index.html` names all five.

## University skyline photographs (added 2026-10-24)

Twelve campus photographs for the "Top ranked universities" skyline on the home page, one
per QS-ranked university, in `assets/img/photos/unis/`. Same rules as above: CC0 / CC BY
only (no SA, NC or ND), and no identifiable person as the subject. Each was taken from
Commons' 1600px render and resized to fit within 960×1200 at quality 76. They are shown
with `object-fit: cover`, so their shape does not affect layout; the focal point for each
narrow panel is set in `SKY_PHOTOS` in `assets/js/main.js`, which also holds the credit
shown in the card. The footer credit line names all twelve.

| File | University | Subject | Source | Author | Licence |
| --- | --- | --- | --- | --- | --- |
| `uw.jpg` | #1 University of Warsaw | Main gates on Krakowskie Przedmieście, by night | [University gates (22022358368).jpg](https://commons.wikimedia.org/wiki/File:University_gates_%2822022358368%29.jpg) | Thomas Quine | CC BY 2.0 |
| `uj.jpg` | #2 Jagiellonian University | Collegium Maius facade, Jagiellońska Street, Kraków | [Jagiellonian University, Collegium Maius facade, 15 Jagiellońska Street, Old Town, Kraków, Poland.jpg](https://commons.wikimedia.org/wiki/File:Jagiellonian_University%2C_Collegium_Maius_facade%2C_15_Jagiello%C5%84ska_Street%2C_Old_Town%2C_Krak%C3%B3w%2C_Poland.jpg) | Igor123121 | CC BY 4.0 |
| `pw.jpg` | #3 Warsaw University of Technology | Main Building atrium and glass roof | [2025 Warszawa Gmach Główny Politechniki Warszawskiej, wnętrze, 1.jpg](https://commons.wikimedia.org/wiki/File:2025_Warszawa_Gmach_G%C5%82%C3%B3wny_Politechniki_Warszawskiej%2C_wn%C4%99trze%2C_1.jpg) | Cybularny | CC BY 4.0 |
| `amu.jpg` | #4 Adam Mickiewicz University | Collegium Minus, Poznań | [Collegium Minus w Poznaniu 03.jpg](https://commons.wikimedia.org/wiki/File:Collegium_Minus_w_Poznaniu_03.jpg) | Аимаина хикари | CC0 |
| `agh.jpg` | #5 AGH University of Krakow | Main building A0, al. Mickiewicza | [Agh cracow a0 building.JPG](https://commons.wikimedia.org/wiki/File:Agh_cracow_a0_building.JPG) | Zyxist | CC0 |
| `pg.jpg` | #6 Gdańsk University of Technology | Main Building at night | [Gdańsk University of Technology.jpg](https://commons.wikimedia.org/wiki/File:Gda%C5%84sk_University_of_Technology.jpg) | Asik29 | CC BY 4.0 |
| `uwr.jpg` | #7 University of Wrocław | Collegium Maximum (main building) | [Wrocław, Collegium Maximum (4).jpg](https://commons.wikimedia.org/wiki/File:Wroc%C5%82aw%2C_Collegium_Maximum_%284%29.jpg) | Palickap | CC BY 4.0 |
| `ug.jpg` | #8 University of Gdańsk | Faculty of Social Sciences, Oliwa campus | [Gdańsk Oliwa - Uniwersytet Gdański Wydział Nauk Społecznych.JPG](https://commons.wikimedia.org/wiki/File:Gda%C5%84sk_Oliwa_-_Uniwersytet_Gda%C5%84ski_Wydzia%C5%82_Nauk_Spo%C5%82ecznych.JPG) | Artur Andrzej | CC0 |
| `pwr.jpg` | #9 Wrocław University of Science and Technology | Main building entrance | [Wrocław, Budynek główny Politechniki Wrocławskiej 00565.jpg](https://commons.wikimedia.org/wiki/File:Wroc%C5%82aw%2C_Budynek_g%C5%82%C3%B3wny_Politechniki_Wroc%C5%82awskiej_00565.jpg) | Daniel.zolopa | CC BY 4.0 |
| `pk.jpg` | #10 Cracow University of Technology | Environmental Aerodynamics Laboratory at dusk | [Laboratorium Aerodynamiki Środowiskowej PK.jpg](https://commons.wikimedia.org/wiki/File:Laboratorium_Aerodynamiki_%C5%9Arodowiskowej_PK.jpg) | Politechnika Krakowska | CC0 |
| `pl.jpg` | #11 Lodz University of Technology | Institute building (IFE) | [2023 Lodz IFE.jpg](https://commons.wikimedia.org/wiki/File:2023_Lodz_IFE.jpg) | Qasinka | CC0 |
| `umk.jpg` | #12 Nicolaus Copernicus University | Collegium Maximum, Toruń | [Collegium Maximum Uniwersytetu Mikołaja Kopernika w Toruniu.jpg](https://commons.wikimedia.org/wiki/File:Collegium_Maximum_Uniwersytetu_Miko%C5%82aja_Kopernika_w_Toruniu.jpg) | Bydgoszczanin z miłości | CC BY 4.0 |

People checks, each made at full resolution:

* `agh.jpg` — a pedestrian walks along the left edge of the original. The left 22% of
  the frame was cropped away, which removes him.
* `uwr.jpg` — a group of visitors stands at the entrance along the bottom of the
  original, several facing the camera. The bottom 18% was cropped away.
* `amu.jpg` — one tiny figure at the entrance at distance; no face resolves. Uncropped.
* Rejected: `File:Budynek Wydziału Architektury PK.jpg` (CC0) was the first choice for
  Cracow University of Technology. Students sit on benches along the path in the middle
  distance and several faces resolve clearly, so it was replaced by the laboratory frame.

## Image formats (added 2026-10-26)

For page speed, every photo above also ships as WebP beside its JPEG (same name, `.webp`),
served through `<picture>` with the JPEG as the fallback; the hero photos also have a
1920px size (`-1920.jpg` / `-1920.webp`) between the 1280 and 2560 ones. The section and
hero JPEGs were re-saved as progressive JPEGs at a lower quality. These are further
resizes and re-encodes of the same files: the credits and licences above apply unchanged,
and the footer's "Cropped and resized" still covers them.
