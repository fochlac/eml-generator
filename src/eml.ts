/// <reference types="node" />

const EOL = "\r\n"; // Standard Email End-of-Line

// Declare global Buffer type for browser environments
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

type BufferLike = Buffer | Uint8Array;

/**
 * Interface for email address object
 */
interface EmailAddress {
  name?: string;
  email?: string;
}

/**
 * Interface for attachment object
 */
interface Attachment {
  filename?: string;
  name?: string;
  contentType?: string;
  inline?: boolean;
  cid?: string;
  data: string | BufferLike;
}

/**
 * Interface for the main EML generator options
 */
interface EmlOptions {
  headers?: Record<string, string | string[]>;
  subject?: string;
  from?: string | EmailAddress | EmailAddress[];
  to: string | EmailAddress | EmailAddress[];
  cc?: string | EmailAddress | EmailAddress[];
  text?: string;
  html?: string;
  attachments?: Attachment[];
}

/**
 * Generates a pseudo-random Version 4 UUID string.
 * Note: For cryptographically secure UUIDs, use crypto.randomUUID() if available.
 */
function guid(): string {
  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return template.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Extracts the boundary string from a Content-Type header.
 */
function getBoundary(contentType: string | undefined): string | undefined {
  if (typeof contentType !== "string") return undefined;
  const match = /boundary="?([^"]+)"?(\s*;[\s\S]*)?$/i.exec(contentType);
  return match ? match[1] : undefined;
}

/**
 * Formats a single email address object into RFC 5322 format.
 */
function formatSingleEmail(data: string|EmailAddress): string {
if (typeof data === "string") {
    return data.trim();
  }
  const { name, email } = data;
  let address = "";
  if (name) {
    address += `"${name.replace(/"/g, '\\"')}"`;
  }
  if (email) {
    address += `${address.length ? " " : ""}<${email}>`;
  }
  return address;
}

/**
 * Converts various email address formats into a single RFC 5322 compliant string.
 */
function toEmailAddress(
  data: string | EmailAddress | EmailAddress[] | undefined
): string {
  if (!data) {
    return "";
  }
  if (typeof data === "string") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(formatSingleEmail).join(", ");
  }
  if (typeof data === "object" && data !== null) {
    return formatSingleEmail(data);
  }
  return "";
}

/**
 * Wraps a string to a specified line length, adding EOL characters.
 * Required for Base64 encoded content in emails (RFC 2045 suggests 76 chars).
 */
function wrap(str: string, lineLength: number = 76): string {
  if (!str) return "";
  let result = "";
  for (let i = 0; i < str.length; i += lineLength) {
    result += str.substring(i, Math.min(i + lineLength, str.length));
    if (i + lineLength < str.length) {
      result += EOL;
    }
  }
  return result;
}

/**
 * Generates an EML file content string from structured data.
 */
export function eml(data: Partial<EmlOptions> & Pick<EmlOptions, 'to'> = { to: '' }): string {
  let emlContent = "";

  if (typeof data !== "object") {
    throw new Error("Argument 'data' expected to be an object!");
  }

  // Ensure headers object exists
  const headers: Record<string, string | string[]> = { ...(data.headers || {}) };

  // Map convenience properties to headers
  if (typeof data.subject === "string") {
    headers["Subject"] = data.subject;
  }
  if (data.from) {
    headers["From"] = toEmailAddress(data.from);
  }
  if (data.to) {
    headers["To"] = toEmailAddress(data.to);
  }
  if (data.cc) {
    headers["Cc"] = toEmailAddress(data.cc);
  }

  // Validate required 'To' header
  if (!headers["To"]) {
    console.log(data)
    throw new Error("Missing 'To' e-mail address!");
  }

  // Determine boundary for multipart messages
  let boundary = `----=${guid()}`;
  const contentTypeHeader = Object.keys(headers).find(
    (key) => key.toLowerCase() === "content-type"
  );

  if (!contentTypeHeader) {
    if (
      data.text ||
      data.html ||
      (data.attachments && data.attachments.length > 0)
    ) {
      headers["Content-Type"] = `multipart/mixed;${EOL} boundary="${boundary}"`;
    } else {
      headers["Content-Type"] = `multipart/mixed;${EOL} boundary="${boundary}"`;
    }
  } else {
    const existingBoundary = getBoundary(headers[contentTypeHeader] as string);
    if (existingBoundary) {
      boundary = existingBoundary;
    } else {
      headers[contentTypeHeader] += `;${EOL} boundary="${boundary}"`;
    }
  }

  // Add Message-ID header if not present
  if (!Object.keys(headers).find((key) => key.toLowerCase() === "message-id")) {
    headers["Message-ID"] = `<${guid()}@generated.local>`;
  }

  // Add MIME-Version header if not present
  if (
    !Object.keys(headers).find((key) => key.toLowerCase() === "mime-version")
  ) {
    headers["MIME-Version"] = "1.0";
  }

  // Build headers section
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null) {
      continue;
    }
    const headerValues = Array.isArray(value) ? value : [value];
    for (const val of headerValues) {
      const foldedValue = String(val).replace(/\r?\n/g, `${EOL} `);
      emlContent += `${key}: ${foldedValue}${EOL}`;
    }
  }

  emlContent += EOL;

  // Plain text content part
  if (data.text) {
    emlContent += `--${boundary}${EOL}`;
    emlContent += `Content-Type: text/plain; charset=utf-8${EOL}`;
    emlContent += `Content-Transfer-Encoding: quoted-printable${EOL}`;
    emlContent += EOL;
    emlContent += data.text
      .replace(/=/g, "=3D")
      .replace(
        /[\x80-\xFF]/g,
        (c) => `=${c.charCodeAt(0).toString(16).toUpperCase()}`
      );
    emlContent += EOL + EOL;
  }

  // HTML content part
  if (data.html) {
    emlContent += `--${boundary}${EOL}`;
    emlContent += `Content-Type: text/html; charset=utf-8${EOL}`;
    emlContent += `Content-Transfer-Encoding: quoted-printable${EOL}`;
    emlContent += EOL;
    emlContent += data.html
      .replace(/=/g, "=3D")
      .replace(
        /[\x80-\xFF]/g,
        (c) => `=${c.charCodeAt(0).toString(16).toUpperCase()}`
      );
    emlContent += EOL + EOL;
  }

  // Append attachments
  const attachments = data.attachments || [];
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    if (!attachment.data) continue;

    const filename =
      attachment.filename || attachment.name || `attachment_${i + 1}`;
    const contentType = attachment.contentType || "application/octet-stream";
    const disposition = attachment.inline ? "inline" : "attachment";
    const encoding = "base64";

    emlContent += `--${boundary}${EOL}`;
    emlContent += `Content-Type: ${contentType}${EOL}`;
    emlContent += `Content-Transfer-Encoding: ${encoding}${EOL}`;
    if (attachment.cid) {
      emlContent += `Content-ID: <${attachment.cid}>${EOL}`;
    }
    emlContent += `Content-Disposition: ${disposition}; filename="${filename}"${EOL}`;
    emlContent += EOL;

    let base64Content: string;
    if (typeof attachment.data === "string") {
      // Handle string data in a way that works in both Node.js and browser
      if (typeof Buffer !== 'undefined') {
        base64Content = Buffer.from(attachment.data, "utf8").toString("base64");
      } else {
        base64Content = btoa(attachment.data);
      }
    } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(attachment.data)) {
      base64Content = attachment.data.toString("base64");
    } else {
      console.warn(
        `Attachment ${i}: data is not a string or Buffer, skipping.`
      );
      continue;
    }

    emlContent += wrap(base64Content, 76);
    emlContent += EOL + EOL;
  }

  emlContent += `--${boundary}--${EOL}`;

  return emlContent;
}