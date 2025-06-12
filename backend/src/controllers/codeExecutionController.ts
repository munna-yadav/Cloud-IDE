import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CodeExecutionRequest extends Request {
  body: {
    code: string;
    language?: string;
    input?: string;
  };
}

interface CodeExecutionResponse {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

export const executeCode = async (req: CodeExecutionRequest, res: Response<CodeExecutionResponse>) => {
  try {
    const { code, language = 'javascript', input = '' } = req.body;
    
    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'No code provided'
      });
    }

    // Create temp file with unique name and appropriate extension
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    let tempFileName: string;
    let tempFilePath: string;
    let dockerCmd: string;
    
    if (language === 'java') {
      // Extract class name from code or use default
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classNameMatch ? classNameMatch[1] : 'Main';
      tempFileName = `${className}.java`;
      tempFilePath = path.join('/tmp', `${timestamp}_${randomId}_${tempFileName}`);
      
      // Write Java code to temp file
      await fs.writeFile(tempFilePath, code, 'utf8');
      
      // Create input file if input is provided
      let inputFilePath = '';
      if (input.trim()) {
        inputFilePath = path.join('/tmp', `${timestamp}_${randomId}_input.txt`);
        await fs.writeFile(inputFilePath, input, 'utf8');
      }
      
      // Docker command for Java compilation and execution with input support
      const baseCmd = [
        'docker run --rm',
        '--memory=256m',
        '--cpus=0.5',
        '--network=none',
        '--read-only',
        '--tmpfs /tmp:rw,exec,size=20m',
        `--volume ${tempFilePath}:/app/${tempFileName}:ro`,
      ];
      
      if (inputFilePath) {
        baseCmd.push(`--volume ${inputFilePath}:/app/input.txt:ro`);
      }
      
      baseCmd.push(
        '--user nobody',
        '--cap-drop=ALL',
        'openjdk:11-jdk-slim',
        'timeout 15s sh -c'
      );
      
      const execCommand = inputFilePath 
        ? `"javac /app/${tempFileName} -d /tmp && java -cp /tmp ${className} < /app/input.txt"`
        : `"javac /app/${tempFileName} -d /tmp && java -cp /tmp ${className}"`;
      
      baseCmd.push(execCommand);
      dockerCmd = baseCmd.join(' ');
      
    } else {
      // JavaScript execution (existing logic)
      tempFileName = `code_${timestamp}_${randomId}.js`;
      tempFilePath = path.join('/tmp', tempFileName);
      
      // Write code to temp file
      await fs.writeFile(tempFilePath, code, 'utf8');
      
      // Docker command with security restrictions
      dockerCmd = [
        'docker run --rm',
        '--memory=128m',
        '--cpus=0.5',
        '--network=none',
        '--read-only',
        '--tmpfs /tmp:rw,noexec,nosuid,size=10m',
        `--volume ${tempFilePath}:/app/code.js:ro`,
        '--user nobody',
        '--cap-drop=ALL',
        'node:18-alpine',
        'timeout 10s node /app/code.js'
      ].join(' ');
    }
    
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(dockerCmd);
      const executionTime = Date.now() - startTime;
      
      // Clean up temp files
      await fs.unlink(tempFilePath).catch(() => {}); // Ignore cleanup errors
      if (language === 'java' && input.trim()) {
        const inputFilePath = path.join('/tmp', `${timestamp}_${randomId}_input.txt`);
        await fs.unlink(inputFilePath).catch(() => {});
      }
      
      res.json({
        success: true,
        output: stdout || '',
        error: stderr || undefined,
        executionTime
      });
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      // Clean up temp files
      await fs.unlink(tempFilePath).catch(() => {});
      if (language === 'java' && input.trim()) {
        const inputFilePath = path.join('/tmp', `${timestamp}_${randomId}_input.txt`);
        await fs.unlink(inputFilePath).catch(() => {});
      }
      
      // Handle different types of errors
      let errorMessage = 'Execution failed';
      if (error.code === 124) {
        errorMessage = `Code execution timed out (${language === 'java' ? '15s' : '10s'} limit)`;
      } else if (error.stderr) {
        errorMessage = error.stderr;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.json({
        success: false,
        output: error.stdout || '',
        error: errorMessage,
        executionTime
      });
    }
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 