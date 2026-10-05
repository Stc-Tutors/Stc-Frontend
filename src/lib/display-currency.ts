// Which currency to show a family an approximate price in. Display only - see LocalPriceNote.
// Returns undefined for Nigeria (prices are already naira) and for any country we can't map, so
// nothing is shown rather than something wrong.

// Every country's ISO code -> its currency.
const ISO2_CURRENCY: Record<string, string> = Object.fromEntries(
  (
    "AF:AFN AL:ALL DZ:DZD AO:AOA AR:ARS AM:AMD AU:AUD AT:EUR AZ:AZN BS:BSD BH:BHD BD:BDT BB:BBD BY:BYN BE:EUR BZ:BZD " +
    "BJ:XOF BT:BTN BO:BOB BA:BAM BW:BWP BR:BRL BN:BND BG:BGN BF:XOF BI:BIF KH:KHR CM:XAF CA:CAD CV:CVE CF:XAF TD:XAF " +
    "CL:CLP CN:CNY CO:COP KM:KMF CG:XAF CD:CDF CR:CRC CI:XOF HR:EUR CY:EUR CZ:CZK DK:DKK DJ:DJF DO:DOP EC:USD EG:EGP " +
    "SV:USD GQ:XAF ER:ERN EE:EUR SZ:SZL ET:ETB FJ:FJD FI:EUR FR:EUR GA:XAF GM:GMD GE:GEL DE:EUR GH:GHS GR:EUR GT:GTQ " +
    "GN:GNF GW:XOF GY:GYD HT:HTG HN:HNL HK:HKD HU:HUF IS:ISK IN:INR ID:IDR IQ:IQD IE:EUR IL:ILS IT:EUR JM:JMD JP:JPY " +
    "JO:JOD KZ:KZT KE:KES KW:KWD KG:KGS LA:LAK LV:EUR LB:LBP LS:LSL LR:LRD LY:LYD LT:EUR LU:EUR MO:MOP MG:MGA MW:MWK " +
    "MY:MYR MV:MVR ML:XOF MT:EUR MR:MRU MU:MUR MX:MXN MD:MDL MN:MNT ME:EUR MA:MAD MZ:MZN MM:MMK NA:NAD NP:NPR NL:EUR " +
    "NZ:NZD NI:NIO NE:XOF NG:NGN MK:MKD NO:NOK OM:OMR PK:PKR PA:PAB PG:PGK PY:PYG PE:PEN PH:PHP PL:PLN PT:EUR QA:QAR " +
    "RO:RON RU:RUB RW:RWF SA:SAR SN:XOF RS:RSD SC:SCR SL:SLE SG:SGD SK:EUR SI:EUR SO:SOS ZA:ZAR KR:KRW SS:SSP ES:EUR " +
    "LK:LKR SD:SDG SR:SRD SE:SEK CH:CHF TW:TWD TJ:TJS TZ:TZS TH:THB TL:USD TG:XOF TT:TTD TN:TND TR:TRY TM:TMT UG:UGX " +
    "UA:UAH AE:AED GB:GBP US:USD UY:UYU UZ:UZS VE:VES VN:VND YE:YER ZM:ZMW ZW:ZWL"
  )
    .split(" ")
    .map((pair) => pair.split(":"))
);

// Short names the country dropdowns use that the standard English region name doesn't match.
const NAME_ALIASES: Record<string, string> = {
  uk: "GB", england: "GB", britain: "GB", "great britain": "GB",
  usa: "US", us: "US", america: "US", "united states of america": "US",
  uae: "AE", "cote d'ivoire": "CI", "côte d'ivoire": "CI", "ivory coast": "CI",
  "south korea": "KR", russia: "RU", vietnam: "VN", tanzania: "TZ", "czech republic": "CZ",
};

let nameToIso: Map<string, string> | null = null;
function isoForName(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  if (NAME_ALIASES[key]) return NAME_ALIASES[key];
  if (!nameToIso) {
    nameToIso = new Map();
    try {
      const names = new Intl.DisplayNames(["en"], { type: "region" });
      for (const code of Object.keys(ISO2_CURRENCY)) {
        const label = names.of(code);
        if (label) nameToIso.set(label.toLowerCase(), code);
      }
    } catch {
      /* Intl.DisplayNames unavailable - the aliases above still cover the common ones */
    }
  }
  return nameToIso.get(key);
}

export function currencyForCountry(country: string): string | undefined {
  const raw = country.trim();
  if (!raw) return undefined;
  const iso2 = raw.length === 2 ? raw.toUpperCase() : isoForName(raw);
  if (!iso2 || iso2 === "NG") return undefined;
  return ISO2_CURRENCY[iso2];
}

// Best guess from the browser's language region (en-GB -> GBP) for a visitor whose
// residence we don't know yet.
export function currencyFromLocale(): string | undefined {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return region ? currencyForCountry(region) : undefined;
  } catch {
    return undefined;
  }
}

const RESIDENCE_KEY = "stc.residence";

export function rememberResidence(country: string): void {
  try {
    if (country.trim()) localStorage.setItem(RESIDENCE_KEY, country.trim());
  } catch {
    /* storage unavailable - the locale guess still works */
  }
}

export function getRememberedResidence(): string | null {
  try {
    return localStorage.getItem(RESIDENCE_KEY);
  } catch {
    return null;
  }
}
