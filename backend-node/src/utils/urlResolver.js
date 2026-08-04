async function resolveDirectImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return url;
  
  const cleanUrl = url.split("?")[0].split("#")[0];
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cleanUrl)) {
    return url;
  }
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    if (!res.ok) return url;
    const html = await res.text();
    
    // Look for og:image meta tag
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                         
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
  } catch (err) {
    console.error(`Error resolving direct image URL for ${url}:`, err.message);
  }
  return url;
}

async function resolveBodyUrls(obj) {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://"))) {
      obj[key] = await resolveDirectImageUrl(val);
    } else if (typeof val === "object" && val !== null) {
      await resolveBodyUrls(val);
    }
  }
  return obj;
}

module.exports = {
  resolveDirectImageUrl,
  resolveBodyUrls
};
