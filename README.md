# eml-generator

A lightweight TypeScript/JavaScript library for generating EML (RFC 5322) email files. Works in both Node.js and browser environments.

## Features

- Generate RFC 5322 compliant EML files
- Support for plain text and HTML content
- File attachments with Base64 encoding
- Custom email headers
- Works in Node.js and browsers
- Full TypeScript support
- Zero dependencies
- Proper MIME handling

## Installation

```bash
npm install eml-generator
```

## Usage Modes

eml-generator offers three convenient ways to generate EML files:

1. [**Programmatic API**](#programmatic-api) - Use in Node.js or browser applications
2. [**Command Line Interface**](#cli-reference) - Generate EML files from the terminal → Jump to CLI docs
3. [**Web Interface** - Create emails using our online demo](https://fochlac.github.io/eml-generator/docs/index.html)

### 1. Programmatic API

#### Basic Example
```typescript
import { eml } from 'eml-generator';

const emailContent = eml({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Hello',
  text: 'This is a test email'
});

// In Node.js:
import { writeFileSync } from 'fs';
writeFileSync('email.eml', emailContent);

// In browser:
const blob = new Blob([emailContent], { type: 'message/rfc822' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'email.eml';
a.click();
```

For more advanced usage including attachments, HTML content, and custom headers, see the [API Reference](#api-reference) below.

### 2. Command Line Interface

Quickly generate EML files from your terminal:

```bash
# Basic usage
eml-generator -t "recipient@example.com" --text "Hello World" -o email.eml

# Multiple recipients and CC
eml-generator -t "one@ex.com,two@ex.com" -c "cc@ex.com" --text "Hello"

# Using HTML and text content from files
eml-generator -t "recipient@ex.com" --text-file message.txt --html-file message.html
```

For all available CLI options, see the [CLI Reference](#cli-reference) below.

## API Reference

### eml(options: EmlOptions): string

#### EmlOptions

```typescript
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

interface EmailAddress {
  name?: string;
  email?: string;
}

interface Attachment {
  filename?: string;
  name?: string;
  contentType?: string;
  inline?: boolean;
  cid?: string;
  data: string | Buffer;
}
```

## CLI Reference

The package includes a CLI tool for generating EML files directly from the command line:

```bash
# Basic usage
eml-generator -t "recipient@example.com" --text "Hello World" -o email.eml

# Multiple recipients and CC
eml-generator -t "one@ex.com,two@ex.com" -c "cc@ex.com" --text "Hello"

# Using HTML and text content from files
eml-generator -t "recipient@ex.com" --text-file message.txt --html-file message.html

# Adding attachments
eml-generator -t "recipient@ex.com" -a "document.pdf,image.jpg"

# Custom headers
eml-generator -t "recipient@ex.com" --text "Test" --header "X-Custom: Value"
```

### CLI Options

Required:
  - `-t, --to <emails>`      Recipient email(s), comma separated

Optional:
  - `-f, --from <email>`     Sender email
  - `-s, --subject <text>`   Email subject
  - `-c, --cc <emails>`      CC email(s), comma separated
  - `--text <content>`       Plain text content
  - `--html <content>`       HTML content
  - `--text-file <path>`     Plain text content from file
  - `--html-file <path>`     HTML content from file
  - `-a, --attach <files>`   File attachments, comma separated
  - `-o, --output <file>`    Output EML file (default: output.eml)
  - `--header <key:value>`   Custom header (can be used multiple times)
  - `-h, --help`            Show help message
  - `-v, --version`         Show version number

## Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/username/eml-generator.git
cd eml-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

4. Build the library:
```bash
npm run build
```

### Scripts

- `npm test` - Run the test suite
- `npm run build` - Build for production (outputs CJS and ESM)
- `npm run typecheck` - Run TypeScript type checking

### Local Development

To run the demo page locally:

1. Build the library: `npm run build`
2. Serve the docs directory (you can use any static file server)
3. Open `docs/index.html` in your browser

### Continuous Integration

The project uses GitHub Actions for automated testing and deployment:

- Tests run on Node.js 16.x, 18.x, and 20.x
- TypeScript type checking is performed
- Build verification ensures the library can be compiled
- GitHub Pages demo is automatically deployed on pushes to main

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.