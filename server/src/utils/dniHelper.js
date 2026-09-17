import crypto from 'crypto';

export function maskDni(dni) {
  if (!dni && dni !== 0) return '';
  const str = String(dni).trim();
  if (!str || str === 'S/D' || str === 'N/A') return 'S/D';

  if (str.includes('*') || str.includes('•')) {
    const clean = str.replace(/\s+/g, '');
    const last3 = clean.slice(-3);
    const prefix = clean.slice(0, -3);
    return (prefix.length > 0 ? prefix : '*****') + last3;
  }

  const clean = str.replace(/\s+/g, '');
  if (clean.length <= 3) {
    return '*****' + clean;
  }

  const last3 = clean.slice(-3);
  const hiddenCount = Math.max(clean.length - 3, 3);
  return '*'.repeat(hiddenCount) + last3;
}

export function hashDni(dni) {
  if (!dni && dni !== 0) return null;
  const clean = String(dni).trim().replace(/\D/g, '');
  if (!clean) {
    // Si ya viene enmascarado con asteriscos, usar hash de los últimos dígitos
    return crypto.createHash('sha256').update(String(dni).trim()).digest('hex');
  }
  return crypto.createHash('sha256').update(clean).digest('hex');
}
