import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";
// import {  Terminal as XTerm } from "xterm";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import * as monaco from "monaco-editor";
import "xterm/css/xterm.css";

import * as editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import * as jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import * as cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import * as htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import * as tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { useSocket } from "../lib/socket";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

type FileTreeItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
  content?: string;
};

const initialFileTree: FileTreeItem[] = [
  {
    id: "1",
    name: "src",
    type: "folder",
    children: [
      {
        id: "2",
        name: "index.js",
        type: "file",
        content: "// Write your code here\n",
      },
      {
        id: "3",
        name: "styles.css",
        type: "file",
        content: "/* CSS styles */\n",
      },
    ],
  },
  {
    id: "4",
    name: "public",
    type: "folder",
    children: [
      {
        id: "5",
        name: "index.html",
        type: "file",
        content: "<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>",
      },
    ],
  },
  {
    id: "6",
    name: "package.json",
    type: "file",
    content: '{\n  "name": "vscode-clone",\n  "version": "1.0.0"\n}',
  },
  {
    id: "7",
    name: "README.md",
    type: "file",
    content: "# VSCode Clone\n\nThis is a VSCode clone project.",
  },
];

const FileTreeComponent: React.FC<{
  items: FileTreeItem[];
  onFileSelect: (file: FileTreeItem) => void;
  selectedFile: string | null;
}> = ({ items, onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderItem = (item: FileTreeItem) => (
    <li key={item.id} className="my-1">
      <div
        className={`flex items-center hover:bg-[#37373d] rounded px-2 py-1 cursor-pointer ${
          selectedFile === item.id ? "bg-[#37373d]" : ""
        }`}
        onClick={() =>
          item.type === "folder" ? toggleFolder(item.id) : onFileSelect(item)
        }
      >
        {item.type === "folder" && (
          <span className="mr-1">
            {expandedFolders.has(item.id) ? (
              <ChevronDown size={16} className="text-[#cccccc]" />
            ) : (
              <ChevronRight size={16} className="text-[#cccccc]" />
            )}
          </span>
        )}
        <span
          className={`flex items-center ${
            item.type === "folder" ? "text-[#cccccc]" : "text-[#cccccc]"
          }`}
        >
          {item.type === "folder" ? (
            <Folder size={16} className="mr-2 text-[#c5c5c5]" />
          ) : (
            <File size={16} className="mr-2 text-[#c5c5c5]" />
          )}
          <span className="text-sm">{item.name}</span>
        </span>
      </div>
      {item.type === "folder" &&
        expandedFolders.has(item.id) &&
        item.children && (
          <ul className="ml-4">
            {item.children.map((child) => renderItem(child))}
          </ul>
        )}
    </li>
  );

  return (
    <ul className="text-[#cccccc]">{items.map((item) => renderItem(item))}</ul>
  );
};

function MyXTerm() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);

  function onMessage(data: { type: string; payload: any }) {
    console.log("onMessage:", data);

    if (data.type === "pod:terminal_output") {
      if (termRef.current) {
        console.log("client:terminal_output:", data);

        termRef.current.writeln(data.payload);
        termRef.current.scrollToBottom();
      }
    }

    if (data.type === "pod:terminal_input") {
      if (termRef.current) {
        termRef.current.write(data.payload);
      }
    }
  }

  const { socket } = useSocket(onMessage);

  const commandRef = useRef("");

  useEffect(() => {
    console.log("render: init terminal");
    // Initialize terminal only if it hasn't been initialized yet
    if (!termRef.current) {
      const term = new XTerm({
        theme: {
          background: "#1e1e1e",
          foreground: "#cccccc",
        },
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        cursorBlink: true,
      });

      termRef.current = term;

      if (terminalRef.current) {
        term.open(terminalRef.current);
        term.writeln("\x1b[1;34m$\x1b[0m Welcome to the terminal!");
        console.log("Terminal opened");

        term.onData((data) => {
          console.log("data:", data);

          if (data === "\r") {
            // If Enter is pressed
            console.log(
              "Enter pressed, sending command:",
              `${commandRef.current}`
            );
            // socket.("pod:terminal_input", `${commandRef.current}`);
            socket.send(
              JSON.stringify({
                type: "pod:terminal_input",
                payload: `${commandRef.current}`,
              })
            );
            term.writeln("\x1b[1;34m$\x1b[0m "); // Display prompt again
            commandRef.current = ""; // Clear the buffer after sending
          } else if (data === "\x08" || data === "\x7f") {
            // If Backspace is pressed
            commandRef.current = commandRef.current.slice(0, -1); // Remove the last character from the buffer
            term.write("\b \b"); // Move back, write a space, and move back again to clear the character visually
          } else {
            commandRef.current += data; // Append the input to the buffer
            term.write(data); // Write the character to the terminal
          }
        });
      }
    }

    return () => {
      if (termRef.current) {
        console.log("Terminal disposed");
        termRef.current.dispose();
        termRef.current = null; // Clean up the reference
      }
    };
  }, []);

  return <div ref={terminalRef} className="h-full" />;
}

export function VSCode() {
  const [fileTree, setFileTree] = useState<FileTreeItem[]>(initialFileTree);
  const [activeFile, setActiveFile] = useState<FileTreeItem | null>(null);
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>(
    {}
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !editor) {
      const newEditor = monaco.editor.create(editorRef.current, {
        value: "",
        language: "javascript",
        theme: "vs-dark",
        minimap: { enabled: false },
      });
      setEditor(newEditor);

      return () => {
        newEditor.dispose();
      };
    }
  }, [editor]);

  useEffect(() => {
    fetch(`http://localhost:4000/workspace/123/files`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        const files = data.files as FileTreeItem[];
        setFileTree(files);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleFileSelect = (file: FileTreeItem) => {
    if (file.type === "file") {
      setActiveFile(file);
      if (!fileContents[file.id]) {
        setFileContents((prev) => ({ ...prev, [file.id]: file.content || "" }));
      }
      if (editor) {
        editor.setValue(fileContents[file.id] || file.content || "");
        editor.updateOptions({ language: getLanguageFromFileName(file.name) });
      }
    }
  };

  const getLanguageFromFileName = (fileName: string) => {
    if (fileName.endsWith(".js")) return "javascript";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".html")) return "html";
    if (fileName.endsWith(".json")) return "json";
    if (fileName.endsWith(".md")) return "markdown";
    return "plaintext";
  };

  const handleEditorChange = () => {
    if (editor && activeFile) {
      const newContent = editor.getValue();
      setFileContents((prev) => ({ ...prev, [activeFile.id]: newContent }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newHeight = window.innerHeight - e.clientY;
      setTerminalHeight(
        Math.max(50, Math.min(newHeight, window.innerHeight - 200))
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove as any);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove as any);
    };
  }, [isDragging]);

  useEffect(() => {
    if (editor) {
      editor.onDidChangeModelContent(() => handleEditorChange());
    }
  }, [editor, activeFile]);

  return (
    <div
      className="h-screen flex overflow-hidden bg-[#1e1e1e] text-[#cccccc]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="w-64 flex-shrink-0 overflow-auto">
        <Card className="h-full rounded-none bg-[#252526]">
          <CardBody className="p-2">
            <h3 className="text-sm font-semibold mb-2 text-[#cccccc]">
              EXPLORER
            </h3>
            <FileTreeComponent
              items={fileTree}
              onFileSelect={handleFileSelect}
              selectedFile={activeFile?.id || null}
            />
          </CardBody>
        </Card>
      </div>
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow overflow-hidden">
          <Card className="h-full rounded-none bg-[#1e1e1e]">
            <CardBody className="p-0">
              {activeFile ? (
                <div ref={editorRef} className="h-full w-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-[#cccccc]">
                  Select a file to edit
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        <div
          className="h-1 bg-[#007acc] cursor-ns-resize"
          onMouseDown={() => setIsDragging(true)}
        ></div>
        <div
          style={{ height: `${terminalHeight}px` }}
          className="overflow-hidden"
        >
          <Card className="h-full rounded-none bg-[#1e1e1e]">
            <CardBody className="p-0">
              <MyXTerm />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
