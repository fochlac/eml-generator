import { eml } from './eml';

describe('eml generator', () => {
  it('should generate basic email with text content', () => {
    const emlContent = eml({
      to: 'recipient@example.com',
      from: 'sender@example.com',
      subject: 'Test email',
      text: 'Hello world'
    });

    expect(emlContent).toContain('To: recipient@example.com');
    expect(emlContent).toContain('From: sender@example.com');
    expect(emlContent).toContain('Subject: Test email');
    expect(emlContent).toContain('Content-Type: text/plain');
    expect(emlContent).toContain('Hello world');
  });

  it('should handle email address objects', () => {
    const emlContent = eml({
      to: { name: 'John Doe', email: 'john@example.com' },
      from: { name: 'Jane Smith', email: 'jane@example.com' },
      subject: 'Test email'
    });

    expect(emlContent).toContain('To: "John Doe" <john@example.com>');
    expect(emlContent).toContain('From: "Jane Smith" <jane@example.com>');
  });

  it('should handle HTML content', () => {
    const emlContent = eml({
      to: 'recipient@example.com',
      subject: 'HTML Test',
      html: '<h1>Hello</h1><p>World</p>'
    });

    expect(emlContent).toContain('Content-Type: text/html');
    expect(emlContent).toContain('<h1>Hello</h1><p>World</p>');
  });

  it('should handle attachments', () => {
    const attachment = {
      filename: 'test.txt',
      contentType: 'text/plain',
      data: 'Hello World'
    };

    const emlContent = eml({
      to: 'recipient@example.com',
      subject: 'Attachment Test',
      attachments: [attachment]
    });

    expect(emlContent).toContain('Content-Type: text/plain');
    expect(emlContent).toContain('Content-Disposition: attachment; filename="test.txt"');
    expect(emlContent).toContain('Content-Transfer-Encoding: base64');
  });

  it('should handle custom headers', () => {
    const emlContent = eml({
      to: 'recipient@example.com',
      headers: {
        'X-Custom-Header': 'custom value',
        'Reply-To': 'reply@example.com'
      }
    });

    expect(emlContent).toContain('X-Custom-Header: custom value');
    expect(emlContent).toContain('Reply-To: reply@example.com');
  });
});