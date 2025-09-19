// src/_data/neighbourhoods.js
const https = require("https");
const { URL } = require("url");
const MAX_REDIRECTS = 5;

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    console.log(`[neighbourhoods] Fetching: ${url}`);
    https.get(url, (res) => {
      const { statusCode, headers, statusMessage } = res;
      if ([301,302,303,307,308].includes(statusCode)) {
        const next = new URL(headers.location, url).toString();
        console.log(`[neighbourhoods] Redirect ${statusCode} → ${next}`);
        res.resume();
        return resolve(fetchText(next, redirects + 1));
      }
      if (statusCode !== 200) {
        let body = ""; res.on("data", c => body += c);
        return res.on("end", () => reject(new Error(`Sheets fetch failed: ${statusCode} ${statusMessage}\nBody: ${body.slice(0,300)}...`)));
      }
      let data = ""; res.setEncoding("utf8");
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function parseCSV(text){ const rows=[]; let cell="",row=[],q=false; for(let i=0;i<text.length;i++){const ch=text[i],n=text[i+1]; if(ch=='"'){ if(q&&n=='"'){cell+='"'; i++;} else {q=!q;} } else if(ch==","&&!q){row.push(cell); cell="";} else if((ch=="\n"||ch=="\r")&&!q){ if(cell||row.length){row.push(cell); rows.push(row); cell=""; row=[];} } else {cell+=ch;} } if(cell||row.length){row.push(cell); rows.push(row);} return rows;}
const normalizeHeaders = heads => heads.map(h => String(h||"").trim().toLowerCase());
const toSlug = s => String(s||"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");

module.exports = async function () {
  const SHEET_ID  = process.env.SHEET_ID  || process.env.GOOGLE_SHEET_ID || "";
  const SHEET_GID = process.env.SHEET_GID || "";
  const bust = Date.now(); // cache-buster
  if (!SHEET_ID) throw new Error("Missing SHEET_ID/GOOGLE_SHEET_ID");

  const url = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv${SHEET_GID?`&gid=${SHEET_GID}`:""}&cachebust=${bust}`;
  const csv = await fetchText(url);
  const table = parseCSV(csv);
  if (!table.length) throw new Error("CSV parsed but 0 rows");
  const headers = normalizeHeaders(table[0]);
  const rows = table.slice(1).map(r => { const o={}; headers.forEach((h,i)=>o[h]=String(r[i]??"").trim()); return o; });

  const cleaned = rows.map(r => ({
    slug: r.slug || toSlug(r.title),
    title: r.title || "",
    desc: r.desc || "",
    about: r.about || "",
    img: r.img || "",
    order: Number(r.order || 9999),
    published: (r.published || "1").toString(),
    pills: r.pills || "",
  }))
  .filter(r => r.slug && r.title && r.published === "1")
  .sort((a,b)=>a.order-b.order);

  console.log(`[neighbourhoods] Loaded rows: ${cleaned.length}`);
  console.log(`[neighbourhoods] First: ${cleaned[0]?.title} — ${cleaned[0]?.desc?.slice(0,60) || '(no desc)'}`);
  console.log(`[neighbourhoods] Second: ${cleaned[1]?.title} — ${cleaned[1]?.desc?.slice(0,60) || '(no desc)'}`);
  return cleaned;
};
