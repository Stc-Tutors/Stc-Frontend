// Which currency to show a family an approximate price in. Display only - see LocalPriceNote.
// Returns undefined for Nigeria (prices are already naira) and for any country we hold no
// rate for, so nothing is shown rather than something wrong.

const EURO_ISO2 = ["IE", "DE", "FR", "ES", "IT", "NL", "BE", "PT", "AT", "FI", "GR", "LU", "MT", "CY", "SK", "SI", "EE", "LV", "LT", "HR"];
const ISO2_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", CA: "CAD", GH: "GHS", ZA: "ZAR", KE: "KES", ZM: "ZMW", CH: "CHF", CN: "CNY",
  EG: "EGP", MA: "MAD", TZ: "TZS", UG: "UGX", RW: "RWF", ET: "ETB", BW: "BWP", MU: "MUR",
  SN: "XOF", CI: "XOF", BJ: "XOF", TG: "XOF", ML: "XOF", BF: "XOF", CM: "XAF", GA: "XAF", CG: "XAF",
  AU: "AUD", JP: "JPY", IN: "INR", AE: "AED", SA: "SAR", SG: "SGD", NZ: "NZD", SE: "SEK", NO: "NOK",
  DK: "DKK", BR: "BRL", MX: "MXN", HK: "HKD",
  ...Object.fromEntries(EURO_ISO2.map((c) => [c, "EUR"])),
};

// The country dropdowns store codes ("NG") in places and short names ("UK", "USA") in others.
const NAME_TO_ISO2: Record<string, string> = {
  nigeria: "NG", uk: "GB", "united kingdom": "GB", england: "GB", britain: "GB", "great britain": "GB",
  usa: "US", "united states": "US", "united states of america": "US", us: "US", america: "US",
  canada: "CA", ghana: "GH", "south africa": "ZA", kenya: "KE", zambia: "ZM", switzerland: "CH", china: "CN",
  ireland: "IE", germany: "DE", france: "FR", spain: "ES", italy: "IT", netherlands: "NL", belgium: "BE",
  portugal: "PT", austria: "AT", finland: "FI", greece: "GR", luxembourg: "LU", malta: "MT", cyprus: "CY",
  slovakia: "SK", slovenia: "SI", estonia: "EE", latvia: "LV", lithuania: "LT", croatia: "HR",
  egypt: "EG", morocco: "MA", tanzania: "TZ", uganda: "UG", rwanda: "RW", ethiopia: "ET", botswana: "BW",
  mauritius: "MU", senegal: "SN", "cote d'ivoire": "CI", "côte d'ivoire": "CI", "ivory coast": "CI",
  cameroon: "CM", australia: "AU", japan: "JP", india: "IN", uae: "AE", "united arab emirates": "AE",
  "saudi arabia": "SA", singapore: "SG", "new zealand": "NZ", sweden: "SE", norway: "NO", denmark: "DK",
  brazil: "BR", mexico: "MX", "hong kong": "HK",
};

export function currencyForCountry(country: string): string | undefined {
  const raw = country.trim();
  if (!raw) return undefined;
  const iso2 = raw.length === 2 ? raw.toUpperCase() : NAME_TO_ISO2[raw.toLowerCase()];
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
