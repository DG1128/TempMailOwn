// Smart OTP, Verification Code & Confirmation Link Extractor

/**
 * Parses email subject, snippet/intro, and content to detect OTP codes
 * and verification action links.
 */
export function extractVerificationInfo(message) {
  if (!message) return null;

  const subject = message.subject || '';
  const intro = message.intro || '';
  const text = message.text || '';
  const html = message.html || '';

  const fullSearchText = `${subject}\n${intro}\n${text}`;

  // Patterns for Verification Codes / OTP (4 to 8 digits)
  // e.g. "code is 123456", "OTP: 948201", "verification code: 4920", "[849201]"
  const otpPatterns = [
    /(?:verification|security|confirmation|validation|login|authorization|passcode|one-time|otp|code)[\s\w:]*?([0-9]{4,8})\b/i,
    /\b([0-9]{3,4}[-\s][0-9]{3,4})\b/,
    /\b(?:is|:)\s*([0-9]{4,8})\b/i,
    /code\s+([0-9]{4,8})\b/i,
    /\b([0-9]{6})\b/, // Standalone 6-digit number
    /\b([0-9]{4})\b/, // Standalone 4-digit number if in short subject
  ];

  let detectedCode = null;

  for (const pattern of otpPatterns) {
    const match = fullSearchText.match(pattern);
    if (match && match[1]) {
      const clean = match[1].replace(/[-\s]/g, '');
      // Avoid false positive years like 2024, 2025, 2026 if no code keywords
      if (clean.length === 4 && (clean.startsWith('19') || clean.startsWith('20'))) {
        if (!/code|pin|otp|verify|passcode/i.test(fullSearchText)) {
          continue;
        }
      }
      detectedCode = clean;
      break;
    }
  }

  // Extract Primary Action Link (e.g. "Confirm Email", "Verify Account", "Activate Account")
  let confirmationLink = null;
  if (html) {
    // Look for <a> tags containing verification words
    const linkRegex = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const url = linkMatch[1];
      const anchorText = linkMatch[2].replace(/<[^>]+>/g, '').trim();
      if (/verify|confirm|activate|validate|get started|click here to verify/i.test(anchorText) ||
          /verify|confirm|activate|token|auth/i.test(url)) {
        confirmationLink = {
          url: url,
          label: anchorText || 'Verify Email Address',
        };
        break;
      }
    }
  }

  if (detectedCode || confirmationLink) {
    return {
      code: detectedCode,
      confirmationLink: confirmationLink,
      isVerified: true,
    };
  }

  return null;
}
