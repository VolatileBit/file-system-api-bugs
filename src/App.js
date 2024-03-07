import logo from './logo.svg';
import './App.css';
import {useState} from "react";

function App() {
  const [fileCount, setFileCount] = useState(undefined);
  const [attemptAndSuccessCount, setAttemptAndSuccessCount] = useState({
    attemptCount: 0,
    successCount: 0
  });

  const openDirectoryOne = async () => {
    // Recursive function that walks the directory structure.
    const getFileHandles = async (dirHandle) => {
      const handles = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
          handles.push(entry)
        } else if (entry.kind === "directory") {
          handles.concat(getFileHandles(entry));
        }
      }
      return handles;
    };

    try {
      // Open the directory.
      const directoryHandle = await window.showDirectoryPicker({
        mode: "read",
      });
      const allHandles = await getFileHandles(directoryHandle, undefined);
      setFileCount(allHandles.length);
      console.log("Bug #1: file count", allHandles.length);
      setInterval(async () => {
        const allHandles = await getFileHandles(directoryHandle, undefined);
        setFileCount(allHandles.length);
        console.log("Bug #1: file count", allHandles.length);
      }, 3000);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err.name, err.message);
      }
    }
  };

  const openDirectoryTwo = async () => {
    // Recursive function that walks the directory structure.

    try {
      // Open the directory.
      const directoryHandle = await window.showDirectoryPicker({
        mode: "read",
      });

      let attemptCount = 0;
      let successCount = 0;

      const getFileHandles = async (dirHandle) => {
        const handles = [];
        attemptCount++;
        console.log("loop start")
        for await (const entry of dirHandle.values()) {
          console.log("file name", entry.name);
          if (handles.length % 2 === 0) {
            // This randomly causes the loop to stuck, commenting it out fixes the loop
            const file = await entry.getFile();
          }
          if (entry.kind === "file") {
            handles.push(entry)
          } else if (entry.kind === "directory") {
            handles.concat(getFileHandles(entry));
          }
        }
        console.log("loop end")
        successCount++;
        return handles;
      };

      getFileHandles(directoryHandle, undefined);
      setTimeout(() => {
        console.log("Bug #2: attempt count",  attemptCount);
        console.log("Bug #2: success count",  successCount);
        setAttemptAndSuccessCount({
          attemptCount,
          successCount,
        })
      }, 1000);

      setInterval(async () => {
        getFileHandles(directoryHandle, undefined);
        setTimeout(() => {
          console.log("Bug #2: attempt count",  attemptCount);
          console.log("Bug #2: success count",  successCount);
          setAttemptAndSuccessCount({
            attemptCount,
            successCount,
          })
        }, 1000);
      }, 3000);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err.name, err.message);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Bug #1: Directory async iterator does not provide full list of files in folder</h2>
        <p>You can download a test file directory
          archive <a href="https://files-system-api-bugs-demo.polarr.co/example-files.zip">here</a> that contains 2000
          files</p>
        <p>
          Pick a file directory and observe displayed file count or <code>Console</code> logs. It will try to drain the
          directory.values() iterator every 3 seconds and count the total number of files.
        </p>
        <button style={{fontSize: "30px"}} onClick={openDirectoryOne}>Select Directory</button>
        <br/>
        {fileCount ? <p>File Count: {fileCount}</p> : <p>No folder selected</p>}
        <hr/>
        <h2>Bug #2: Async iterator stuck indefinitely when <code>await</code> is used in <code>for await</code> loop</h2>
        <p>
          When using <code>for await ... of ...</code> loops to iterator over <code>directory.values()</code>,
          if <code>await</code> statements are used inside the loop, sometimes the loop will be stuck after some iterations
          indefinitely on the <code>await</code> of the async iterator. Using <code>iterator.next()</code> in a while
          loop is the same.
          This also applies to <code>directory.entries()</code> and <code>directory.keys()</code>
        </p>
        <p>
          Pick a file directory and it will iterate through the directory every 3 seconds. <code>await</code> is used
          inside the loop to fetch some of the files. The success count should increase every 3 seconds, but due to the
          bug it sometimes doesn't
          due to hanging, the bigger the loop (more files), the worse the problem. Loop iteration status is logged to <code>Console</code>.
        </p>
        <button style={{fontSize: "30px"}} onClick={openDirectoryTwo}>Select Directory</button>
        <br/>
        <p>Attempt Count: {attemptAndSuccessCount.attemptCount} | Success Count: {attemptAndSuccessCount.successCount}</p>
        <hr/>
        <a
            href="https://github.com/VolatileBit/file-system-api-bugs"
            target="_blank"
            rel="noopener noreferrer"
        >
          Github Repo
        </a>
      </header>
    </div>
  );
}

async function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
}

export default App;
