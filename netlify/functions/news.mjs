/**
 * Live Poland news for the homepage news bar — Netlify Functions (v2, ESM).
 *
 * GET /api/news -> { updated, items: [{ title, source, date, img }] }
 *
 * Reads English-language Polish news feeds server-side (Notes from Poland, its
 * education and business sections, and PolandWeekly, which only cover Poland,
 * plus The PIE News, Emerging Europe and Poland Insight, which cover more and
 * so must name Poland or a Polish city in the headline), keeps the stories that matter to someone planning
 * to study or settle in Poland (universities, study, visas and residence
 * permits, work, Polish cities), drops crime / war / court / accident and
 * party-politics stories, and pairs each headline with one of the site's own
 * photos (assets/img/photos/, the .webp copies the page already shows).
 *
 * The page never loads anything from those sites: headlines are plain text
 * (no outbound links) and every image is same-origin, which keeps the strict
 * CSP (connect-src 'self', img-src 'self') intact. Responses are cached at
 * Netlify's edge for 30 minutes, so the feeds are read a couple of times an
 * hour at most, however busy the page is.
 *
 * Checked when written (2026-10-31): TVP World, Polskie Radio English and PAP
 * English publish no working RSS feed (404 / HTML / timeout), so they are
 * not listed. serve.py does not run functions: a local preview shows the
 * page's own fallback headlines instead.
 *
 * Zero npm dependencies: Node 18+ global fetch only.
 */

// [name shown under the headline, feed URL, feed only partly about Poland?]
const FEEDS = [
  ['Notes from Poland', 'https://notesfrompoland.com/feed/'],
  ['Notes from Poland', 'https://notesfrompoland.com/category/education/feed/'],
  ['Notes from Poland', 'https://notesfrompoland.com/category/business/feed/'],
  ['PolandWeekly', 'https://polandweekly.com/feed/'],
  ['The PIE News', 'https://thepienews.com/feed/', true],
  ['Emerging Europe', 'https://emerging-europe.com/tag/poland/feed/', true],
  ['Poland Insight', 'https://polandinsight.com/feed/', true]
];
const TIMEOUT_MS = 6000;
const MAX_ITEMS = 12;
// Several of these feeds publish weekly, so a month keeps the bar full.
const MAX_AGE_DAYS = 30;
// A story is shown when its headline matches a RELEVANCE topic, or when its
// summary alone scores at least this much (one strong topic, or two weaker).
const MIN_SUMMARY_SCORE = 6;

// Feeds that are only partly about Poland must name it (or a Polish city) in the
// headline. Tested on folded text (see fold), so it is written without accents.
const POLISH = /\b(poland|polish|poles|warsaw|warszawa|krakow|cracow|wroclaw|gdansk|poznan|lodz|katowice|lublin|szczecin|bydgoszcz|torun|gdynia|rzeszow|bialystok|olsztyn|gliwice|opole|kielce)\b/;

// The site quotes no prices, so headlines with a money amount are left out.
const MONEY = /[€$£]\s?\d|\d\s?(?:z[lł]|pln|eur|usd)\b|\b\d+(?:[.,]\d+)?\s*(?:million|billion|bn|trillion)\b|\b(?:z[lł]oty|euros?|dollars?)\b/i;

// Stories that don't belong on a study-abroad page: crime, courts, war, tragedy, party politics.
const BLOCK = /\b(murder\w*|kill\w*|dead|death\w*|died|dies|assault\w*|rape\w*|stab\w*|shoot\w*|shot|crime\w*|criminal\w*|police|arrest\w*|detain\w*|charged|convict\w*|court\w*|judge\w*|tribunal|prosecut\w*|prison\w*|sentenc\w*|trial|witness\w*|drug\w*|war|wars|wwii|holocaust|bomb\w*|weapon\w*|explosi\w*|missile\w*|patriot|drone\w*|military|army|troops|defen[cs]e|nato|russia\w*|ukrain\w*|belarus\w*|putin|attack\w*|arson|sabotage|spy|spies|terror\w*|accident\w*|crash\w*|fire|flood\w*|suicid\w*|abuse\w*|scandal\w*|scam\w*|fraud\w*|hack\w*|bankrupt\w*|layoff\w*|redundanc\w*|strike\w*|protest\w*|controvers\w*|far-right|nationalist\w*|opposition|election\w*|vote\w*|referendum|polexit|eu exit|hatred|antisemit\w*|abortion|church|bishop\w*|clergy|catholic\w*)\b/i;

// What makes a story relevant to our visitors, strongest first.
const RELEVANCE = [
  [/\b(stud(y|ying|ies|ent|ents)|universit\w*|polytechnic\w*|politechnika|college\w*|degree\w*|graduat\w*|education\w*|campus\w*|tuition|scholarship\w*|research\w*|scien\w*|academ\w*|erasmus|nawa|lecturer\w*|professor\w*)\b/i, 6],
  [/\b(residence permit\w*|permit\w*|visa\w*|immigra\w*|migra\w*|foreigner\w*|foreign\w*|international\w*|talent\w*|expat\w*|blue card|citizenship)\b/i, 5],
  [/\b(job\w*|work\w*|employ\w*|unemploy\w*|labou?r|career\w*|start-?up\w*|tech|technolog\w*|ai|innovat\w*|invest\w*|economy|economic|growth|compan\w*|business\w*|hiring|skills?)\b/i, 3],
  [/\b(warsaw|warszawa|krak[oó]w|cracow|wroc[lł]aw|gda[nń]sk|pozna[nń]|[lł][oó]d[zź]|katowice|lublin|szczecin|bydgoszcz|toru[nń]|gdynia|rzesz[oó]w|bia[lł]ystok|olsztyn|gliwice|tricity)\b/i, 2],
  [/\b(housing|rent\w*|apartment\w*|famil\w*|child\w*|health\w*|insurance|culture|cultural|festival\w*|museum\w*|travel\w*|rail|train\w*|airport\w*|tourism|tourist\w*|city|cities|life|living)\b/i, 1]
];

// Headline words -> one of the site's own photos (assets/img/photos/*.webp).
const UNI_WORDS = [
  [/university of warsaw|uniwersytet warszawski/i, 'unis/uw'],
  [/jagiellonian|uniwersytet jagiello/i, 'unis/uj'],
  [/warsaw university of technology|politechnika warszawska/i, 'unis/pw'],
  [/adam mickiewicz|\bamu\b/i, 'unis/amu'],
  [/\bagh\b|akademia g[oó]rniczo/i, 'unis/agh'],
  [/gda[nń]sk (university of technology|tech)|politechnika gda/i, 'unis/pg'],
  [/university of wroc[lł]aw|uniwersytet wroc/i, 'unis/uwr'],
  [/university of gda[nń]sk|uniwersytet gda/i, 'unis/ug'],
  [/wroc[lł]aw (university of science and technology|tech)|politechnika wroc/i, 'unis/pwr'],
  [/cracow university of technology|politechnika krakowska/i, 'unis/pk'],
  [/[lł][oó]d[zź] university of technology|politechnika [lł][oó]dzka/i, 'unis/pl'],
  [/copernicus|uniwersytet miko[lł]aja kopernika/i, 'unis/umk']
];
const TOPIC_WORDS = [
  [/\b(permit\w*|visa\w*|immigra\w*|migra\w*|foreigner\w*|citizenship|passport\w*|border\w*|blue card)\b/i, 'poland-city'],
  [/\b(research\w*|scien\w*|laborator\w*|lab|labs|phd|doctora\w*|ai|tech|technolog\w*|innovat\w*)\b/i, 'why-research'],
  [/\b(stud(y|ying|ies|ent|ents)|universit\w*|degree\w*|graduat\w*|education\w*|campus\w*|scholarship\w*|tuition|academ\w*|lecturer\w*)\b/i, 'why-degrees'],
  [/\b(job\w*|work\w*|employ\w*|unemploy\w*|labou?r|career\w*|compan\w*|business\w*|econom\w*|invest\w*|start-?up\w*|hiring)\b/i, 'why-work'],
  [/\b(famil\w*|child\w*|kids?|parent\w*|housing|rent\w*|apartment\w*|homes?|health\w*|medical|insurance|parks?)\b/i, 'family']
];
// City -> photo of that city (Warsaw is also the default).
const CITY_PHOTOS = [
  [/\b(warsaw|warszawa)\b/, 'poland-city'],
  [/\b(krakow|cracow)\b/, 'why-degrees'],
  [/\b(wroclaw)\b/, 'students-campus'],
  [/\b(poznan)\b/, 'team-working'],
  [/\b(gdansk|gdynia|sopot|tricity)\b/, 'hero/gdansk-crane-1280'],
  [/\b(torun)\b/, 'unis/umk'],
  [/\b(lodz)\b/, 'unis/pl']
];

// Lower case, accents off; "ł" has no decomposition, so it is mapped by hand.
function fold(s) { return String(s).toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
function tag(xml, name) { const m = new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i').exec(xml); return m ? decode(m[1]) : ''; }

export function imageFor(title, summary) {
  const text = title + ' ' + summary;
  for (const [re, key] of UNI_WORDS) if (re.test(text)) return key;
  for (const [re, key] of TOPIC_WORDS) if (re.test(title)) return key;
  // The summary only decides the city; its topic words are too loose.
  for (const s of [fold(title), fold(summary)]) for (const [re, key] of CITY_PHOTOS) if (re.test(s)) return key;
  return 'poland-city';
}
/** Relevance: headline matches count double. `inTitle` says whether any did. */
export function score(title, summary) {
  let s = 0, inTitle = false;
  title = fold(title); summary = fold(summary);   // "Łódź" and "Lodz" alike
  for (const [re, w] of RELEVANCE) { if (re.test(title)) { s += w * 2; inTitle = true; } else if (re.test(summary)) s += w; }
  return { s, inTitle };
}

/** One feed's items, as plain text: { title, summary, source, date }. */
export function parseFeed(xml, source, partlyPolish) {
  return (String(xml).match(/<item[\s>][\s\S]*?<\/item>/gi) || []).map((it) => {
    const title = tag(it, 'title'), summary = tag(it, 'description').slice(0, 400);
    const date = new Date(tag(it, 'pubDate') || tag(it, 'dc:date'));
    return { title, summary, source, date: isNaN(date) ? '' : date.toISOString() };
  }).filter((x) => x.title && x.date && x.title.length > 12 && x.title.length < 160 && (!partlyPolish || POLISH.test(fold(x.title))));
}

async function fetchFeed([source, url, partlyPolish]) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'TuteeConnectNewsTicker/1.0 (+https://www.tuteeconnect.com)', Accept: 'application/rss+xml, application/xml, text/xml' } });
    if (!res.ok) return [];
    return parseFeed(await res.text(), source, partlyPolish);
  } catch (e) {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** The stories worth showing, best first, as the page receives them. */
export function pick(lists, now = Date.now()) {
  const seen = [];
  return lists.flat()
    .filter((x) => !BLOCK.test(x.title + ' ' + x.summary))
    .filter((x) => !MONEY.test(x.title))
    // The same story from two outlets: skip headlines sharing most of their words.
    .filter((x) => {
      const words = new Set(fold(x.title).split(/[^a-z0-9]+/).filter((w) => w.length > 3));
      for (const prev of seen) {
        let common = 0; words.forEach((w) => { if (prev.has(w)) common++; });
        if (common / Math.max(1, Math.min(words.size, prev.size)) >= 0.6) return false;
      }
      seen.push(words); return true;
    })
    .map((x) => ({ ...x, ...score(x.title, x.summary), age: (now - Date.parse(x.date)) / 36e5 }))
    .filter((x) => (x.inTitle || x.s >= MIN_SUMMARY_SCORE) && x.age > -24 && x.age < 24 * MAX_AGE_DAYS)
    // Relevance first, fresher stories breaking ties (a day's age ~ one point).
    .sort((a, b) => (b.s - b.age / 24) - (a.s - a.age / 24))
    .slice(0, MAX_ITEMS)
    .map((x) => ({ title: x.title, source: x.source, date: x.date, img: './assets/img/photos/' + imageFor(x.title, x.summary) + '.webp' }));
}

export default async () => {
  const items = pick(await Promise.all(FEEDS.map(fetchFeed)));
  return new Response(JSON.stringify({ updated: new Date().toISOString(), items }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Browsers keep it 5 minutes; Netlify's edge serves it for 30.
      'Cache-Control': 'public, max-age=300',
      'Netlify-CDN-Cache-Control': 'public, max-age=1800, stale-while-revalidate=600'
    }
  });
};

export const config = { path: '/api/news' };
