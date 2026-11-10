type ComposeFields = {
  to: string;
  subject?: string;
  body?: string;
};

/** Gmail compose URL with the recipient/subject/body prefilled. */
export function gmailComposeUrl({ to, subject, body }: ComposeFields): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to });
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Opens Gmail's composer in a compact pop-out window (like Gmail's own
 * "pop-out" compose) instead of a full browser tab. Gmail has no URL that
 * opens the in-inbox compose box with prefilled fields, so a small window is
 * the closest equivalent. Falls back to a normal tab if popups are blocked.
 */
export function openGmailCompose(fields: ComposeFields) {
  const url = gmailComposeUrl(fields);
  const width = 720;
  const height = 760;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));

  const popup = window.open(
    url,
    "gmail-compose",
    `popup=yes,width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
  );
  if (!popup) window.open(url, "_blank", "noopener,noreferrer");
}
