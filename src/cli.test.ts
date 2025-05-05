import { spawnSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('CLI', () => {
  const cli = join(__dirname, '..', 'dist', 'cli.cjs');
  const testFile = 'test-output.eml';
  const textFile = 'test-content.txt';
  const htmlFile = 'test-content.html';

  beforeEach(() => {
    // Create test files
    writeFileSync(textFile, 'Test content');
    writeFileSync(htmlFile, '<h1>Test content</h1>');
  });

  afterEach(() => {
    // Cleanup test files
    [testFile, textFile, htmlFile].forEach(file => {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  const runCli = (args: string[]) => {
    if (!existsSync(cli)) {
      throw new Error(`CLI file not found at ${cli}`);
    }
    return spawnSync('node', [cli, ...args], {
      encoding: 'utf-8',
      env: { ...process.env, NODE_ENV: 'test' }
    });
  };

  it('should show help with -h flag', () => {
    const result = runCli(['-h']);
    expect(result.stdout).toContain('Usage: eml-generator');
    expect(result.status).toBe(0);
  });

  it('should show version with -v flag', () => {
    const result = runCli(['-v']);
    expect(result.stdout).toContain('eml-generator v');
    expect(result.status).toBe(0);
  });

  it('should require --to option', () => {
    const result = runCli(['--text', 'test']);
    expect(result.stderr).toContain('Required option --to is missing');
    expect(result.status).toBe(1);
  });

  it('should generate basic email with text content', () => {
    const result = runCli([
      '-t', 'test@example.com',
      '--text', 'Hello World',
      '-o', testFile
    ]);
    
    expect(result.status).toBe(0);
    expect(existsSync(testFile)).toBe(true);
  });

  it('should handle multiple recipients', () => {
    const result = runCli([
      '-t', 'one@example.com,two@example.com',
      '--text', 'Test',
      '-o', testFile
    ]);
    
    expect(result.status).toBe(0);
    expect(existsSync(testFile)).toBe(true);
  });

  it('should read content from files', () => {
    const result = runCli([
      '-t', 'test@example.com',
      '--text-file', textFile,
      '--html-file', htmlFile,
      '-o', testFile
    ]);

    expect(result.status).toBe(0);
    expect(existsSync(testFile)).toBe(true);
  });

  it('should handle custom headers', () => {
    const result = runCli([
      '-t', 'test@example.com',
      '--text', 'Test',
      '--header', 'X-Custom: Value',
      '-o', testFile
    ]);
    
    expect(result.status).toBe(0);
    expect(existsSync(testFile)).toBe(true);
  });

  it('should fail on invalid header format', () => {
    const result = runCli([
      '-t', 'test@example.com',
      '--text', 'Test',
      '--header', 'Invalid-Header',
      '-o', testFile
    ]);
    
    expect(result.stderr).toContain('Invalid header format');
    expect(result.status).toBe(1);
  });
});