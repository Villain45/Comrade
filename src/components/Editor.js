import React, { useEffect, useRef, useState } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/clike/clike";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/matchtags";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/selection/active-line";
import { FiDownload } from "react-icons/fi";
import "./Editor.css";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const realtimeCode = useRef(null);
  const langRef = useRef("text/plain");

  const extension = new Map([
    ["text/plain","txt"],
    ["text/x-csrc", "c"],
    ["text/x-c++src", "cpp"],
    ["text/x-java", "java"],
    ["javascript", "js"],
    ["python", "py"],
  ]);

  function saveFile() {
    let data = realtimeCode.current;
    let filename = prompt("Save As?");
    let file = filename + "." + extension.get(langRef.current);

    let link = document.createElement("a");
    link.download = file;
    let blob = new Blob(["" + data + ""], {
      type: "text/plain",
    });
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function changeFunc() {
    var selectBox = document.getElementById("lang");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    langRef.current = selectedValue;
    editorRef.current.on("change", (instance, changes)=>{
      instance.setOption("mode", langRef.current);
    })
  }

  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: langRef.current, json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          autocorrect: true,
          lineNumbers: true,
          matchBrackets: true,
          matchTags: true,
          styleActiveLine: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        realtimeCode.current = code;
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit("code-change", {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code-change", ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off("code-change");
    };
  }, [socketRef.current]);

  return (
    <>
      <div className="dropdown_download">
        <div className="dropdown">
          <label>Language : </label>
          <select id="lang" onChange={changeFunc}>
            <option value="text/plain">None</option>
            <option value="text/x-csrc">C</option>
            <option value="text/x-c++src">C++</option>
            <option value="text/x-java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
        <div>
          <FiDownload className="icon" onClick={saveFile}/>
        </div>
      </div>
      <textarea id="realtimeEditor"></textarea>
    </>
  );
};

export default Editor;