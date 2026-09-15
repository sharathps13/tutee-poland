# Tutee Connect — Study in Poland

The twelfth destination page. A faithful clone of the deployed reference site's
layout, markup, compiled stylesheet and every animation, with the content
localised from the UK page to Poland. Nothing about the DOM, the Tailwind
classes or the motion was redesigned.

The content spec is `../_tooling/POLAND_SPEC.md`. Read it before changing any
factual claim on the page.

## Build

Everything here is **generated**. Editing `index.html`, `universities.html`,
`assets/js/main.js`, `assets/js/services-data.js` or
`assets/js/universities-data.js` in place gets overwritten on the next build.

```bash
cd "../_tooling"
python3 build_dataset_pl.py      # POLAND/assets/js/universities-data.js from the registers
python3 localise_pl.py           # fragments-poland/ + this site's main.js and services-data.js
python3 assemble.py poland       # index.html
python3 build_unipage.py poland  # universities.html
python3 verify_site.py poland    # static checks
python3 check_twins.py poland    # nodes handed through from the UK unchanged
```

Local preview: double-click `Start Local Server.command`, or run all twelve
sites together with `../Start All Sites (Background).command` — Poland is on
**http://localhost:8011**.

## The directory: 227 institutions, and why not 348

This is the page's one genuinely unusual fact, and it drives everything else.

Poland's register lists **348 operating higher education institutions**. Only
**242** of them may legally admit an international student, and after dropping
those with nothing to enrol in and two that cannot take a public applicant, the
directory lists **227**.

Since **1 July 2025**, under art. 144 ust. 4 of the Act on Foreigners, a unit
conducting studies must be **approved by the Minister of the Interior and
Administration (MSWiA)** before it may admit a foreigner for studies, unless
art. 144 ust. 5 exempts it. The transitional period for non-public universities
ran out on **30 June 2026**. A temporary residence permit for studies **cannot
be granted** for a course at a unit that is neither approved nor exempt.

So the approval **is** the permission — the same relationship CRICOS
registration has in Australia and an EMGS listing has in Malaysia. And unlike
either of those, it excludes a large minority of the country's own universities:

| | |
|---|---|
| operating higher education institutions on the register | **348** |
| − neither statutorily exempt nor MSWiA-approved | −106 |
| = may admit an international student | **242** |
| − no study programme the register records as *prowadzone* | −13 |
| − cannot take a public applicant (see below) | −2 |
| **= listed here** | **227** |

Those 106 are real, state-registered Polish universities. Listing them would
make the reference card's hardcoded **"Intl. Admits: Yes"** false almost a third
of the time, and would send a reader to a place that cannot get them a permit.

**The least intuitive consequence:** a *public* university can be one of the
106. The exemption in ust. 5 pkt 1 covers public **academic** universities only,
so a public **vocational** institution (an *uczelnia zawodowa*) has to apply
like a private one. Sixteen have; sixteen have not.

## The register itself

Two official sources, answering two different questions.

**POL-on**, the Integrated System of Information on Science and Higher
Education kept by the Minister of Science and Higher Education, answers *which
institutions exist*. Taken from its RAD-on open-data API:

* `https://radon.nauka.gov.pl/opendata/polon/institutions` — 836 rows
* `https://radon.nauka.gov.pl/opendata/polon/courses` — 11,567 study programmes
* snapshots: `../_tooling/reference/polon-institutions.json`,
  `../_tooling/reference/polon-courses.json` (**captured 2026-09-04**)

**The MSWiA list** answers *which of them may admit a foreigner*:

* *Lista jednostek prowadzących studia zatwierdzonych na potrzeby przyjmowania
  cudzoziemców* — 137 rows, **as at 17 July 2026**
* snapshot: `../_tooling/reference/mswia-approved-study-units.docx`
* published at
  `https://www.gov.pl/web/mswia/zloz-wniosek-o-zatwierdzanie-jednostki-na-potrzeby-przyjmowania-cudzoziemcow`

The MSWiA file is the **cumulative current** list, not one of the annual
*obwieszczenia* in the ministry's official journal. That matters: the annual
notices only cover approvals granted in one calendar year, so approvals granted
in 2026 — the deadline year, when most non-public universities applied — would
not appear in one until April 2027. The builder asserts the file still carries
its "stan na dzień 17 lipca 2026" stamp, so a newer capture cannot be joined
against assumptions drawn from this one.

### The thirteen with nothing to enrol in — and why that is not editorial judgement

The fourth filter is Australia's "providers with no live course" rule: keep only
institutions with at least one study programme the register itself records as
`prowadzone` (being conducted).

It does a job that looked as though it would need a judgement call. **All eleven
Polish seminaries and higher theological institutes have zero programmes in
POL-on**, because they teach inside the churches' own system rather than as
registered *kierunki studiów*. Every one of them is statutorily exempt from
MSWiA approval (ust. 5 pkt 4 covers universities run by churches whose relations
with Poland are governed by a treaty or a statute), so all eleven would
otherwise have been listed — and a seminary admits only candidates for
ordination presented by a diocese or an order, which the card's "Intl. Admits:
Yes" would flatly misdescribe. The register's own programme inventory removes
them without anyone deciding anything.

The same filter removes the Centre for Postgraduate Medical Education, which
runs no degree programmes, and the Military Medical Academy, dissolved into the
Medical University of Łódź in 2002.

### The two that are editorial, and the eight that deliberately are not

Only two institutions are excluded by judgement. Both are asserted in
`build_dataset_pl.py`, so if either leaves the register the build fails rather
than quietly dropping a stale exclusion.

| institution | reason |
|---|---|
| **Wyższa Szkoła Straży Granicznej** (Koszalin) | Its published recruitment rules admit **only sworn Border Guard officers** — 40 full-time and 40 part-time places a year, and a graduate is commissioned as a Border Guard ensign. No route exists for a public applicant. This is Germany's Verwaltungshochschulen case exactly. |
| **Prawosławne Seminarium Duchowne w Warszawie** | Formation for Orthodox clergy. It is the one Polish seminary with a registered programme, so the filter above does not reach it; admission still runs through the Church. |

**Poland's military and state-service universities are kept**, and the reasoning
is the opposite of the German decision — worth recording, because the instinct
is to treat "service academy" as a category:

Wojskowa Akademia Techniczna (74 programmes), Akademia Marynarki Wojennej (39),
Akademia Sztuki Wojennej (37), Akademia Wojsk Lądowych (16), Lotnicza Akademia
Wojskowa (13), Akademia Pożarnicza (12), Akademia Policji w Szczytnie (9) and
Akademia Wymiaru Sprawiedliwości (5) all run **civilian degree tracks** (*studia
cywilne*) alongside their service tracks, open to applicants who are not in
uniform. The German Verwaltungshochschulen have no such track — entry there is a
civil-service traineeship. **"Runs a uniformed programme" and "admits only the
uniformed" are different facts.**

### The join, which is where the bugs were

The MSWiA list is a DOCX table; POL-on is JSON. Three traps, all of which bit
during the build and all of which are now handled in `build_dataset_pl.py`:

1. **A DOCX line break inside a table cell arrives as no separator at all** —
   `TWPw Szczecinie`, `CzłowiekaPolskiej Akademii Nauk`. A repair regex that
   inserts a space before a standalone `w` also splits real words (`Podstaw` →
   `Podsta w`, `Finansów` → `Finansó w`). The fix is to compare
   **space-insensitively** rather than guess where the spaces went.
2. **The two registers spell the place differently, or leave it off** —
   `Akademia Leona Koźmińskiego` against `… w Warszawie`, `Collegium Da Vinci w
   Poznaniu` against `… z siedzibą w Poznaniu`, `w Gorzowie Wielkopolskim`
   against `w Gorzowie Wlkp.`. Strip the trailing place phrase from **both**
   sides, then break ties with the city in the approval's own address.
3. **A near-miss match is worse than no match.** A `difflib` pass at a 0.90
   cutoff confidently mapped `Wyższa Szkoła Technologii Informatycznych` onto
   `Wyższa Szkoła Techniczno-Ekonomiczna w Świdnicy` — a **liquidated**
   institution in a different province. Fuzzy matching was removed; the four
   residuals are hand-mapped in `MANUAL` and each is asserted.

One more: six approved units resolve to a POL-on row marked `Przekształcona`
(transformed). An approval attaches to the institution that now exists, so the
builder follows POL-on's own `targetInstitutions` chain to the successor — which
is how Gdańska Szkoła Wyższa and Menedżerska Akademia Nauk Stosowanych both
arrive at Akademia Finansów i Biznesu Vistula.

## What is real data here, and what is not

**Real, straight off the registers:**

* `name` — the registered name, in Polish, exactly as POL-on holds it.
* `location` — the registered city and province. Cities keep their Polish
  spelling and diacritics; **Warszawa** is rendered **Warsaw**, the one settled
  English exonym in current use. **Kraków keeps its accent** — "Cracow" is
  archaic, and an anglicised *Krakow* beside an accented *Wrocław* in one list is
  the UAE page's mixed-spelling defect in another costume.
* `programmes` — how many study programmes the register currently records as
  `prowadzone` for that institution. A real count, like Ireland's, **not** a
  placeholder like the UK page's `offerRate`.
* `programs` — the institution's largest subject areas, as ISCED-F 2013 broad
  fields derived from the register's own field code on each of its live
  programmes. Real data, not a hand-written descriptor. The register's own
  "field unknown" code (218 programmes nationally) is dropped rather than
  guessed at.
* `type` — the register's two statutory flags, with the 10 IDUB institutions
  raised to their own group.

**Editorial, and marked as such in the generated file:**

* `alt` — English names, **searched but never rendered**. POL-on holds no
  English names at all, so for the ranked 20 this is the name QS itself prints
  and for the tail it is derived by rule (`Uniwersytet` → University,
  `Politechnika` → University of Technology, `Akademia Nauk Stosowanych` →
  University of Applied Sciences). Without it the directory is unusable for an
  applicant who only knows "Warsaw University of Technology". It also carries
  the inflected city form the institution's own name uses (`w Krakowie` against
  the register's `Kraków`), because that is what a user types.

**What `programmes` is not:** it is a **breadth** figure. It counts distinct
programmes on the register, not programmes taught in English, and it says
nothing about quality. Uniwersytet Warszawski shows 282 and a small specialist
academy shows 4 — that is a difference in size and scope, and the card label
says "Study programmes" for exactly that reason. This is the caveat Finland's
`programmes` field needed too: real data still needs a label that says what it
is not.

## Ranking: QS World 2027, and IDUB is a different set

**QS World University Rankings 2027** (published 18 June 2026) covers exactly
**20** Polish institutions — comfortably more than the 12 cards the home-page
carousel renders, each of which carries a hardcoded `Rank #N` badge. So **no
card is rebadged**, as on the UAE page, and unlike New Zealand (8 universities
total) and Singapore (4 ranked). The **world** table is used; Poland has neither
Ireland's nor Finland's problem, so there was no reason to reach for QS Europe.

`localise_pl.py` asserts that all twelve cards land on QS-ranked institutions,
so a future dataset cannot silently assert a position an institution does not
hold.

The `type` field separately marks the **10 research universities** designated by
the Ministry's **Excellence Initiative — Research University (IDUB)**
competition (first round, October 2019). This is Poland's Russell Group / TU9
analogue and it is deliberately **not** the same set as the QS-ranked twenty:

* **Gdański Uniwersytet Medyczny** is an IDUB research university that QS does
  not rank at all (it is #21 here, the first unranked entry).
* **Politechnika Krakowska** is QS-ranked (#10) and is not IDUB.

Keeping `rank` and `type` independent is what lets both be true.

## Country-specific build notes

* **Currency: the złoty (PLN).** Poland is in the EU and **not** in the euro
  area, so a `€` figure is as wrong here as a `$` one. lucide has no złoty
  glyph, so `swap_currency: 'zloty'` maps to the currency-neutral `banknote` —
  the resolution Malaysia reached for the ringgit and the UAE for the dirham.
  The one place euros are correct is tuition: `study.gov.pl` publishes its own
  fee guidance in EUR, and where the page quotes that source it quotes its unit.
* **Spelling: British `-ise`, and `programme`.** `study.gov.pl`, NAWA and the
  Polish universities all write "degree programme", so `program` would be the
  odd spelling here. Checked with a word-boundary grep on the built pages and
  both JS files: zero standalone `program`, zero `analyze`/`specialize`/
  `counseling`.
* **Diacritic-folded search, with one Polish-specific catch.** `ł` does **not**
  decompose under NFD — the stroke is part of the base character, not a
  combining mark — so `Łódź` folds to `łodz` and a user typing `Lodz` matched
  nothing. It is mapped explicitly, exactly as German's `ß` had to be. Every
  other Polish diacritic (ą ć ę ń ó ś ź ż) decomposes normally.
* **`programs` is a field name, not a spelling.** The dataset key stays
  `programs` because that is what the reference `main.js` reads, as on the
  German page. The rendered label is "Study programmes".

## The copy claims this page must never get wrong

Each of these is asserted in `localise_pl.py` or leak-checked in
`verify_site.py`, because they are the claims a reader acts on.

1. **The institution needs the permission, and a third do not have it.** This is
   the single most valuable thing on the page and it has no UK counterpart. The
   chat reply and the visa FAQ both lead with it.
2. **There is no weekly cap on work.** A full-time student at an approved or
   exempt institution needs **no work permit** and Polish law sets **no hour
   limit**. The UK page's "20 hours a week during term time" is the wrong
   *shape*, not a wrong number. Two conditions must travel with it: the
   institution must qualify, and **part-time, postgraduate and MBA study do
   not**.
3. **The graduate permit is nine months, and it does not itself carry a work
   right.** What lets a graduate take a job is a separate rule — graduates of
   full-time studies at Polish universities are exempt from the work permit
   requirement. It must be applied for **in person while still legally
   resident**. Copy calling it "a nine-month work permit" is wrong twice over.
4. **Family cannot come in year one.** Reunification under art. 159 needs **two
   years on consecutive residence permits** with the current one issued for at
   least a year — impossible from a first 15-month permit, straightforward from
   the second. The spouse's permit then carries the right to work with no
   separate work permit. The page states the timing, not just the entitlement.
5. **Study time counts half towards settlement.** EU long-term resident status
   needs five years of continuous residence, and a period of study counts at
   **one half**. Any copy implying "five years from landing" is wrong in the
   direction that costs the reader time.
6. **Duolingo: Poland has no list, so the page says so.** Poland sets **no
   language requirement for the residence permit** — language is purely an
   admission matter, so there is no national accepted-test list to be on or off.
   This is Finland's position and the fifth distinct answer this set now holds on
   that test. The page names IELTS Academic, TOEFL iBT and PTE Academic as the
   tests that travel, and says plainly that Duolingo is taken by some Polish
   institutions but not the most selective — it is not on the **University of
   Warsaw's** published list. `Duolingo` is therefore **not** a leak pattern for
   this country, and `localise_pl.py` asserts the explaining sentence survives in
   both JS files.

## Figures on the page, and where they came from

| figure | value | source |
|---|---|---|
| national visa (type D) fee | **€200** from 1 Jan 2026 | MFA / gov.pl consular fee tariff |
| residence permit | **PLN 340** + **PLN 100** card | EU Immigration Portal, *Student — Poland* |
| funds to prove | **PLN 776**/month single, after housing | EU Immigration Portal; migrant.info.pl |
| return journey | **PLN 200–2,500** | EU Immigration Portal |
| travel medical insurance | **€30,000** minimum | EU Immigration Portal |
| first permit / later permits | **15 months** / up to **3 years** | migrant.info.pl (Office for Foreigners) |
| graduate permit | **9 months**, once | Office for Foreigners, `gov.pl/web/udsc-en` |
| tuition, non-EU | **~€2,000/yr**, range **€2,000–6,000**; MBA **€8,000–12,000** | `study.gov.pl` (NAWA) |
| doctoral schools | **no fee**, plus a scholarship for every full-time candidate | `study.gov.pl` |
| Banach NAWA scholarship | **PLN 2,500**/month + tuition waiver + **PLN 2,500** travel | NAWA — **India is one of the 36 eligible countries** |
| minimum hourly rate 2026 | **PLN 31.40** gross | Council of Ministers regulation, 11 Sep 2025 |
| minimum wage 2026 | **PLN 4,806** gross/month | same |
| EU Blue Card threshold 2026 | **PLN 13,355.34** gross/month | 150% of the GUS average salary |

**Banach is named on purpose, and *Poland My First Choice* is not.** Banach pays
tuition and a stipend for full-time master's study and India is on its eligible
list, so it is a scholarship an Indian reader can actually apply for. *Poland My
First Choice* is restricted to high-income countries and India does not qualify;
naming it would be the Duolingo mistake in a different costume.

## Things a reviewer should check before launch

* **The MSWiA list ages.** Approvals run for 2 or 5 years and new ones are
  granted continuously. Re-download the cumulative list, re-run
  `build_dataset_pl.py`, and expect the `106` and `227` assertions to fail —
  that is them working. Update the counts in `POLAND_SPEC.md` §3, the header of
  `universities-data.js`, this README and the chat reply in `localise_pl.py`
  together; the figure **106** is quoted in the chat, so it cannot drift
  silently.
* **QS publishes a new edition each June.** The 2028 edition will move the
  ranked twenty. Check the count against 12 before assuming no card needs
  rebadging.
* **The work-permit exemption is new law still bedding in.** The rule took full
  effect on 1 July 2026 and enforcement practice on it is young. Re-check the
  "no weekly cap, no work permit" claim against MRPiPS guidance before launch.
* **`programmes` invites a comparison it does not support.** If anyone asks to
  sort or filter the directory by it, say no — it is breadth, not quality, and
  the biggest numbers belong to the broadest universities.
* **Six pages are now one QS edition stale.** The UK, Canadian, Irish, German,
  New Zealand and Australian pages still cite QS 2026 in their `uni_note`. This
  page uses 2027, as France, Singapore, Malaysia and the UAE do.
