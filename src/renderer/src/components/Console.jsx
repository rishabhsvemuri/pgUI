import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BsChevronUp, BsChevronDown } from 'react-icons/bs';
import '.././assets/style.scss';

const COLLAPSED_HEIGHT = 42;
const EXPANDED_HEIGHT = 260;

function Console() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lines, setLines] = useState([]);
  const [runStatus, setRunStatus] = useState('idle');
  const linesEndRef = useRef(null);

  useEffect(() => {
    const handleConsoleOutput = (_event, payload) => {
      if (!payload) {
        return;
      }

      if (payload.type === 'clear') {
        setLines([]);
        setRunStatus('idle');
        return;
      }

      if (payload.type === 'status') {
        setRunStatus(payload.status || 'idle');

        if (payload.status === 'error') {
          setIsExpanded(true);
        }

        if (payload.text) {
          setLines((prevLines) => [
            ...prevLines,
            {
              id: `${Date.now()}-${prevLines.length}`,
              kind: 'status',
              text: payload.text
            }
          ]);
        }

        return;
      }

      if (payload.type === 'stdout' || payload.type === 'stderr') {
        const nextLines = payload.text
          .split(/\r?\n/)
          .map((line) => line.trimEnd())
          .filter((line) => line.length > 0)
          .map((line, index) => ({
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
            kind: payload.type,
            text: line
          }));

        if (nextLines.length > 0) {
          setLines((prevLines) => [...prevLines, ...nextLines]);
        }
      }
    };

    window.electron.onConsoleOutput(handleConsoleOutput);

    return () => {
      window.electron.offConsoleOutput(handleConsoleOutput);
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      linesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isExpanded, lines]);

  const statusLabel = useMemo(() => {
    if (runStatus === 'running') {
      return 'Running';
    }

    if (runStatus === 'success') {
      return 'Success';
    }

    if (runStatus === 'error') {
      return 'Error';
    }

    return 'Idle';
  }, [runStatus]);

  return (
    <div
      className={`console-shell ${isExpanded ? 'expanded' : ''}`}
      style={{ height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT }}
    >
      <button
        type="button"
        className="console-toggle"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span className="console-title">Console</span>
        <span className={`console-status ${runStatus}`}>{statusLabel}</span>
        {isExpanded ? <BsChevronDown /> : <BsChevronUp />}
      </button>
      <div className="console-body">
        {lines.length === 0 ? (
          <p className="console-empty">Run a script to see R output here.</p>
        ) : (
          <div className="console-lines">
            {lines.map((line) => (
              <div key={line.id} className={`console-line ${line.kind}`}>
                <span className="console-prefix">
                  {line.kind === 'stderr' ? 'err' : line.kind === 'status' ? 'sys' : 'out'}
                </span>
                <span className="console-text">{line.text}</span>
              </div>
            ))}
            <div ref={linesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Console;
