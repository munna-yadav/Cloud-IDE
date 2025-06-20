import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24];
const FONTS = [
  { name: 'Fira Code', value: "'Fira Code', monospace" },
  { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
  { name: 'Monaco', value: "Monaco, monospace" },
  { name: 'Consolas', value: "Consolas, monospace" },
];

export function CodeEditor({ value, language, onChange, readOnly = false }: CodeEditorProps) {
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off');

  const handleEditorDidMount = (_editor: any, monaco: any) => {
    // Add Java language configuration
    if (language === 'java') {
      // Register Java completion provider
      monaco.languages.registerCompletionItemProvider('java', {
        provideCompletionItems: (_model: any, _position: any) => {
          const suggestions = [
            // Java keywords
            {
              label: 'public class',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'public class ${1:ClassName} {\n\t${2}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Create a public class'
            },
            {
              label: 'main method',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'public static void main(String[] args) {\n\t${1}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Create main method'
            },
            {
              label: 'System.out.println',
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: 'System.out.println(${1});',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Print line to console'
            },
            {
              label: 'for loop',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Create for loop'
            },
            {
              label: 'if statement',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'if (${1:condition}) {\n\t${2}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Create if statement'
            },
            // Common Java types
            { label: 'String', kind: monaco.languages.CompletionItemKind.Class },
            { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'boolean', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'double', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'float', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'char', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'long', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'byte', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'short', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'void', kind: monaco.languages.CompletionItemKind.Keyword },
            // Access modifiers
            { label: 'public', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'private', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'protected', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'static', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'final', kind: monaco.languages.CompletionItemKind.Keyword },
            { label: 'abstract', kind: monaco.languages.CompletionItemKind.Keyword },
          ];
          
          return { suggestions };
        }
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end gap-2 border-b border-[#333] bg-[#1e1e1e] p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Font Size</label>
                <Select
                  value={fontSize.toString()}
                  onValueChange={(value) => setFontSize(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Font Family</label>
                <Select
                  value={fontFamily}
                  onValueChange={setFontFamily}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Word Wrap</label>
                <Select
                  value={wordWrap}
                  onValueChange={(value: 'on' | 'off') => setWordWrap(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="on">On</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Minimap</label>
                <Button
                  variant={minimap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMinimap(!minimap)}
                >
                  {minimap ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: minimap },
            fontSize,
            fontFamily,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap,
            tabSize: 2,
            readOnly,
            automaticLayout: true,
            fontLigatures: true,
            suggest: {
              insertMode: 'replace',
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
          }}
        />
      </div>
    </div>
  );
}
