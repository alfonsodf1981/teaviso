export type PriceHitEmailData = {
  userName?: string | null;
  product: string;
  category: string;
  targetPrice: number;
  currentPrice: number;
  alertUrl: string;
};

function mxn(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

/** HTML email when a watched product hits the target price. Email + push only — nunca WhatsApp. */
export function priceHitEmailHtml(data: PriceHitEmailData): string {
  const name = data.userName?.split(" ")[0] || "amigo";
  const savings = Math.max(0, data.targetPrice - data.currentPrice);
  return `<!DOCTYPE html>
<html lang="es-MX">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>¡Bajó! ${escapeHtml(data.product)}</title></head>
<body style="margin:0;padding:0;background:#E8EAED;font-family:Inter,system-ui,sans-serif;color:#1A1A1A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E8EAED;padding:28px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFCF9;border:1px solid #F0EBE6;border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:22px 28px 18px;background:linear-gradient(135deg,#FFF7F2 0%,#FFFFFF 55%,#F8FAFC 100%);border-bottom:1px solid #E5E7EB;">
            <table width="100%"><tr>
              <td style="font-size:20px;font-weight:800;color:#FF6A3D;letter-spacing:-0.03em;">TeAviso</td>
              <td align="right"><span style="font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:#FF6A3D;padding:6px 12px;border-radius:999px;">¡Bajó!</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 28px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:800;">Órale ${escapeHtml(name)}, ¡ya bajó!</p>
            <p style="margin:0 0 18px;font-size:14px;color:#6B7280;line-height:1.5;">
              Estaba vigilando <strong style="color:#1A1A1A;">${escapeHtml(data.product)}</strong>
              (${escapeHtml(data.category)}) y llegó a tu precio objetivo.
            </p>
            <table role="presentation" width="100%" style="background:#F3F4F6;border-radius:16px;padding:16px;">
              <tr>
                <td style="padding:8px 12px;">
                  <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.04em;">Precio actual</div>
                  <div style="font-size:28px;font-weight:800;color:#16A34A;">${mxn(data.currentPrice)}</div>
                </td>
                <td style="padding:8px 12px;" align="right">
                  <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.04em;">Tu objetivo</div>
                  <div style="font-size:18px;font-weight:700;color:#1A1A1A;">${mxn(data.targetPrice)}</div>
                  ${savings > 0 ? `<div style="font-size:12px;font-weight:600;color:#16A34A;margin-top:4px;">Ahorraste ~${mxn(savings)}</div>` : ""}
                </td>
              </tr>
            </table>
            <p style="margin:22px 0 0;text-align:center;">
              <a href="${escapeAttr(data.alertUrl)}" style="display:inline-block;background:linear-gradient(180deg,#22C55E 0%,#16A34A 100%);color:#fff;font-weight:800;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:999px;">
                Ver mi alerta
              </a>
            </p>
            <p style="margin:20px 0 0;font-size:12px;color:#6B7280;text-align:center;line-height:1.45;">
              Solo te avisamos por email y push. <strong>Nunca por WhatsApp.</strong><br/>
              TeAviso · monitor de precios en México · no vendemos nada
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function priceHitEmailSubject(product: string): string {
  return `¡Bajó! ${product} — TeAviso`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
