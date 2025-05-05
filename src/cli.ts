#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { eml } from './eml';

interface CliOptions {
  to: string[];
  from?: string;
  subject?: string;
  cc?: string[];
  text?: string;
  html?: string;
  textFile?: string;
  htmlFile?: string;
  attach?: string[];
  output?: string;
  headers?: Record<string, string>;
}

function showHelp(): void {
  console.log(`
eml-generator - Generate EML (email) files from command line

Usage: eml-generator [options]

Required:
  -t, --to <emails>      Recipient email(s), comma separated

Options:
  -f, --from <email>     Sender email
  -s, --subject <text>   Email subject
  -c, --cc <emails>      CC email(s), comma separated
  --text <content>       Plain text content
  --html <content>       HTML content
  --text-file <path>    Plain text content from file
  --html-file <path>    HTML content from file
  -a, --attach <files>   File attachments, comma separated
  -o, --output <file>    Output EML file (default: output.eml)
  --header <key:value>   Custom header (can be used multiple times)
  -h, --help            Show this help message
  -v, --version         Show version number

Examples:
  eml-generator -t "recipient@example.com" --text "Hello World" -o email.eml
  eml-generator -t "one@ex.com,two@ex.com" -f "me@ex.com" -s "Test" --text-file content.txt
  `);
}

function showVersion(): void {
  console.log('eml-generator v1.0.0');
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { to: [] };
  
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
      
      case '-v':
      case '--version':
        showVersion();
        process.exit(0);
        break;

      case '-t':
      case '--to':
        if (!nextArg) throw new Error('Missing value for --to');
        options.to = nextArg.split(',').map(email => email.trim());
        i++;
        break;

      case '-f':
      case '--from':
        if (!nextArg) throw new Error('Missing value for --from');
        options.from = nextArg;
        i++;
        break;

      case '-s':
      case '--subject':
        if (!nextArg) throw new Error('Missing value for --subject');
        options.subject = nextArg;
        i++;
        break;

      case '-c':
      case '--cc':
        if (!nextArg) throw new Error('Missing value for --cc');
        options.cc = nextArg.split(',').map(email => email.trim());
        i++;
        break;

      case '--text':
        if (!nextArg) throw new Error('Missing value for --text');
        options.text = nextArg;
        i++;
        break;

      case '--html':
        if (!nextArg) throw new Error('Missing value for --html');
        options.html = nextArg;
        i++;
        break;

      case '--text-file':
        if (!nextArg) throw new Error('Missing value for --text-file');
        options.textFile = nextArg;
        i++;
        break;

      case '--html-file':
        if (!nextArg) throw new Error('Missing value for --html-file');
        options.htmlFile = nextArg;
        i++;
        break;

      case '-a':
      case '--attach':
        if (!nextArg) throw new Error('Missing value for --attach');
        options.attach = nextArg.split(',').map(file => file.trim());
        i++;
        break;

      case '-o':
      case '--output':
        if (!nextArg) throw new Error('Missing value for --output');
        options.output = nextArg;
        i++;
        break;

      case '--header':
        if (!nextArg) throw new Error('Missing value for --header');
        const [key, ...valueParts] = nextArg.split(':');
        if (!key || !valueParts.length) {
          throw new Error(`Invalid header format: ${nextArg}`);
        }
        options.headers = options.headers || {};
        options.headers[key.trim()] = valueParts.join(':').trim();
        i++;
        break;

      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!options.to.length) {
    throw new Error('Required option --to is missing');
  }

  return options;
}

try {
  const options = parseArgs(process.argv);
  const emailData: any = {
    to: options.to,
    headers: options.headers || {}
  };

  if (options.from) emailData.from = options.from;
  if (options.subject) emailData.subject = options.subject;
  if (options.cc) emailData.cc = options.cc;

  // Handle text content
  if (options.text) {
    emailData.text = options.text;
  } else if (options.textFile) {
    emailData.text = readFileSync(options.textFile, 'utf-8');
  }

  // Handle HTML content
  if (options.html) {
    emailData.html = options.html;
  } else if (options.htmlFile) {
    emailData.html = readFileSync(options.htmlFile, 'utf-8');
  }

  // Handle attachments
  if (options.attach) {
    emailData.attachments = options.attach.map(file => ({
      filename: file,
      data: readFileSync(file)
    }));
  }

  const emlContent = eml(emailData);
  const outputFile = options.output || 'output.eml';
  writeFileSync(outputFile, emlContent);
  console.log(`EML file generated: ${outputFile}`);
} catch (error) {
  console.error('Error:', (error as Error).message);
  process.exit(1);
}