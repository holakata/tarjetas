// Escritor mínimo de archivos Excel (.xlsx): varias hojas, texto y números. Sin librerías.
const XLSX = (() => {
  const enc = new TextEncoder();
  const tabla = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc = (b) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = tabla[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const x = (s) => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const col = (n) => { let s = ''; for (n++; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };
  const celda = (v, r, c, tit) => {
    const ref = col(c) + (r + 1);
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"><v>${v}</v></c>`;
    if (typeof v === 'boolean') v = v ? 'Sí' : 'No';
    if (typeof v === 'object') v = JSON.stringify(v);
    return `<c r="${ref}" t="inlineStr"${tit ? ' s="1"' : ''}><is><t xml:space="preserve">${x(v)}</t></is></c>`;
  };
  const hoja = (filas) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${filas.map((f, r) => `<row r="${r + 1}">${f.map((v, c) => celda(v, r, c, r === 0)).join('')}</row>`).join('')}</sheetData></worksheet>`;
  function zip(archivos) {
    const partes = [], central = []; let pos = 0;
    const u16 = (n) => [n & 255, (n >> 8) & 255], u32 = (n) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
    for (const [nombre, texto] of archivos) {
      const nom = enc.encode(nombre), dat = enc.encode(texto), c = crc(dat);
      const cab = new Uint8Array([0x50, 0x4B, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(dat.length), ...u32(dat.length), ...u16(nom.length), 0, 0]);
      partes.push(cab, nom, dat);
      central.push(new Uint8Array([0x50, 0x4B, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(dat.length), ...u32(dat.length), ...u16(nom.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(pos)]), nom);
      pos += cab.length + nom.length + dat.length;
    }
    const tam = central.reduce((a, p) => a + p.length, 0);
    const fin = new Uint8Array([0x50, 0x4B, 5, 6, 0, 0, 0, 0, ...u16(archivos.length), ...u16(archivos.length), ...u32(tam), ...u32(pos), 0, 0]);
    const todo = [...partes, ...central, fin], out = new Uint8Array(todo.reduce((a, p) => a + p.length, 0));
    let o = 0; for (const p of todo) { out.set(p, o); o += p.length; }
    return out;
  }
  // hojas: [{ nombre, filas: [[encabezados], [fila], ...] }]
  function crear(hojas) {
    const nombres = hojas.map((h, i) => (h.nombre || 'Hoja' + (i + 1)).replace(/[\\\/?*\[\]:]/g, ' ').slice(0, 31));
    const ar = [
      ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${hojas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${nombres.map((n, i) => `<sheet name="${x(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
      ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hojas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
      ...hojas.map((h, i) => [`xl/worksheets/sheet${i + 1}.xml`, hoja(h.filas)]),
    ];
    return zip(ar);
  }
  // Convierte una lista de objetos en filas con encabezados (une todas las claves).
  function deObjetos(lista, mapa = {}) {
    const claves = []; (lista || []).forEach((o) => Object.keys(o).forEach((k) => { if (!claves.includes(k)) claves.push(k); }));
    return [claves.map((k) => mapa[k] || k), ...(lista || []).map((o) => claves.map((k) => o[k]))];
  }
  function descargar(bytes, nombre) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    a.download = nombre; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  return { crear, deObjetos, descargar };
})();
if (typeof module !== 'undefined') module.exports = XLSX;
