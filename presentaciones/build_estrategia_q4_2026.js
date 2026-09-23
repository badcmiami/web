const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const fs = require("fs");

// ---------- Marca / estilo ----------
const C = {
  navy: "14213D", sky: "284A6D", red: "C8000A", orange: "E8834A",
  green: "2E8B57", ink: "1F2430", gray: "5B6270", mute: "8A92A0",
  light: "F3F5F8", line: "DDE2E8", white: "FFFFFF", amber: "D99A1E",
};
const F = "Calibri";
const W = 13.333, H = 7.5, M = 0.6;

async function icon(Comp, color, size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

const k = (n) => "$" + Math.round(n).toLocaleString("en-US") + "k";

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Estrategia Q4 2026 · Electromedicina";

  const I = {
    target: await icon(fa.FaBullseye, C.white),
    chart: await icon(fa.FaChartLine, C.white),
    box: await icon(fa.FaBoxes, C.white),
    hosp: await icon(fa.FaHospital, C.white),
    warn: await icon(fa.FaExclamationTriangle, C.white),
    check: await icon(fa.FaCheck, C.white),
    bolt: await icon(fa.FaBolt, C.white),
    cal: await icon(fa.FaCalendarAlt, C.white),
  };

  // ---------- helpers ----------
  function header(s, kicker, title, n) {
    s.background = { color: C.white };
    s.addText(kicker.toUpperCase(), { x: M, y: 0.42, w: 9, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.red, charSpacing: 2, margin: 0, isTextBox: true });
    s.addText(title, { x: M, y: 0.72, w: W - 2 * M, h: 0.75, fontFace: F, fontSize: 30, bold: true, color: C.navy, margin: 0, valign: "top", isTextBox: true });
    s.addText(`Estrategia Q4 2026 · EM   ${n}`, { x: W - M - 4, y: H - 0.42, w: 4, h: 0.25, fontFace: F, fontSize: 9, color: C.mute, align: "right", margin: 0, isTextBox: true });
  }
  function badge(s, x, y, img, color = C.red, d = 0.46) {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 } });
    s.addImage({ data: img, x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5 });
  }
  function card(s, x, y, w, h, fill = C.light) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill, width: 0 } });
  }
  function stat(s, x, y, w, val, lab, color = C.navy, fs = 34) {
    s.addText(val, { x, y, w, h: 0.62, fontFace: F, fontSize: fs, bold: true, color, margin: 0, isTextBox: true });
    s.addText(lab, { x, y: y + 0.64, w, h: 0.5, fontFace: F, fontSize: 12, color: C.gray, margin: 0, valign: "top", isTextBox: true });
  }
  function bullets(s, items, x, y, w, h, fs = 14, color = C.ink) {
    const arr = items.map((t, i) => {
      const runs = Array.isArray(t) ? t : [{ text: t }];
      return runs.map((r, j) => ({ text: r.text, options: { bold: !!r.b, color: r.c || color, bullet: Array.isArray(t) ? false : { indent: 14 }, breakLine: j === runs.length - 1 && i < items.length - 1, paraSpaceAfter: Array.isArray(t) ? 9 : 6 } }));
    }).flat();
    s.addText(arr, { x, y, w, h, fontFace: F, fontSize: fs, valign: "top", margin: 0, isTextBox: true });
  }
  const tcell = (t, o = {}) => ({ text: t, options: Object.assign({ fontFace: F, fontSize: 11, color: C.ink, valign: "middle" }, o) });
  const thead = (arr, aligns) => arr.map((t, i) => tcell(t, { bold: true, color: C.white, fill: { color: C.navy }, align: aligns[i] || "left", fontSize: 11 }));

  // =====================================================================
  // 1. PORTADA
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    s.addImage({ path: "bg90.jpg", x: 0, y: 0, w: W, h: H });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: C.navy, transparency: 30 }, line: { color: C.navy, width: 0 } });
    s.addText("ELECTROMEDICINA · TERRITORIO SIERRA", { x: M, y: 2.3, w: 8, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: C.orange, charSpacing: 3, margin: 0, isTextBox: true });
    s.addText("Estrategia de ventas Q4 2026", { x: M, y: 2.7, w: 9, h: 1.0, fontFace: F, fontSize: 48, bold: true, color: C.white, margin: 0, isTextBox: true });
    s.addText("Plan de cierre octubre – diciembre: líneas, stock y comportamiento por cuenta", { x: M, y: 3.75, w: 8.5, h: 0.5, fontFace: F, fontSize: 18, color: "DCE3EC", margin: 0, isTextBox: true });
    s.addText("Corte de datos: 22 de septiembre de 2026", { x: M, y: H - 0.9, w: 6, h: 0.3, fontFace: F, fontSize: 11, color: "C9D2DE", margin: 0, isTextBox: true });
  }

  // =====================================================================
  // 2. RESUMEN EJECUTIVO
  {
    const s = pres.addSlide();
    header(s, "Resumen ejecutivo", "Faltan $438k: el ritmo debe subir de $84k a $146k por mes", 2);
    const kp = [
      ["$759k", "Ventas EM 2026 a la fecha", C.navy],
      ["$1.198M", "Presupuesto anual EM", C.navy],
      ["63,4%", "Cumplimiento actual", C.red],
      ["$438k", "Brecha a cerrar oct–dic", C.red],
    ];
    const cw = (W - 2 * M - 3 * 0.3) / 4;
    kp.forEach((q, i) => {
      const x = M + i * (cw + 0.3);
      card(s, x, 1.75, cw, 1.45);
      stat(s, x + 0.3, 1.95, cw - 0.5, q[0], q[1], q[2], 34);
    });
    // conclusiones
    s.addText("Lo que dicen los datos", { x: M, y: 3.55, w: 6, h: 0.4, fontFace: F, fontSize: 18, bold: true, color: C.navy, margin: 0, isTextBox: true });
    bullets(s, [
      [{ text: "La venta depende de un solo evento: ", b: true }, { text: "IESS ($369k) es el 49% del año y no es recurrente." }],
      [{ text: "4 líneas concentran la brecha: ", b: true }, { text: "esterilización baja y alta temperatura, ECG y lavadoras ($594k bajo meta)." }],
      [{ text: "El insumo es la base estable: ", b: true }, { text: "$40k/mes, 90% concentrado en 8 cuentas." }],
      [{ text: "Hay $865k de stock EM disponible ", b: true }, { text: "(a costo) que respalda el pipeline y financia aceleradores." }],
    ], M, 4.05, 6.4, 2.6, 14);
    // escenario
    card(s, 7.45, 3.55, W - M - 7.45, 3.15, C.navy);
    s.addText("PROYECCIÓN A DICIEMBRE", { x: 7.8, y: 3.8, w: 4.5, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.orange, charSpacing: 2, margin: 0, isTextBox: true });
    s.addText([
      { text: "92%", options: { fontSize: 54, bold: true, color: C.white } },
      { text: "  escenario base ponderado", options: { fontSize: 14, color: "C9D2DE" } },
    ], { x: 7.8, y: 4.15, w: 5, h: 1.0, fontFace: F, margin: 0, valign: "middle", isTextBox: true });
    s.addText("Con 4 aceleradores respaldados por stock se llega a 100%. Techo: 111% si cierra todo el pipeline, incluido Solca ($260k).", { x: 7.8, y: 5.25, w: 4.6, h: 1.1, fontFace: F, fontSize: 13, color: C.white, margin: 0, valign: "top", isTextBox: true });
    s.addNotes("Brecha = presupuesto 1.197.970 – ventas 759.457. Ritmo actual = 759k / 9 meses. Ritmo requerido = 438,5k / 3 meses.");
  }

  // =====================================================================
  // 3. LÍNEAS
  {
    const s = pres.addSlide();
    header(s, "Líneas de negocio", "Cuatro líneas concentran el 79% del faltante por línea", 3);
    const labels = ["Esteril. baja temp.", "Esteril. alta temp.", "ECG", "Lavadora", "Ventiladores", "Desfibrilador", "Lámpara", "EMG"];
    const vals = [272.4, 129.0, 114.2, 78.2, 49.7, 45.4, 37.0, 28.1];
    s.addChart(pres.charts.BAR, [{ name: "Brecha vs presupuesto ($k)", labels, values: vals }], {
      x: M, y: 1.6, w: 7.3, h: 5.2, barDir: "bar", catAxisOrientation: "maxMin",
      chartColors: [C.red, C.red, C.red, C.red, C.mute, C.mute, C.mute, C.mute],
      barGapWidthPct: 45, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '"$"#,##0"k"',
      dataLabelFontSize: 11, dataLabelColor: C.ink, dataLabelFontFace: F,
      catAxisLabelFontSize: 12, catAxisLabelFontFace: F, catAxisLabelColor: C.ink, catAxisLineShow: false,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      showLegend: false, showTitle: true, title: "Brecha por línea (presupuesto – venta, $k)", titleFontSize: 13, titleColor: C.gray, titleFontFace: F,
    });
    // Nota: una sola serie → varyColors por punto
    const x0 = 8.3, w0 = W - M - x0;
    card(s, x0, 1.6, w0, 2.45);
    badge(s, x0 + 0.3, 1.85, I.warn);
    s.addText("Sobre-cumplidas", { x: x0 + 0.9, y: 1.88, w: w0 - 1.1, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.navy, margin: 0, isTextBox: true });
    s.addText([
      { text: "Monitor multiparámetro 335% ", options: { bold: true, breakLine: true } },
      { text: "sostenido por IESS; no repetible en Q4.", options: { breakLine: true } },
      { text: "Descartables 162% ", options: { bold: true, breakLine: true } },
      { text: "consumo recurrente sano: proteger precio y abasto." },
    ], { x: x0 + 0.3, y: 2.45, w: w0 - 0.5, h: 1.5, fontFace: F, fontSize: 12, color: C.ink, margin: 0, valign: "top", isTextBox: true });
    card(s, x0, 4.3, w0, 2.5);
    badge(s, x0 + 0.3, 4.55, I.target);
    s.addText("Foco Q4", { x: x0 + 0.9, y: 4.58, w: w0 - 1.1, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.navy, margin: 0, isTextBox: true });
    s.addText([
      { text: "Esterilización: ", options: { bold: true } }, { text: "Solca + HVQ ($325k) y campaña V-PRO en stock.", options: { breakLine: true } },
      { text: "ECG: ", options: { bold: true } }, { text: "18 equipos en bodega, venta por volumen.", options: { breakLine: true } },
      { text: "Lavadora: ", options: { bold: true } }, { text: "renovación de contrato HVQ (diciembre)." },
    ], { x: x0 + 0.3, y: 5.15, w: w0 - 0.5, h: 1.55, fontFace: F, fontSize: 12, color: C.ink, margin: 0, valign: "top", paraSpaceAfter: 4, isTextBox: true });
    s.addNotes("Brecha bruta de líneas bajo meta = $754k; se compensa parcialmente con monitor multiparámetro (+$281k). Las 4 líneas principales suman $594k.");
  }

  // =====================================================================
  // 4. CUENTAS
  {
    const s = pres.addSlide();
    header(s, "Comportamiento por cuenta", "Crecen 4 cuentas; 5 explican la caída de la base", 4);
    const labels = ["Corporación HVQ", "Clinmeyd", "Clínica Pasteur", "H. de los Valles", "Clínica Internacional", "Solca", "Hospital Metropolitano", "Pichincha – varios", "Dr. Guerra Salazar"];
    const vals = [32.2, 20.3, 11.0, 2.1, -15.0, -19.2, -57.9, -57.9, -59.4];
    const pct = ["+124%", "+48%", "+22%", "+20%", "-38%", "-66%", "-51%", "-43%", "-87%"];
    s.addChart(pres.charts.BAR, [{ name: "Variación 2026 vs 2025 ($k)", labels, values: vals }], {
      x: M, y: 1.6, w: 7.4, h: 5.2, barDir: "bar", catAxisOrientation: "maxMin",
      chartColors: [C.green, C.green, C.green, C.green, C.red, C.red, C.red, C.red, C.red],
      barGapWidthPct: 40, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '+"$"#,##0.0"k";-"$"#,##0.0"k"',
      dataLabelFontSize: 11, dataLabelColor: C.ink, dataLabelFontFace: F,
      catAxisLabelFontSize: 12, catAxisLabelFontFace: F, catAxisLabelColor: C.ink, catAxisLabelPos: "low", catAxisLineShow: false,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMinVal: -80, valAxisMaxVal: 50,
      showLegend: false, showTitle: true, title: "Variación de venta EM 2026 vs 2025 por grupo económico ($k)", titleFontSize: 13, titleColor: C.gray, titleFontFace: F,
    });
    const x0 = 8.35, w0 = W - M - x0;
    const blocks = [
      [I.warn, C.red, "IESS enmascara la caída", "Sin la venta única al IESS ($369k), la base de clientes vende menos que en 2025."],
      [I.target, C.navy, "Presupuesto sin dueño", "$1,04M (87%) está en «Pichincha – varios». Asignarlo por cuenta es condición para gestionar."],
      [I.hosp, C.green, "Recuperar Metro y Guerra", "-$117k entre ambas. Metro ya tiene $62k de pipeline Q4; Guerra requiere visita de reactivación."],
    ];
    blocks.forEach((b, i) => {
      const y = 1.6 + i * 1.78;
      card(s, x0, y, w0, 1.6);
      badge(s, x0 + 0.25, y + 0.25, b[0], b[1]);
      s.addText(b[2], { x: x0 + 0.85, y: y + 0.25, w: w0 - 1.0, h: 0.45, fontFace: F, fontSize: 14, bold: true, color: C.navy, margin: 0, valign: "middle", isTextBox: true });
      s.addText(b[3], { x: x0 + 0.25, y: y + 0.78, w: w0 - 0.45, h: 0.75, fontFace: F, fontSize: 11.5, color: C.ink, margin: 0, valign: "top", isTextBox: true });
    });
    s.addNotes("Fuente: tablero EM por grupo económico 2026. Porcentajes: HVQ +124%, Clinmeyd +48%, Pasteur +22%, Valles +20%, CI -38%, Solca -66%, Metro -51%, Pichincha varios -43%, Guerra -87%. IESS +$368,7k excluido del gráfico por ser venta única.");
  }

  // =====================================================================
  // 5. INSUMOS RECURRENTES
  {
    const s = pres.addSlide();
    header(s, "Insumos EM · base recurrente", "$40k al mes seguros: la base para asegurar $120k en Q4", 5);
    const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep*"];
    const vals = [19.8, 44.0, 31.7, 56.7, 33.1, 42.7, 44.5, 48.8, 26.3];
    s.addChart(pres.charts.BAR, [{ name: "Insumos EM Sierra ($k)", labels, values: vals }], {
      x: M, y: 1.6, w: 7.4, h: 4.6, barDir: "col",
      chartColors: [C.sky, C.sky, C.sky, C.sky, C.sky, C.sky, C.sky, C.sky, C.mute],
      barGapWidthPct: 45, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '"$"0.0"k"', dataLabelFontSize: 11, dataLabelColor: C.ink,
      catAxisLabelFontSize: 12, catAxisLabelColor: C.ink, catAxisLabelFontFace: F, catAxisLineShow: false,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMaxVal: 65,
      showLegend: false, showTitle: true, title: "Venta mensual de insumos EM, Sierra 2026 ($k)", titleFontSize: 13, titleColor: C.gray, titleFontFace: F,
    });
    s.addText("*Septiembre parcial al día 22. Total 2026: $347,7k.", { x: M, y: 6.3, w: 7.4, h: 0.3, fontFace: F, fontSize: 10, color: C.mute, margin: 0, isTextBox: true });
    const x0 = 8.35, w0 = W - M - x0;
    card(s, x0, 1.6, w0, 1.5);
    stat(s, x0 + 0.3, 1.8, w0 - 0.5, "$120k", "Piso Q4 (promedio ene–ago × 3)", C.navy, 32);
    card(s, x0, 3.3, w0, 1.5);
    stat(s, x0 + 0.3, 3.5, w0 - 0.5, "$136k", "Si se sostiene el ritmo jun–ago ($45k/mes)", C.green, 32);
    card(s, x0, 5.0, w0, 1.6);
    stat(s, x0 + 0.3, 5.2, w0 - 0.5, "90%", "de la venta viene de 8 cuentas: perder una cuesta un mes entero", C.red, 32);
    s.addNotes("Mezcla: esterilización baja temperatura 69% ($238k), lavadora 9%, alta temperatura 7%, monitoreo 6%, descartables 4%.");
  }

  // =====================================================================
  // 6. TABLA POR CUENTA (INSUMOS)
  {
    const s = pres.addSlide();
    header(s, "Plan por cuenta · insumos", "Cada cuenta tiene una acción concreta para Q4", 6);
    const al = ["left", "right", "center", "left"];
    const rows = [
      ["Clinmeyd", "$62,5k", "▲", "Proteger volumen V-PRO; abrir detergentes de lavadora (hoy $0)."],
      ["Clínica Pasteur", "$55,4k", "▲", "98% baja temperatura: sumar integradores e indicadores de vapor."],
      ["SIME Simetecuida", "$36,0k", "■", "Contrato fijo de $4,5k/mes: septiembre aún sin facturar, confirmar."],
      ["H. San Juan Bautista Ambato", "$35,7k", "■", "100% baja temperatura: cross-sell de alta temperatura y monitoreo."],
      ["Ginecomed", "$33,9k", "▼", "Compra irregular: pactar pedido programado mensual."],
      ["Hospital Metropolitano", "$32,8k", "■", "Cuenta más diversificada: accesorios de monitoreo y desfibrilador."],
      ["Corporación HVQ", "$32,3k", "▲", "Tendencia al alza (ago $7,1k): anclar consumibles en renovación de diciembre."],
      ["Clínica Internacional", "$24,3k", "▼", "-38% en V-PRO: prueba de detergentes y consumibles de vapor."],
      ["Hospifuturo", "$5,2k", "●", "V-PRO en comodato ($68k) sin consumo de baja temperatura: auditar."],
      ["Davinci GUV", "$6,5k", "●", "Sin compra desde el 15 de junio: visita de reactivación."],
    ];
    const col = { "▲": C.green, "▼": C.red, "■": C.gray, "●": C.amber };
    const data = [thead(["Cuenta", "Insumos 2026", "Tend.", "Acción Q4"], al)];
    rows.forEach((r, i) => {
      const fill = { color: i % 2 ? C.white : C.light };
      data.push([
        tcell(r[0], { bold: true, fill }), tcell(r[1], { align: "right", fill }),
        tcell(r[2], { align: "center", color: col[r[2]], bold: true, fill, fontSize: 12 }), tcell(r[3], { fill }),
      ]);
    });
    s.addTable(data, { x: M, y: 1.6, w: W - 2 * M, colW: [3.0, 1.45, 0.8, W - 2 * M - 5.25], rowH: 0.43, border: { type: "solid", pt: 0.5, color: C.line }, margin: [0.04, 0.1, 0.04, 0.1] });
    s.addText("▲ crece   ■ estable   ▼ cae   ● alerta", { x: M, y: 6.45, w: 6, h: 0.3, fontFace: F, fontSize: 10, color: C.mute, margin: 0, isTextBox: true });
  }

  // =====================================================================
  // 7. STOCK
  {
    const s = pres.addSlide();
    header(s, "Inventario EM disponible", "$865k en stock vendible: primero lo que ya está en bodega", 7);
    const st = JSON.parse(fs.readFileSync("stock.json", "utf8"));
    const labels = Object.keys(st).filter((x) => x !== "Otros").map((x) => x.replace(" (mesa/lámpara/anest.)", ""));
    const keys = Object.keys(st).filter((x) => x !== "Otros");
    s.addChart(pres.charts.BAR, [
      { name: "Equipos", labels, values: keys.map((x) => st[x][0]) },
      { name: "Accesorios", labels, values: keys.map((x) => st[x][1]) },
    ], {
      x: M, y: 1.6, w: 7.4, h: 5.1, barDir: "bar", barGrouping: "stacked", catAxisOrientation: "maxMin",
      chartColors: [C.navy, C.orange], barGapWidthPct: 45,
      catAxisLabelFontSize: 12, catAxisLabelColor: C.ink, catAxisLabelFontFace: F, catAxisLineShow: false,
      valAxisLabelFontSize: 10, valAxisLabelColor: C.mute, valAxisLabelFormatCode: '"$"0"k"', valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" },
      showLegend: true, legendPos: "b", legendFontSize: 11, legendFontFace: F,
      showTitle: true, title: "Stock a costo por familia ($k): Guayaquil, Quito, activo comercial y demo", titleFontSize: 13, titleColor: C.gray, titleFontFace: F,
    });
    const x0 = 8.35, w0 = W - M - x0;
    card(s, x0, 1.6, w0, 2.2);
    badge(s, x0 + 0.25, 1.82, I.check, C.green);
    s.addText("Respalda el pipeline", { x: x0 + 0.85, y: 1.82, w: w0 - 1, h: 0.46, fontFace: F, fontSize: 14, bold: true, color: C.navy, margin: 0, valign: "middle", isTextBox: true });
    s.addText("26 desfibriladores · 33 monitores · 4 ventiladores NKV-550 · 18 ECG · autoclave Sercon 364 L.", { x: x0 + 0.25, y: 2.4, w: w0 - 0.45, h: 1.3, fontFace: F, fontSize: 12, color: C.ink, margin: 0, valign: "top", isTextBox: true });
    card(s, x0, 4.0, w0, 2.7);
    badge(s, x0 + 0.25, 4.22, I.bolt, C.red);
    s.addText("Stock sin destino: vender", { x: x0 + 0.85, y: 4.22, w: w0 - 1, h: 0.46, fontFace: F, fontSize: 14, bold: true, color: C.navy, margin: 0, valign: "middle", isTextBox: true });
    s.addText([
      { text: "3 V-PRO ($135k) → brecha de baja temperatura", options: { bullet: { indent: 12 }, breakLine: true } },
      { text: "2 mesas Surginox ($43k) y lámpara XLED", options: { bullet: { indent: 12 }, breakLine: true } },
      { text: "Accesorios de monitoreo ($200k) → base instalada", options: { bullet: { indent: 12 }, breakLine: true } },
      { text: "Neuro EEG/EMG ($61k) → HVQ, Neuroquito", options: { bullet: { indent: 12 } } },
    ], { x: x0 + 0.25, y: 4.8, w: w0 - 0.45, h: 1.8, fontFace: F, fontSize: 12, color: C.ink, margin: 0, valign: "top", paraSpaceAfter: 4, isTextBox: true });
    s.addNotes("Excluye comodatos ($1,66M), arrendados, instalaciones y garantías. Solca requiere 2 autoclaves (Ibarra y Santo Domingo): en stock hay 1 Sercon 364 L comprometido con HVQ y 1 Sercon 100 L. Confirmar configuración e importar.");
  }

  // =====================================================================
  // 8. PIPELINE
  {
    const s = pres.addSlide();
    header(s, "Pipeline de equipos Q4", "$433k en pipeline: $225k ponderado por probabilidad", 8);
    const al = ["left", "left", "center", "right", "center", "right", "center"];
    const rows = [
      ["Metropolitano", "Desfibriladores", "Sep", 20.0, "90%", "✓"],
      ["Metropolitano", "Monitores", "Oct–Nov", 42.0, "75%", "✓"],
      ["Corporación HVQ", "Esterilización alta temp.", "Oct", 65.0, "70%", "✓"],
      ["H. de los Valles", "Desfib. + ECG + monitores", "Nov", 21.5, "60%", "✓"],
      ["Clínica Internacional", "Monitores de piso (spot check)", "Nov", 10.0, "50%", "✓"],
      ["Solca", "Ventiladores", "Nov–Dic", 14.0, "60%", "✓"],
      ["Solca", "Alta temp. Ibarra y Sto. Domingo", "Dic", 260.0, "40%", "!"],
    ];
    const data = [thead(["Cuenta", "Solución", "Mes", "Valor", "Prob.", "Ponderado", "Stock"], al)];
    let tot = 0, tw = 0;
    rows.forEach((r, i) => {
      const fill = { color: i % 2 ? C.white : C.light };
      const w = r[3] * parseInt(r[4]) / 100; tot += r[3]; tw += w;
      const ok = r[5] === "✓";
      data.push([
        tcell(r[0], { bold: true, fill }), tcell(r[1], { fill }), tcell(r[2], { align: "center", fill }),
        tcell("$" + r[3].toFixed(1) + "k", { align: "right", fill }), tcell(r[4], { align: "center", fill }),
        tcell("$" + w.toFixed(1) + "k", { align: "right", fill, bold: true }),
        tcell(ok ? "✓" : "Importar", { align: "center", fill, bold: true, color: ok ? C.green : C.red }),
      ]);
    });
    data.push([
      tcell("Total", { bold: true, color: C.white, fill: { color: C.sky } }), tcell("", { fill: { color: C.sky } }), tcell("", { fill: { color: C.sky } }),
      tcell("$" + tot.toFixed(1) + "k", { bold: true, align: "right", color: C.white, fill: { color: C.sky } }), tcell("", { fill: { color: C.sky } }),
      tcell("$" + tw.toFixed(1) + "k", { bold: true, align: "right", color: C.white, fill: { color: C.sky } }), tcell("", { fill: { color: C.sky } }),
    ]);
    s.addTable(data, { x: M, y: 1.6, w: 8.6, colW: [1.9, 2.3, 0.85, 0.95, 0.7, 1.05, 0.85], rowH: 0.44, border: { type: "solid", pt: 0.5, color: C.line }, margin: [0.04, 0.08, 0.04, 0.08] });
    const x0 = 9.55, w0 = W - M - x0;
    card(s, x0, 1.6, w0, 5.1, C.navy);
    badge(s, x0 + 0.3, 1.85, I.warn, C.red);
    s.addText("Riesgo crítico", { x: x0 + 0.9, y: 1.85, w: w0 - 1, h: 0.46, fontFace: F, fontSize: 15, bold: true, color: C.white, margin: 0, valign: "middle", isTextBox: true });
    s.addText([
      { text: "Solca = 60% del pipeline.", options: { bold: true, breakLine: true } },
      { text: "Son 2 autoclaves y solo hay 1 unidad libre en bodega.", options: { breakLine: true } },
      { text: " ", options: { breakLine: true } },
      { text: "Para facturar en diciembre: ", options: { bold: true, color: C.orange } },
      { text: "orden a fábrica antes del 15 de octubre y adjudicación en noviembre.", options: { breakLine: true } },
      { text: " ", options: { breakLine: true } },
      { text: "Metro San Patricio ($300k, 2027): ", options: { bold: true, color: C.orange } },
      { text: "buscar orden de compra con anticipo en diciembre." },
    ], { x: x0 + 0.3, y: 2.5, w: w0 - 0.55, h: 4.0, fontFace: F, fontSize: 12.5, color: C.white, margin: 0, valign: "top", isTextBox: true });
    s.addNotes("Probabilidades asignadas según etapa y tipo de cliente (privado vs público). Ajustar semanalmente con el equipo comercial.");
  }

  // =====================================================================
  // 9. ESCENARIOS + ACELERADORES
  {
    const s = pres.addSlide();
    header(s, "Proyección de cierre", "Base 92%: cuatro aceleradores cierran los $93k restantes", 9);
    s.addChart(pres.charts.BAR, [
      { name: "Venta a la fecha", labels: ["Conservador", "Base", "Base + aceleradores", "Optimista"], values: [759.5, 759.5, 759.5, 759.5] },
      { name: "Insumos Q4", labels: ["Conservador", "Base", "Base + aceleradores", "Optimista"], values: [108.4, 120.5, 120.5, 136.0] },
      { name: "Equipos Q4", labels: ["Conservador", "Base", "Base + aceleradores", "Optimista"], values: [121.3, 225.3, 225.3, 432.5] },
      { name: "Aceleradores", labels: ["Conservador", "Base", "Base + aceleradores", "Optimista"], values: [0, 0, 92.7, 0] },
    ], {
      x: M, y: 1.6, w: 6.9, h: 5.1, barDir: "col", barGrouping: "stacked", barGapWidthPct: 55,
      chartColors: [C.mute, C.sky, C.navy, C.red],
      showValue: false,
      catAxisLabelFontSize: 11, catAxisLabelColor: C.ink, catAxisLabelFontFace: F, catAxisLineShow: false,
      valAxisMinVal: 0, valAxisMaxVal: 1400, valAxisMajorUnit: 200, valAxisLabelFormatCode: '"$"#,##0"k"', valAxisLabelFontSize: 10, valAxisLabelColor: C.mute,
      valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" },
      showLegend: true, legendPos: "b", legendFontSize: 11, legendFontFace: F,
      showTitle: true, title: "Cierre proyectado a diciembre ($k) · meta $1.198k", titleFontSize: 13, titleColor: C.gray, titleFontFace: F,
    });
    // etiquetas de % sobre cada columna (plot aprox.)
    const tots = [["$989k · 83%", C.gray], ["$1.105k · 92%", C.navy], ["$1.198k · 100%", C.red], ["$1.328k · 111%", C.green]];
    tots.forEach((t, i) => {
      s.addText(t[0], { x: M + 0.88 + i * 1.5, y: 1.95, w: 1.5, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: t[1], align: "center", margin: 0, isTextBox: true });
    });
    const x0 = 7.85, w0 = W - M - x0;
    s.addText("Aceleradores respaldados por stock", { x: x0, y: 1.6, w: w0, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: C.navy, margin: 0, isTextBox: true });
    const acc = [
      ["1", "Equipo mayor del stock", "1 V-PRO, autoclave Sercon 100 o mesa Surginox", "≥ $45k"],
      ["2", "Insumos cruzados", "Alta temperatura y detergentes en Pasteur, Ambato, Clinmeyd, Internacional", "$25k"],
      ["3", "Campaña ECG", "16 equipos a ~$1,5k: clínicas, consultorios, Valles", "$24k"],
      ["4", "Accesorios a base instalada", "Sensores, CO2 y NIBP: Metro, Solca, Valles, HVQ", "$20k"],
    ];
    acc.forEach((a, i) => {
      const y = 2.15 + i * 1.12;
      card(s, x0, y, w0, 0.98);
      s.addShape(pres.shapes.OVAL, { x: x0 + 0.2, y: y + 0.25, w: 0.46, h: 0.46, fill: { color: C.red }, line: { color: C.red, width: 0 } });
      s.addText(a[0], { x: x0 + 0.2, y: y + 0.25, w: 0.46, h: 0.46, fontFace: F, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", margin: 0, isTextBox: true });
      s.addText(a[1], { x: x0 + 0.85, y: y + 0.1, w: w0 - 2.1, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: C.navy, margin: 0, valign: "middle", isTextBox: true });
      s.addText(a[2], { x: x0 + 0.85, y: y + 0.44, w: w0 - 2.1, h: 0.5, fontFace: F, fontSize: 10.5, color: C.gray, margin: 0, valign: "top", isTextBox: true });
      s.addText(a[3], { x: x0 + w0 - 1.2, y: y + 0.1, w: 1.05, h: 0.78, fontFace: F, fontSize: 16, bold: true, color: C.red, align: "right", valign: "middle", margin: 0, isTextBox: true });
    });
    s.addText("Potencial de aceleradores: $114k frente a $93k requeridos (22% de holgura).", { x: x0, y: 6.7 - 0.2, w: w0, h: 0.3, fontFace: F, fontSize: 11, italic: true, color: C.gray, margin: 0, isTextBox: true });
    s.addNotes("Conservador: insumos -10% y sin Solca alta temperatura. Base: insumos al promedio ene–ago y pipeline ponderado. Optimista: pipeline al 100% e insumos al ritmo jun–ago.");
  }

  // =====================================================================
  // 10. HVQ
  {
    const s = pres.addSlide();
    header(s, "Cuenta clave · Corporación HVQ", "HVQ: capitalizar el +124% en EM y frenar la caída de contrastes", 10);
    const cw = (W - 2 * M - 0.6) / 3;
    const kp = [["$58,1k", "EM 2026 · +124% vs 2025", C.green], ["$56,3k", "Contrastes 2026 · -22% (85% de cumplimiento)", C.red], ["1 jul", "Última compra de resonancia (~$9k por trimestre)", C.amber]];
    kp.forEach((q, i) => { const x = M + i * (cw + 0.3); card(s, x, 1.6, cw, 1.3); stat(s, x + 0.3, 1.75, cw - 0.5, q[0], q[1], q[2], 30); });
    const colw = (W - 2 * M - 0.4) / 2;
    const cols = [
      ["Electromedicina", I.hosp, C.navy, [
        [{ text: "Octubre: ", b: true }, { text: "cerrar esterilizador de alta temperatura ($65k); equipo en stock." }],
        [{ text: "Diciembre: ", b: true }, { text: "renovar contrato de ultrasónica y termodesinfectora, anclado a consumibles de alta temperatura y detergentes." }],
        [{ text: "Comodato V-PRO: ", b: true }, { text: "mover el equipo Axxis con 15 ciclos demo. Competencia: upgrade, mantenimiento sin costo y soporte 24/7." }],
        [{ text: "Pasta Elefix: ", b: true }, { text: "contrato anual de 36 unidades. Monitores para UCI pediátrica." }],
      ]],
      ["Contrastes", I.chart, C.red, [
        [{ text: "Resonancia: ", b: true }, { text: "recuperar el pedido del tercer trimestre en octubre." }],
        [{ text: "Angiografía: ", b: true }, { text: "cayó de $140k (2022) a $3k. Charla multipaciente en HVQ y Carapungo." }],
        [{ text: "Convenio de exámenes especiales en la renovación: ", b: true }, { text: "angiografía, histero y salpingografías, cistouretrografías." }],
        [{ text: "Extender el consumo ", b: true }, { text: "a Valles, Carapungo y las nuevas sedes." }],
      ]],
    ];
    cols.forEach((c, i) => {
      const x = M + i * (colw + 0.4);
      badge(s, x, 3.15, c[1], c[2]);
      s.addText(c[0], { x: x + 0.6, y: 3.15, w: colw - 0.6, h: 0.46, fontFace: F, fontSize: 17, bold: true, color: C.navy, margin: 0, valign: "middle", isTextBox: true });
      bullets(s, c[3], x, 3.8, colw, 2.9, 12.5);
    });
  }

  // =====================================================================
  // 11. CLÍNICA INTERNACIONAL
  {
    const s = pres.addSlide();
    header(s, "Cuenta clave · Clínica Internacional", "Internacional: 2 V-PRO en comodato y consumo en caída", 11);
    const cw = (W - 2 * M - 0.6) / 3;
    const kp = [["$24,3k", "EM 2026 · -38% (solo baja temperatura)", C.red], ["$59,9k", "Contrastes 2026 · -31% (66% de cumplimiento)", C.red], ["$74,9k", "Activo en comodato: 2 V-PRO + incubadora", C.navy]];
    kp.forEach((q, i) => { const x = M + i * (cw + 0.3); card(s, x, 1.6, cw, 1.3); stat(s, x + 0.3, 1.75, cw - 0.5, q[0], q[1], q[2], 30); });
    const colw = (W - 2 * M - 0.4) / 2;
    const cols = [
      ["Electromedicina", I.hosp, C.navy, [
        [{ text: "Validar ciclos V-PRO: ", b: true }, { text: "si no hay caída de cirugías, hay fuga de consumo a la competencia." }],
        [{ text: "Prueba de detergentes y consumibles de vapor ", b: true }, { text: "con la jefa de central (Lic. Acosta)." }],
        [{ text: "Consumibles de baja temperatura: ", b: true }, { text: "exclusividad (en alta ya trabajan solo con nosotros)." }],
        [{ text: "Noviembre: ", b: true }, { text: "monitores de piso para cardiología y pediatría ($10k, en stock)." }],
      ]],
      ["Contrastes", I.chart, C.red, [
        [{ text: "Iónico -40% y bario -45%: ", b: true }, { text: "prioridad de recuperación." }],
        [{ text: "Plan de consumo fidelizado ", b: true }, { text: "con precio atado a los equipos grandes (Internacional y Praxmed Carolina)." }],
        [{ text: "Base actual: ", b: true }, { text: "Optiray 320 50 ml (58 u/mes), kit de jeringa de 200 ml (71 u/mes)." }],
        [{ text: "Lanzamiento: ", b: true }, { text: "Xenetix 300 de 50 ml como producto de campaña." }],
      ]],
    ];
    cols.forEach((c, i) => {
      const x = M + i * (colw + 0.4);
      badge(s, x, 3.15, c[1], c[2]);
      s.addText(c[0], { x: x + 0.6, y: 3.15, w: colw - 0.6, h: 0.46, fontFace: F, fontSize: 17, bold: true, color: C.navy, margin: 0, valign: "middle", isTextBox: true });
      bullets(s, c[3], x, 3.8, colw, 2.9, 12.5);
    });
  }

  // =====================================================================
  // 12. METRO / SOLCA / VALLES
  {
    const s = pres.addSlide();
    header(s, "Cuentas a recuperar", "Metro, Solca y Valles: $358k del pipeline", 12);
    const cw = (W - 2 * M - 0.6) / 3;
    const cards = [
      ["Hospital Metropolitano", "-51%", "$62k pipeline Q4", [
        "Septiembre: facturar desfibriladores ($20k).",
        "Oct–nov: monitores ($42k) más set de accesorios.",
        "Insumos estables de $3,6k/mes: sumar descartables de presión.",
        "San Patricio ($300k): orden con anticipo en diciembre.",
      ]],
      ["Solca", "-66%", "$274k pipeline Q4", [
        "Ventiladores NKV-550 ($14k): 4 en stock.",
        "Autoclaves de Ibarra y Santo Domingo ($260k): cronograma de compra pública.",
        "Orden a fábrica antes del 15 de octubre.",
        "Accesorios de monitoreo para la base instalada.",
      ]],
      ["Hospital de los Valles", "+20%", "$21,5k pipeline Q4", [
        "Noviembre: desfibriladores, ECG y monitores.",
        "Insumos de $0,9k/mes: activar desfibrilador y monitoreo.",
        "Réplica del modelo HVQ: contrastes e insumos EM.",
        "Cuenta puente para Carapungo y nuevas sedes.",
      ]],
    ];
    cards.forEach((c, i) => {
      const x = M + i * (cw + 0.3);
      card(s, x, 1.6, cw, 5.1);
      s.addText(c[0], { x: x + 0.3, y: 1.8, w: cw - 0.6, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: C.navy, margin: 0, isTextBox: true });
      s.addText(c[1], { x: x + 0.3, y: 2.25, w: cw - 0.6, h: 0.75, fontFace: F, fontSize: 40, bold: true, color: c[1].startsWith("+") ? C.green : C.red, margin: 0, isTextBox: true });
      s.addText("Venta EM 2026 vs 2025 · " + c[2], { x: x + 0.3, y: 3.0, w: cw - 0.6, h: 0.35, fontFace: F, fontSize: 11.5, color: C.gray, margin: 0, isTextBox: true });
      bullets(s, c[3], x + 0.3, 3.55, cw - 0.6, 3.0, 12.5);
    });
  }

  // =====================================================================
  // 13. HOJA DE RUTA
  {
    const s = pres.addSlide();
    header(s, "Hoja de ruta", "Metas mensuales de facturación y los hitos que las aseguran", 13);
    const cw = (W - 2 * M - 0.6) / 3;
    const months = [
      ["Octubre", "$140k", ["HVQ alta temperatura ($65k)", "Metro monitores ($35k)", "Metro desfibriladores, si no se facturan en septiembre ($20k)", "Orden a fábrica de autoclaves Solca", "Pedido de resonancia HVQ"]],
      ["Noviembre", "$86k", ["Valles ($21,5k), Internacional ($10k) y Metro ($7k)", "Solca ventiladores ($7k)", "Campaña ECG y accesorios", "Adjudicación de Solca alta temperatura"]],
      ["Diciembre", "$307k", ["Solca alta temperatura ($260k)", "Solca ventiladores ($7k)", "Renovación del contrato HVQ", "Anticipo Metro San Patricio"]],
    ];
    months.forEach((m, i) => {
      const x = M + i * (cw + 0.3);
      card(s, x, 1.6, cw, 1.3, i === 2 ? C.navy : C.light);
      s.addText(m[0], { x: x + 0.3, y: 1.72, w: cw - 0.6, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: i === 2 ? C.orange : C.red, margin: 0, isTextBox: true });
      s.addText(m[1], { x: x + 0.3, y: 2.08, w: cw - 0.6, h: 0.65, fontFace: F, fontSize: 32, bold: true, color: i === 2 ? C.white : C.navy, margin: 0, isTextBox: true });
      bullets(s, m[2], x + 0.1, 3.15, cw - 0.2, 2.2, 12);
    });
    card(s, M, 5.55, W - 2 * M, 1.15, C.light);
    badge(s, M + 0.25, 5.88, I.cal, C.sky);
    s.addText([
      { text: "Control semanal (lunes):  ", options: { bold: true, color: C.navy } },
      { text: "cumplimiento acumulado vs $1.198k · pipeline ponderado · cuentas sin compra de insumos en más de 45 días · stock comprometido vs libre · estado de la compra pública de Solca." },
    ], { x: M + 0.9, y: 5.65, w: W - 2 * M - 1.1, h: 0.95, fontFace: F, fontSize: 12.5, color: C.ink, margin: 0, valign: "middle", isTextBox: true });
    s.addNotes("Cada mes incluye aproximadamente $40k de insumos recurrentes. Metas = pipeline al 100% + insumos. Octubre = 40 + 65 + 35. Noviembre = 40 + 21,5 + 10 + 7 + 7. Diciembre = 40 + 260 + 7. Si Metro desfibriladores pasa de septiembre, octubre suma $20k.");
  }

  // =====================================================================
  // 14. DECISIONES
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };
    s.addText("DECISIONES REQUERIDAS ESTA SEMANA", { x: M, y: 0.6, w: 9, h: 0.35, fontFace: F, fontSize: 12, bold: true, color: C.orange, charSpacing: 3, margin: 0, isTextBox: true });
    s.addText("Tres decisiones que definen el cierre del año", { x: M, y: 1.0, w: W - 2 * M, h: 0.8, fontFace: F, fontSize: 34, bold: true, color: C.white, margin: 0, isTextBox: true });
    const cw = (W - 2 * M - 0.6) / 3;
    const d = [
      ["01", "Importar autoclaves Solca", "Orden a fábrica antes del 15 de octubre. Sin ella, $260k (60% del pipeline) pasan a 2027."],
      ["02", "Asignar presupuesto por cuenta", "Distribuir los $1,04M de «Pichincha – varios» entre las cuentas para medir y gestionar."],
      ["03", "Liberar precio de campaña", "V-PRO, ECG y accesorios en stock: rotar $865k de inventario y cubrir los $93k finales."],
    ];
    d.forEach((q, i) => {
      const x = M + i * (cw + 0.3);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.3, w: cw, h: 3.2, rectRadius: 0.08, fill: { color: C.sky }, line: { color: C.sky, width: 0 } });
      s.addText(q[0], { x: x + 0.35, y: 2.55, w: 2, h: 0.8, fontFace: F, fontSize: 40, bold: true, color: C.red, margin: 0, isTextBox: true });
      s.addText(q[1], { x: x + 0.35, y: 3.4, w: cw - 0.7, h: 0.7, fontFace: F, fontSize: 18, bold: true, color: C.white, margin: 0, valign: "top", isTextBox: true });
      s.addText(q[2], { x: x + 0.35, y: 4.15, w: cw - 0.7, h: 1.2, fontFace: F, fontSize: 13, color: "DCE3EC", margin: 0, valign: "top", isTextBox: true });
    });
    s.addText([
      { text: "Meta de cierre: ", options: { color: "C9D2DE" } },
      { text: "$1.198k (100%)", options: { bold: true, color: C.white } },
      { text: "   ·   Base comprometida: ", options: { color: "C9D2DE" } },
      { text: "$1.105k (92%)", options: { bold: true, color: C.white } },
      { text: "   ·   Techo: ", options: { color: "C9D2DE" } },
      { text: "$1.328k (111%)", options: { bold: true, color: C.orange } },
    ], { x: M, y: 6.1, w: W - 2 * M, h: 0.45, fontFace: F, fontSize: 15, margin: 0, isTextBox: true });
  }

  await pres.writeFile({ fileName: "/home/user/web/presentaciones/Estrategia_Q4_2026_EM.pptx" });
  console.log("ok");
})();
