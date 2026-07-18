import nodemailer from 'nodemailer'

const BRAND = {
  headerBg: '#1A1A1A',
  headerText: '#FFD23F',
  bodyBg: '#F5F0E8',
  accentBg: '#6BCB77',
  accentText: '#1A1A1A',
  font: "'DM Sans', Arial, sans-serif",
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
}

function emailWrapper(bodyHtml) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bodyBg};font-family:${BRAND.font};">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border-radius:20px;overflow:hidden;border:1px solid rgba(13,59,46,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND.headerBg};padding:28px 32px;text-align:center;">
            <span style="font-family:Georgia,serif;font-style:italic;font-weight:800;font-size:28px;color:${BRAND.headerText};letter-spacing:-0.5px;">pronto</span>
            <span style="display:inline-block;width:7px;height:7px;background:#FF6B9D;border-radius:50%;margin-left:2px;vertical-align:super;"></span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:white;padding:32px;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:${BRAND.headerBg};padding:20px 32px;text-align:center;">
            <p style="margin:0;font-family:${BRAND.font};font-size:12px;color:rgba(168,230,207,0.6);">
              © 2026 Más pronto · Made with ❤️ in Australia
            </p>
            <p style="margin:6px 0 0;font-family:${BRAND.font};font-size:11px;color:rgba(168,230,207,0.4);">
              ¿Necesitas ayuda? <a href="mailto:hola@maspronto.com" style="color:#A8E6CF;">hola@maspronto.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendDigitalDownloadEmail({ to, name, downloadUrl }) {
  const transport = createTransport()
  const body = `
    <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:800;color:#1A1A1A;font-size:26px;margin:0 0 8px;">¡Tu Pronto Path está listo! 🗺️</h1>
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Hola ${name},</p>
    <p style="color:rgba(13,59,46,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Tu mapa personalizado está listo para descargar e imprimir en casa. Haz clic abajo para descargarlo.</p>

    <div style="text-align:center;margin:0 0 28px;">
      <a href="${downloadUrl}" style="display:inline-block;background:#F5FF6E;color:#1A1A1A;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:16px;padding:16px 36px;border-radius:40px;text-decoration:none;">
        📥 Descargar mi mapa
      </a>
    </div>

    <div style="background:#A8E6CF;border-radius:12px;padding:16px 20px;">
      <p style="margin:0;color:#1A1A1A;font-size:13px;line-height:1.5;">
        💡 <strong>Consejo:</strong> Imprime en tamaño A3 para mejor experiencia, o A4 si tu impresora no admite A3.
      </p>
    </div>`

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '¡Tu Pronto está listo! 🗺️',
    html: emailWrapper(body),
  })
}

export async function sendDigitalDownloadEmailEn({ to, name, downloadUrl }) {
  const transport = createTransport()
  const body = `
    <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:800;color:#1A1A1A;font-size:26px;margin:0 0 8px;">Your Pronto Path is ready! 🗺️</h1>
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Hi ${name},</p>
    <p style="color:rgba(13,59,46,0.7);font-size:15px;line-height:1.6;margin:0 0 28px;">Your personalised map is ready to download and print. Click below to get started.</p>

    <div style="text-align:center;margin:0 0 28px;">
      <a href="${downloadUrl}" style="display:inline-block;background:#F5FF6E;color:#1A1A1A;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:16px;padding:16px 36px;border-radius:40px;text-decoration:none;">
        📥 Download my map
      </a>
    </div>

    <div style="background:#A8E6CF;border-radius:12px;padding:16px 20px;">
      <p style="margin:0;color:#1A1A1A;font-size:13px;line-height:1.5;">
        💡 <strong>Tip:</strong> Print at A3 for the best experience, or A4 if your printer doesn't support A3.
      </p>
    </div>`

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Your Pronto is ready! 🗺️',
    html: emailWrapper(body),
  })
}

export async function sendPhysicalOrderEmail({ to, name, orderId, estimatedDays = '2-4', locale = 'es' }) {
  const transport = createTransport()
  const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/orders/${orderId}`
  const isEn = locale === 'en'

  const body = isEn ? `
    <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:800;color:#1A1A1A;font-size:26px;margin:0 0 8px;">Order confirmed! 🎉</h1>
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Hi ${name},</p>
    <p style="color:rgba(13,59,46,0.7);font-size:15px;line-height:1.6;margin:0 0 20px;">Your Pronto Kit has been sent to print and will arrive in <strong>${estimatedDays} business days</strong>.</p>

    <div style="background:#F7FAF5;border-radius:12px;padding:18px 20px;margin:0 0 24px;">
      <p style="margin:0;color:#1A1A1A;font-size:14px;"><strong>Order #${orderId.slice(0,8).toUpperCase()}</strong></p>
      <p style="margin:6px 0 0;color:rgba(13,59,46,0.6);font-size:13px;">Pronto Path — Large Poster + Pronto Sticker Sheet + PDF Digital</p>
    </div>

    <div style="text-align:center;margin:0 0 24px;">
      <a href="${trackingUrl}" style="display:inline-block;background:#1A1A1A;color:#F5FF6E;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:15px;padding:14px 32px;border-radius:40px;text-decoration:none;">
        📦 Track my order
      </a>
    </div>` : `
    <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:800;color:#1A1A1A;font-size:26px;margin:0 0 8px;">¡Pedido confirmado! 🎉</h1>
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Hola ${name},</p>
    <p style="color:rgba(13,59,46,0.7);font-size:15px;line-height:1.6;margin:0 0 20px;">Tu Kit Pronto Path ha sido enviado a imprimir y llegará en <strong>${estimatedDays} días hábiles</strong>.</p>

    <div style="background:#F7FAF5;border-radius:12px;padding:18px 20px;margin:0 0 24px;">
      <p style="margin:0;color:#1A1A1A;font-size:14px;"><strong>Pedido #${orderId.slice(0,8).toUpperCase()}</strong></p>
      <p style="margin:6px 0 0;color:rgba(13,59,46,0.6);font-size:13px;">Pronto Path — Gran Póster + Hoja de Calcomanías + PDF Digital</p>
    </div>

    <div style="text-align:center;margin:0 0 24px;">
      <a href="${trackingUrl}" style="display:inline-block;background:#1A1A1A;color:#F5FF6E;font-family:'DM Sans',Arial,sans-serif;font-weight:700;font-size:15px;padding:14px 32px;border-radius:40px;text-decoration:none;">
        📦 Ver estado de mi pedido
      </a>
    </div>`

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: isEn ? 'Your Pronto is ready! 🗺️' : '¡Tu Pronto está listo! 🗺️',
    html: emailWrapper(body),
  })
}

export async function notifyOwnerStickerFulfillment({ orderId, stripeSessionId, customer, address, config }) {
  const transport = createTransport()
  const theme     = config.theme     || 'sin tema'
  const character = config.character || '—'
  const title     = config.title     || '—'
  const subtitle  = config.subtitle  || '—'

  const body = `
    <h2 style="font-family:Georgia,serif;font-size:20px;color:#1A1A1A;margin:0 0 16px;">
      🇦🇺 Nuevo pedido AU — fulfillment manual
    </h2>

    <table style="width:100%;border-collapse:collapse;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#1A1A1A;">
      <tr><td style="padding:6px 0;color:#666;width:140px;">Pedido interno</td><td><strong>${orderId}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#666;">Stripe session</td><td>${stripeSessionId}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e0dbd4;margin:20px 0;" />

    <h3 style="font-family:Georgia,serif;font-size:16px;color:#1A1A1A;margin:0 0 10px;">Detalle del sticker</h3>
    <table style="width:100%;border-collapse:collapse;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#1A1A1A;">
      <tr><td style="padding:6px 0;color:#666;width:140px;">Tema</td><td><strong>${theme}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#666;">Personaje</td><td>${character}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Título</td><td>${title}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Subtítulo</td><td>${subtitle}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e0dbd4;margin:20px 0;" />

    <h3 style="font-family:Georgia,serif;font-size:16px;color:#1A1A1A;margin:0 0 10px;">Cliente</h3>
    <table style="width:100%;border-collapse:collapse;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#1A1A1A;">
      <tr><td style="padding:6px 0;color:#666;width:140px;">Nombre</td><td>${customer.name}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Email</td><td><a href="mailto:${customer.email}" style="color:#1A1A1A;">${customer.email}</a></td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e0dbd4;margin:20px 0;" />

    <h3 style="font-family:Georgia,serif;font-size:16px;color:#1A1A1A;margin:0 0 10px;">Dirección de envío</h3>
    <p style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#1A1A1A;margin:0;line-height:1.8;">
      ${address.line1}<br />
      ${address.line2 ? address.line2 + '<br />' : ''}
      ${address.suburb}, ${address.state} ${address.postcode}<br />
      <strong>Australia</strong>
    </p>

    <div style="background:#F5FF6E;border-radius:10px;padding:14px 18px;margin-top:24px;">
      <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#1A1A1A;font-weight:700;">
        Acción requerida: imprimir y enviar manualmente el sticker sheet + poster a esta dirección.
      </p>
    </div>`

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: 'hola@maspronto.com',
    subject: `🇦🇺 Pedido AU — fulfillment manual: ${theme} (#${orderId.slice(0, 8).toUpperCase()})`,
    html: emailWrapper(body),
  })
}

export async function sendTrackingUpdateEmail({ to, name, orderId, trackingNumber, carrier, locale = 'es' }) {
  const transport = createTransport()
  const isEn = locale === 'en'

  const body = isEn ? `
    <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:800;color:#1A1A1A;font-size:26px;margin:0 0 8px;">Your order is on its way! 🚚</h1>
    <p style="color:rgba(13,59,46,0.7);font-size:15px;margin:0 0 20px;">Hi ${name}, your Pronto Kit has been dispatched.</p>
    <div style="background:#A8E6CF;border-radius:12px;padding:18px 20px;">
      <p style="margin:0;color:#1A1A1A;font-size:14px;"><strong>Carrier:</strong> ${carrier}</p>
      <p style="margin:6px 0 0;color:#1A1A1A;font-size:14px;"><strong>Tracking:</strong> ${trackingNumber}</p>
    </div>` : `
    <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:800;color:#1A1A1A;font-size:26px;margin:0 0 8px;">¡Tu pedido está en camino! 🚚</h1>
    <p style="color:rgba(13,59,46,0.7);font-size:15px;margin:0 0 20px;">Hola ${name}, tu Kit Pronto fue despachado.</p>
    <div style="background:#A8E6CF;border-radius:12px;padding:18px 20px;">
      <p style="margin:0;color:#1A1A1A;font-size:14px;"><strong>Transportista:</strong> ${carrier}</p>
      <p style="margin:6px 0 0;color:#1A1A1A;font-size:14px;"><strong>Seguimiento:</strong> ${trackingNumber}</p>
    </div>`

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: isEn ? '🚚 Your Pronto Kit is on its way!' : '🚚 ¡Tu Kit Pronto está en camino!',
    html: emailWrapper(body),
  })
}
