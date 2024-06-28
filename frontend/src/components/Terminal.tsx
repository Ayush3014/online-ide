import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
const fitAddon = new FitAddon();

// change, array buffer (binary data) to string
function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200,
  theme: {
    background: 'black',
  },
};

export const TerminalComponent = ({ socket }: { socket: Socket }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!terminalRef || !terminalRef.current || !socket) {
      return;
    }

    socket.emit('requestTerminal');
    socket.on('terminal', terminalHandler);
    const term = new Terminal(OPTIONS_TERM);
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // change
    function terminalHandler({ data }: { data: ArrayBuffer | string }) {
      if (data instanceof ArrayBuffer) {
        console.error(data);
        console.log(ab2str(data));
        term.write(ab2str(data));
      } else if (typeof data === 'string') {
        term.write(data);
      }
    }

    term.onData((data) => {
      socket.emit('terminalData', {
        data,
      });
    });

    socket.emit('terminalData', {
      data: '\n',
    });

    return () => {
      socket.off('terminal');
    };
  }, [terminalRef]);

  return <div className="w-[40vw] h-[400px] text-left" ref={terminalRef}></div>;
};
