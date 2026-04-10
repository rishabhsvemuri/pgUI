import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BsChevronRight } from 'react-icons/bs';
import '.././assets/style.scss';

const COLLAPSED_WIDTH = 42;
const EXPANDED_WIDTH = 400;

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
      style={{ width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
    >
      <button
        type="button"
        className="console-toggle"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isExpanded ? (
          <>
            <BsChevronRight className="console-chevron" />
            <span className={`console-status ${runStatus}`}>{statusLabel}</span>
          </>
        ) : (
          runStatus !== 'idle' ? (
            <span className={`console-status ${runStatus}`}>{statusLabel}</span>
          ) : (
            <span className="console-collapsed-label">CONSOLE</span>
          )
        )}
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
