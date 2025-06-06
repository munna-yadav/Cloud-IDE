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
    const { code, language = 'javascript' } = req.body;
    
    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'No code provided'
      });
    }

    // Create temp file with unique name
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const tempFileName = `code_${timestamp}_${randomId}.js`;
    const tempFilePath = path.join('/tmp', tempFileName);
    
    // Write code to temp file
    await fs.writeFile(tempFilePath, code, 'utf8');
    
    const startTime = Date.now();
    
    // Docker command with security restrictions
    const dockerCmd = [
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

    try {
      const { stdout, stderr } = await execAsync(dockerCmd);
      const executionTime = Date.now() - startTime;
      
      // Clean up temp file
      await fs.unlink(tempFilePath).catch(() => {}); // Ignore cleanup errors
      
      res.json({
        success: true,
        output: stdout || '',
        error: stderr || null,
        executionTime
      });
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      // Clean up temp file
      await fs.unlink(tempFilePath).catch(() => {});
      
      // Handle different types of errors
      let errorMessage = 'Execution failed';
      if (error.code === 124) {
        errorMessage = 'Code execution timed out (10s limit)';
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