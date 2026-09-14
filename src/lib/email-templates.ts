// Branded HTML email templates. Inline styles only, no external CSS/JS/
// animation — Gmail, Outlook and most clients strip <style> blocks and
// @keyframes, so a vibrant static design (matching the portal's violet/
// indigo/teal palette) is what actually renders reliably everywhere.

const COLORS = {
  primary: "#5B3FD6",
  indigo: "#3F2BA8",
  teal: "#1AB6B8",
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#667085",
  border: "#E7E8F0",
  violetSoft: "#EFEAFC",
  tealSoft: "#E3F7F7",
  amberSoft: "#FEF3E2",
  amberText: "#92400E",
};

function wrapper(opts: { preheader: string; eyebrow: string; heading: string; bodyHtml: string }): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <span style="display:none;font-size:1px;color:${COLORS.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="border-radius:20px 20px 0 0;background:linear-gradient(135deg,${COLORS.indigo},${COLORS.primary} 55%,${COLORS.teal});padding:28px 32px;text-align:center;">
              <div style="display:inline-block;width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.18);line-height:40px;font-size:20px;margin-bottom:10px;">💊</div>
              <div style="font-size:22px;font-weight:800;letter-spacing:0.5px;color:#ffffff;">PHAMORA</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.85);margin-top:2px;">Digital Validation Study</div>
            </td>
          </tr>
          <tr>
            <td style="background:${COLORS.card};padding:36px 32px;border-left:1px solid ${COLORS.border};border-right:1px solid ${COLORS.border};">
              <div style="display:inline-block;background:${COLORS.violetSoft};color:${COLORS.indigo};font-size:11px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;padding:5px 12px;border-radius:999px;margin-bottom:16px;">${opts.eyebrow}</div>
              <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:${COLORS.text};font-weight:800;">${opts.heading}</h1>
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:${COLORS.card};border-radius:0 0 20px 20px;border-left:1px solid ${COLORS.border};border-right:1px solid ${COLORS.border};border-bottom:1px solid ${COLORS.border};padding:20px 32px 28px;text-align:center;">
              <div style="font-size:11px;color:${COLORS.muted};">PHAMORA Validation Study · Confidential research communication</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:999px;background:linear-gradient(135deg,${COLORS.primary},${COLORS.teal});">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:${COLORS.muted};">${text}</p>`;
}

function calloutBox(bg: string, textColor: string, html: string): string {
  return `<div style="background:${bg};border-radius:14px;padding:16px 18px;margin:0 0 20px;font-size:13px;line-height:1.6;color:${textColor};">${html}</div>`;
}

export function expertInviteEmailHtml(link: string): string {
  const body = `
    ${paragraph("You are invited to join the expert panel validating the content of PHAMORA, an offline pharmacology learning app for undergraduate health-professions students (MBBS, BDS, Pharmacy/Pharm.D, and Nursing), as part of a formal Content Validity Index (CVI) study.")}
    ${paragraph("Your task is to rate a set of lessons, MCQs and monographs (~10–30 minutes) for relevance to the undergraduate pharmacology curriculum. No installation or account is needed — everything happens through your personal review link below.")}
    ${button(link, "Start My Review →")}
    ${calloutBox(COLORS.tealSoft, "#0E6B6C", `<strong>This link is unique to you</strong> — please don't share it. If the button doesn't work, copy this URL:<br><span style="word-break:break-all;color:${COLORS.indigo};">${link}</span>`)}
    ${paragraph("Thank you for contributing your expertise to this study.")}
    ${paragraph(`<strong style="color:${COLORS.text};">Dr. G. Hari Prakash</strong><br>Principal Investigator, PHAMORA Validation Study`)}
  `;
  return wrapper({
    preheader: "You're invited to the PHAMORA expert content validation panel",
    eyebrow: "Expert Panel Invitation",
    heading: "Your expertise is requested",
    bodyHtml: body,
  });
}

export function studentWelcomeEmailHtml(input: {
  participantCode: string;
  ethicsRef: string | null;
  dashboardUrl: string;
}): string {
  const ethicsLine = input.ethicsRef
    ? `Ethics approval has been obtained from the Institutional Ethics Committee (reference: <strong>${input.ethicsRef}</strong>).`
    : `Ethics approval has been obtained from the Institutional Ethics Committee.`;

  const body = `
    ${paragraph("Thank you for agreeing to take part. Your participation is voluntary, ungraded, and identified only by an anonymous participant code — never your name.")}
    ${calloutBox(COLORS.violetSoft, COLORS.indigo, `<strong>About the study:</strong> This study evaluates the usability, educational effectiveness and content validity of PHAMORA, an offline pharmacology learning app, for undergraduate health-professions students. It involves a short baseline profile, a pre-test, a defined period of free app use, then a post-test with a few brief questionnaires.`)}
    ${calloutBox(COLORS.amberSoft, COLORS.amberText, ethicsLine)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${COLORS.tealSoft};border-radius:14px;margin:0 0 20px;">
      <tr>
        <td style="padding:16px 18px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:#0E6B6C;margin-bottom:4px;">Your Participant ID</div>
          <div style="font-size:18px;font-weight:800;color:${COLORS.text};font-family:monospace;">${input.participantCode}</div>
          <div style="font-size:12px;color:#0E6B6C;margin-top:4px;">Keep this for your own reference</div>
        </td>
      </tr>
    </table>
    ${button(input.dashboardUrl, "Continue My Journey →")}
    ${paragraph("If you have any questions, you're welcome to reply to this email.")}
    ${paragraph(`<strong style="color:${COLORS.text};">Dr. G. Hari Prakash</strong><br>Principal Investigator, PHAMORA Validation Study`)}
  `;
  return wrapper({
    preheader: `Welcome! Your participant ID is ${input.participantCode}`,
    eyebrow: "Welcome",
    heading: "Welcome to the PHAMORA Validation Study",
    bodyHtml: body,
  });
}
