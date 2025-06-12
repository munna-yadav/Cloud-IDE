import { useState } from 'react';
import { Play, Square, Terminal, AlertCircle, CheckCircle, Clock, Keyboard } from 'lucide-react';
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
  const [input, setInput] = useState('');
  const [showInputPanel, setShowInputPanel] = useState(false);

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
      const response = await codeExecution.execute({ 
        code, 
        language, 
        input: input.trim() || undefined 
      });
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
      {/* Run Button and Input Panel Toggle */}
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

        {/* Input Panel Toggle (only for Java) */}
        {language === 'java' && (
          <Button
            onClick={() => setShowInputPanel(!showInputPanel)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Keyboard className="w-4 h-4" />
            {showInputPanel ? 'Hide Input' : 'Add Input'}
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

      {/* Input Panel (for Java programs with Scanner) */}
      {showInputPanel && language === 'java' && (
        <div className="border-b border-[#30363d] bg-[#161b22] p-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Program Input (for Scanner)
            </label>
            <textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              placeholder="Enter input values (one per line)&#10;Example:&#10;10&#10;20"
              className="min-h-[80px] w-full bg-[#0d1117] border border-[#30363d] text-white placeholder:text-gray-500 font-mono text-sm p-2 rounded resize-none"
            />
            <p className="text-xs text-gray-500">
              💡 Enter values that your Scanner will read (e.g., numbers, strings)
            </p>
          </div>
        </div>
      )}

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
                {language === 'java' && (
                  <div className="mt-2 text-xs text-blue-400">
                    💡 For Java programs using Scanner, click "Add Input" to provide test data
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 