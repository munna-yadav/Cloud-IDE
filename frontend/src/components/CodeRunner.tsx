import { useState } from 'react';
import { Play, Square, Terminal, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { codeExecution } from '../lib/api';
import { cn } from '../lib/utils';

interface CodeRunnerProps {
  code: string;
  language?: string;
  className?: string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
}

export function CodeRunner({ code, language = 'javascript', className }: CodeRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isOutputVisible, setIsOutputVisible] = useState(false);

  const handleRun = async () => {
    if (!code.trim()) {
      setResult({
        success: false,
        output: '',
        error: 'No code to execute'
      });
      setIsOutputVisible(true);
      return;
    }

    setIsRunning(true);
    setIsOutputVisible(true);
    setResult(null);

    try {
      const response = await codeExecution.execute({ code, language });
      setResult(response.data);
    } catch (error: any) {
      setResult({
        success: false,
        output: '',
        error: error.response?.data?.error || 'Failed to execute code'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    // TODO: Implement stop functionality if needed
    setIsRunning(false);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Run Button */}
      <div className="flex items-center gap-2 p-3 border-b border-[#30363d] bg-[#1c2128]">
        <Button
          onClick={handleRun}
          disabled={isRunning}
          size="sm"
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Code
            </>
          )}
        </Button>
        
        {isRunning && (
          <Button
            onClick={handleStop}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        )}

        <Button
          onClick={() => setIsOutputVisible(!isOutputVisible)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 ml-auto"
        >
          <Terminal className="w-4 h-4" />
          {isOutputVisible ? 'Hide Output' : 'Show Output'}
        </Button>
      </div>

      {/* Output Panel */}
      {isOutputVisible && (
        <div className="flex-1 bg-[#0d1117] border-t border-[#30363d] min-h-[200px] max-h-[400px] overflow-hidden flex flex-col">
          {/* Output Header */}
          <div className="flex items-center gap-2 p-2 border-b border-[#30363d] bg-[#161b22]">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Output</span>
            
            {result && (
              <div className="flex items-center gap-2 ml-auto">
                {result.success ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Success</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Error</span>
                  </div>
                )}
                
                {result.executionTime && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{result.executionTime}ms</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isRunning ? (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-400"></div>
                <span className="text-sm">Executing code...</span>
              </div>
            ) : result ? (
              <div className="space-y-3">
                {/* Standard Output */}
                {result.output && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">STDOUT:</div>
                    <pre className="text-sm text-green-300 bg-[#0d1117] p-2 rounded border border-[#30363d] whitespace-pre-wrap font-mono">
                      {result.output}
                    </pre>
                  </div>
                )}

                {/* Error Output */}
                {result.error && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">STDERR:</div>
                    <pre className="text-sm text-red-300 bg-[#0d1117] p-2 rounded border border-red-500/30 whitespace-pre-wrap font-mono">
                      {result.error}
                    </pre>
                  </div>
                )}

                {/* Empty output */}
                {!result.output && !result.error && (
                  <div className="text-sm text-gray-500 italic">
                    No output
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Click "Run Code" to execute the current file
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 