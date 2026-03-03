import type { LangCode } from "./types";

const TRIGRAMS: Record<string, LangCode> = {};

const EN_TRI = "the,and,ing,ion,tio,ent,ati,for,her,ter,hat,tha,ere,ate,his,con,res,ver,all,ith,pro,not,ons,nce,was,off,ect,int,ist,per,ous,com,are,ers,ive,str,one,rea,ess,ght,ore,est,ted,ort,ment,out,rin,ear,der,sta,man,nte,ove,our";
const DE_TRI = "ein,ich,sch,die,der,und,den,ung,cht,nde,ber,ine,ter,ver,gen,che,eit,ren,ste,ent,ges,ier,auf,aus,hen,ell,lic,hre,uch,nen,ige,erd,iss,ach,tte,ind,sta,ort,all,anz,ass,ang,end,tes,ers,abe,est,emp";
const FR_TRI = "les,ent,des,ion,ous,que,ait,eme,par,tio,ans,eur,our,est,res,ons,ant,com,men,ais,une,ire,ell,sur,ien,ess,nte,oit,ter,mai,uit,tre,tte,eur,ort,all,pas,ran,plu,cha,ens,pri,son,san,ver,oir";
const ES_TRI = "que,ent,los,cion,ion,ado,las,con,est,ara,nte,aci,una,ien,res,por,ero,sta,cia,mos,ies,dad,nto,nte,ter,ras,tra,ado,aba,ica,ero,nos,des,pre,com,ndo,ien,ose,ria,ona,ale,ste,ist,mos,ell";
const IT_TRI = "che,lla,ell,ion,ent,per,one,ato,con,nte,non,tto,ment,all,del,azi,tta,gli,ere,ess,att,ale,ial,sta,ott,sti,ica,ist,tra";
const PT_TRI = "que,ent,dos,ado,aco,con,est,uma,nto,nte,mos,tra,res,par,das,por,com,oes,ida,ais,ica,ara,ria,ade";
const TR_TRI = "lar,ler,bir,eri,rin,ini,yor,ili,ara,ana,den,nda,aya,esi,aki,nla,lik,ard";

function loadTrigrams(data: string, lang: LangCode) {
  for (const tri of data.split(",")) {
    if (tri.length >= 3) {
      const key = tri.slice(0, 3);
      if (!TRIGRAMS[key]) TRIGRAMS[key] = lang;
    }
  }
}

loadTrigrams(EN_TRI, "en");
loadTrigrams(DE_TRI, "de");
loadTrigrams(FR_TRI, "fr");
loadTrigrams(ES_TRI, "es");
loadTrigrams(IT_TRI, "it");
loadTrigrams(PT_TRI, "pt");
loadTrigrams(TR_TRI, "tr");

function getScript(text: string): "cyrillic" | "cjk" | "latin" | "greek" | "korean" | "mixed" {
  let cyrillic = 0, cjk = 0, latin = 0, greek = 0, korean = 0, total = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code < 0x40) continue;
    total++;
    if (code >= 0x0400 && code <= 0x04FF) cyrillic++;
    else if ((code >= 0x3040 && code <= 0x30FF) || (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0xFF00 && code <= 0xFFEF) || (code >= 0x31F0 && code <= 0x31FF)) cjk++;
    else if (code >= 0x0370 && code <= 0x03FF) greek++;
    else if (code >= 0xAC00 && code <= 0xD7AF) korean++;
    else if ((code >= 0x0041 && code <= 0x007A) || (code >= 0x00C0 && code <= 0x024F)) latin++;
  }
  if (total === 0) return "latin";
  if (cyrillic / total > 0.3) return "cyrillic";
  if (cjk / total > 0.2) return "cjk";
  if (greek / total > 0.3) return "greek";
  if (korean / total > 0.3) return "korean";
  if (latin / total > 0.3) return "latin";
  return "mixed";
}

function detectLatinLang(text: string): LangCode {
  const normalized = text.toLowerCase().replace(/[^a-zà-öø-ÿßğışçüö]/g, " ");
  const scores: Record<string, number> = { en: 0, de: 0, fr: 0, es: 0, it: 0, pt: 0, tr: 0 };
  for (let i = 0; i < normalized.length - 2; i++) {
    const tri = normalized.slice(i, i + 3);
    if (tri.includes(" ")) continue;
    const lang = TRIGRAMS[tri];
    if (lang && lang in scores) scores[lang]++;
  }
  if (/[äöüß]/i.test(text)) scores.de += 5;
  if (/[àâçéèêëîïôùûü]/i.test(text)) scores.fr += 3;
  if (/[ñ¿¡áéíóú]/i.test(text)) scores.es += 5;
  if (/[ğışçö]/i.test(text)) scores.tr += 5;
  let best: LangCode = "en";
  let bestScore = 0;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = lang as LangCode; }
  }
  return best;
}

export function detectLanguage(text: string): LangCode {
  const clean = text.trim();
  if (!clean) return "en";
  const script = getScript(clean);
  switch (script) {
    case "cyrillic": return "ru";
    case "cjk": return "ja";
    case "greek": return "el";
    case "korean": return "ko";
    case "latin": return detectLatinLang(clean);
    default: return detectLatinLang(clean);
  }
}
