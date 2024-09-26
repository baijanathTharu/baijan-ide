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

export function VSCode() {
  const [fileTree] = useState<FileTreeItem[]>(initialFileTree);
  const [activeFile, setActiveFile] = useState<FileTreeItem | null>(null);
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>(
    {}
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { socket } = useSocket();

  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isTerminalReady, setIsTerminalReady] = useState(false);
  const commandBufferRef = useRef<string>(""); // Ref to store command buffer

  const handleTerminalInput = useCallback(
    (data: string) => {
      console.log("render: input ", data);

      socket.emit("terminal:input", data);
    },
    [socket]
  );

  const handleTerminalOutput = useCallback((data: string) => {
    console.log("render: output", data);
    termRef.current?.writeln(data);
  }, []);

  useEffect(() => {
    socket.emit("terminal:ready", {
      userId: "123",
    });

    return () => {
      socket.off("terminal:ready");
    };
  }, []);

  useEffect(() => {
    console.log("render: init terminal");
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

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
      term.writeln("\x1b[1;34m$\x1b[0m Welcome to the terminal!");
      console.log("Terminal opened");

      // term.attachCustomKeyEventHandler((event) => {
      //   console.log("render: key event", event.key);

      //   // if (event.key.toLowerCase() === "enter") {
      //   //   term.write("\r\n"); // Move to a new line and reset cursor to the start
      //   // }

      //   // if (event.key.toLowerCase() === "backspace") {
      //   //   setCommand((command) => {
      //   //     if (command.length > 0) {
      //   //       return command.slice(0, -1);
      //   //     }
      //   //     return command;
      //   //   });

      //   //   return;
      //   // }
      //   // setCommand((command) => command + event.key);
      // });

      term.onKey(({ key, domEvent }) => {
        if (domEvent.key === "Enter") {
          handleTerminalInput(commandBufferRef.current + "\r"); // Send full command on Enter
          commandBufferRef.current = ""; // Clear the buffer
          term.write("\r\n"); // Move to the next line in the terminal
        } else if (domEvent.key === "Backspace") {
          if (commandBufferRef.current.length > 0) {
            commandBufferRef.current = commandBufferRef.current.slice(0, -1); // Remove last character from the buffer
            term.write("\b \b"); // Erase character visually in the terminal
          }
        } else {
          commandBufferRef.current += key; // Append key to the buffer
          term.write(key); // Echo key to terminal display
        }
      });

      // term.onData(handleTerminalInput);

      setIsTerminalReady(true);
    }

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      console.log("Terminal disposed");
      term.dispose();
      resizeObserver.disconnect();
    };
  }, [handleTerminalInput]);

  useEffect(() => {
    if (isTerminalReady) {
      console.log("render: init socket listeners");

      socket.on("terminal:output", handleTerminalOutput);

      return () => {
        console.log("render: dispose socket listeners");
        socket.off("terminal:output", handleTerminalOutput);
      };
    }
  }, [isTerminalReady, handleTerminalOutput, socket]);

  useEffect(() => {
    const handleResize = () => {
      fitAddonRef.current?.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // useEffect(() => {
  //   const term = new XTerm({
  //     theme: {
  //       background: "#1e1e1e",
  //       foreground: "#cccccc",
  //     },
  //     fontSize: 14,
  //     fontFamily: 'Consolas, "Courier New", monospace',
  //     cursorBlink: true,
  //   });
  //   if (!terminalRendered.current) {
  //     terminalRendered.current = true;
  //     if (terminalRef.current) {
  //       term.open(terminalRef.current);
  //     }
  //     return;
  //   }

  //   const fitAddon = new FitAddon();
  //   term.loadAddon(fitAddon);
  //   fitAddon.fit();

  //   const resizeObserver = new ResizeObserver(() => {
  //     fitAddon.fit();
  //   });

  //   if (terminalRef.current) {
  //     term.writeln("\x1b[1;34m$\x1b[0m Welcome to the terminal!");
  //     console.log("written");

  //     term.open(terminalRef.current);
  //     console.log("opened");
  //     resizeObserver.observe(terminalRef.current);

  //     socket.on("terminal:output", (data) => {
  //       console.log("got data from server", data);

  //       term.writeln(data);
  //     });

  //     term.onData((data) => {
  //       console.log("data", data);

  //       socket.emit("terminal:input", {
  //         userId: "123",
  //         command: data,
  //       });
  //     });
  //   }

  //   return () => {
  //     console.log("disposed..");
  //     term.dispose();
  //     resizeObserver.disconnect();
  //   };
  // }, []);

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
              <div ref={terminalRef} className="h-full" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}