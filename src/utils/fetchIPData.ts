/**
 * Captura IP e localização do usuário com múltiplos fallbacks.
 * Retorna um objeto com ip, city, region, country.
 */

interface IPData {
  ip: string;
  city: string;
  region: string;
  country: string;
  location: string; // "Cidade, UF - País"
}

const EMPTY: IPData = { ip: '', city: '', region: '', country: '', location: '' };

function buildLocation(city: string, region: string, country: string): string {
  const parts = [city, region].filter(Boolean).join(', ');
  return [parts, country].filter(Boolean).join(' - ');
}

export async function fetchIPData(): Promise<IPData> {
  // ── Tentativa 1: ipapi.co ────────────────────────────────────────────────
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const d = await res.json();
      if (d.ip && !d.error) {
        const city = d.city || '';
        const region = d.region_code || '';
        const country = d.country_code || '';
        return { ip: d.ip, city, region, country, location: buildLocation(city, region, country) };
      }
    }
  } catch { /* segue para próximo */ }

  // ── Tentativa 2: api64.ipify.org + ipinfo.io ─────────────────────────────
  try {
    const ipRes = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(5000) });
    if (ipRes.ok) {
      const { ip } = await ipRes.json();
      if (ip) {
        try {
          const infoRes = await fetch(`https://ipinfo.io/${ip}/json`, { signal: AbortSignal.timeout(5000) });
          if (infoRes.ok) {
            const d = await infoRes.json();
            const [city, region] = (d.region || '').split(' ') || ['', ''];
            const country = d.country || '';
            return { ip, city: d.city || city, region: d.region || region, country, location: buildLocation(d.city || '', d.region || '', country) };
          }
        } catch { /* sem detalhes, retorna só IP */ }
        return { ...EMPTY, ip };
      }
    }
  } catch { /* segue para próximo */ }

  // ── Tentativa 3: ip-api.com (gratuito, sem HTTPS em produção, mas funciona como fallback) ─
  try {
    const res = await fetch('https://ip-api.com/json/?fields=status,query,city,regionName,countryCode', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const d = await res.json();
      if (d.status === 'success' && d.query) {
        const city = d.city || '';
        const region = d.regionName || '';
        const country = d.countryCode || '';
        return { ip: d.query, city, region, country, location: buildLocation(city, region, country) };
      }
    }
  } catch { /* todos fallbacks falharam */ }

  return EMPTY;
}
