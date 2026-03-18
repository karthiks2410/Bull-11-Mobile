/**
 * Logo Service
 * Handles company logo URL generation with caching
 *
 * Logo sources:
 * 1. Logo.dev API (requires API key, currently disabled)
 * 2. DiceBear initials avatar (fallback)
 */

// Domain mapping for common Indian stocks
const STOCK_DOMAINS: Record<string, string> = {
  // IT Companies
  'INFY': 'infosys.com',
  'TCS': 'tcs.com',
  'WIPRO': 'wipro.com',
  'HCLTECH': 'hcltech.com',
  'TECHM': 'techmahindra.com',
  'LTIM': 'ltimindtree.com',
  'COFORGE': 'coforge.com',
  'MPHASIS': 'mphasis.com',
  'PERSISTENT': 'persistent.com',

  // Banks
  'HDFCBANK': 'hdfcbank.com',
  'ICICIBANK': 'icicibank.com',
  'SBIN': 'sbi.co.in',
  'AXISBANK': 'axisbank.com',
  'KOTAKBANK': 'kotak.com',
  'INDUSINDBK': 'indusind.com',
  'BANDHANBNK': 'bandhanbank.com',
  'FEDERALBNK': 'federalbank.co.in',
  'IDFCFIRSTB': 'idfcfirstbank.com',

  // Conglomerates
  'RELIANCE': 'ril.com',
  'TATASTEEL': 'tatasteel.com',
  'TATAPOWER': 'tatapower.com',
  'TATAMOTORS': 'tatamotors.com',
  'TATACHEM': 'tatachemicals.com',
  'TATACONSUM': 'tataconsumer.com',
  'TATAELXSI': 'tataelxsi.com',
  'TATACOMM': 'tatacommunications.com',
  'TITAN': 'titan.co.in',

  // Auto
  'MARUTI': 'marutisuzuki.com',
  'M&M': 'mahindra.com',
  'BAJAJ-AUTO': 'bajajauto.com',
  'HEROMOTOCO': 'heromotocorp.com',
  'EICHERMOT': 'eicher.in',
  'ASHOKLEY': 'ashokleyland.com',
  'TVSMOTORS': 'tvsmotor.com',

  // Consumer
  'HINDUNILVR': 'hul.co.in',
  'ITC': 'itcportal.com',
  'NESTLEIND': 'nestle.in',
  'BRITANNIA': 'britannia.co.in',
  'DABUR': 'dabur.com',
  'MARICO': 'marico.com',
  'COLPAL': 'colgatepalmolive.co.in',
  'GODREJCP': 'godrejcp.com',

  // Pharma
  'SUNPHARMA': 'sunpharma.com',
  'DRREDDY': 'drreddys.com',
  'CIPLA': 'cipla.com',
  'DIVISLAB': 'divislabs.com',
  'BIOCON': 'biocon.com',
  'LUPIN': 'lupin.com',
  'TORNTPHARM': 'torrentpharma.com',

  // Telecom & Tech
  'BHARTIARTL': 'airtel.in',
  'JIOFINANCE': 'jio.com',
  'PAYTM': 'paytm.com',
  'ZOMATO': 'zomato.com',
  'NYKAA': 'nykaa.com',
  'POLICYBZR': 'policybazaar.com',
  'DELHIVERY': 'delhivery.com',

  // Food Delivery & E-commerce
  'SWIGGY': 'swiggy.com',
  'ETERNAL': 'eternalgroup.in',

  // Financial Services
  'BAJFINANCE': 'bajajfinserv.in',
  'BAJAJFINSV': 'bajajfinserv.in',
  'HDFC': 'hdfc.com',
  'HDFCLIFE': 'hdfclife.com',
  'ICICIGI': 'icicilombard.com',
  'ICICIPRULI': 'iciciprulife.com',
  'SBILIFE': 'sbilife.co.in',
  'SBICARD': 'sbicard.com',

  // Energy & Oil
  'ONGC': 'ongcindia.com',
  'IOC': 'iocl.com',
  'BPCL': 'bharatpetroleum.in',
  'GAIL': 'gailonline.com',
  'NTPC': 'ntpc.co.in',
  'POWERGRID': 'powergrid.in',
  'ADANIGREEN': 'adanigreenenergy.com',
  'ADANIPOWER': 'adanipower.com',
  'ADANIENT': 'adani.com',
  'ADANIPORTS': 'adaniports.com',

  // Metals & Mining
  'HINDALCO': 'hindalco.com',
  'JSWSTEEL': 'jsw.in',
  'VEDL': 'vedantalimited.com',
  'COALINDIA': 'coalindia.in',

  // Real Estate & Infrastructure
  'DLF': 'dlf.in',
  'GODREJPROP': 'godrejproperties.com',
  'OBEROIRLTY': 'oberoirealty.com',
  'LODHA': 'lodhagroup.in',
  'LTTECH': 'larsentoubro.com',
  'LT': 'larsentoubro.com',

  // Cement
  'ULTRACEMCO': 'ultratechcement.com',
  'SHREECEM': 'shreecement.com',
  'AMBUJACEM': 'ambujacement.com',
  'ACC': 'acclimited.com',

  // Media & Entertainment
  'PVRINOX': 'pvrinox.com',
  'ZEEL': 'zee.com',
  'SUNTV': 'suntv.com',

  // Others
  'ASIANPAINT': 'asianpaints.com',
  'BERGEPAINT': 'bergerpaints.com',
  'PIDILITIND': 'pidilite.com',
  'HAVELLS': 'havells.com',
  'VOLTAS': 'voltas.com',
  'BLUESTARCO': 'bluestarindia.com',
  'CROMPTON': 'crompton.co.in',
  'DIXON': 'dixoninfo.com',
};

// In-memory cache for logo URLs
const logoCache = new Map<string, string>();

/**
 * LogoService - Handles logo URL generation and caching
 */
export class LogoService {
  private static logoDevApiKey: string | null = null;

  /**
   * Set the Logo.dev API key (optional)
   * If not set, will use fallback avatars only
   */
  static setApiKey(key: string): void {
    this.logoDevApiKey = key;
    // Clear cache when API key changes
    logoCache.clear();
  }

  /**
   * Get the domain for a stock symbol
   */
  static getDomain(symbol: string): string | null {
    // Normalize symbol (remove any NSE/BSE prefix)
    const normalizedSymbol = symbol.toUpperCase().replace(/^(NSE:|BSE:)/, '');
    return STOCK_DOMAINS[normalizedSymbol] || null;
  }

  /**
   * Get the logo URL for a stock symbol
   * Uses Logo.dev if API key is set and domain is known
   * Falls back to DiceBear initials avatar
   */
  static getLogoUrl(symbol: string, size: number = 64): string {
    const cacheKey = `${symbol}-${size}`;

    // Check cache first
    if (logoCache.has(cacheKey)) {
      return logoCache.get(cacheKey)!;
    }

    let url: string;
    const domain = this.getDomain(symbol);

    // If we have an API key and domain mapping, use Logo.dev
    if (this.logoDevApiKey && domain) {
      url = `https://img.logo.dev/${domain}?token=${this.logoDevApiKey}&size=${size}`;
    } else {
      // Fallback to DiceBear initials
      url = this.getFallbackUrl(symbol);
    }

    // Cache the URL
    logoCache.set(cacheKey, url);

    return url;
  }

  /**
   * Get the fallback avatar URL (DiceBear initials)
   */
  static getFallbackUrl(symbol: string): string {
    // Use DiceBear initials API
    // The seed parameter uses the symbol to generate consistent avatars
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(symbol)}&backgroundColor=2196F3,9C27B0,FF9800,00BCD4,3F51B5&backgroundType=solid&radius=50`;
  }

  /**
   * Clear the logo cache
   */
  static clearCache(): void {
    logoCache.clear();
  }

  /**
   * Get cache size for debugging
   */
  static getCacheSize(): number {
    return logoCache.size;
  }

  /**
   * Check if a domain mapping exists for a symbol
   */
  static hasDomainMapping(symbol: string): boolean {
    return this.getDomain(symbol) !== null;
  }

  /**
   * Add a custom domain mapping
   */
  static addDomainMapping(symbol: string, domain: string): void {
    STOCK_DOMAINS[symbol.toUpperCase()] = domain;
    // Clear cache for this symbol
    for (const key of logoCache.keys()) {
      if (key.startsWith(symbol.toUpperCase())) {
        logoCache.delete(key);
      }
    }
  }
}

export default LogoService;
