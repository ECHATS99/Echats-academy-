export async function hashFlag(flag: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(flag.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function validateFlag(inputFlag: string, targetHash: string): Promise<boolean> {
  return hashFlag(inputFlag).then(hash => hash === targetHash.toLowerCase());
}
