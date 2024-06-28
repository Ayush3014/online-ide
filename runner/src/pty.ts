// change => also can use spawn instead of fork if it doesn't work
// @ts-ignore
import { fork, IPty } from 'node-pty';
import path from 'path';

const SHELL = process.platform === 'win32' ? 'cmd.exe' : 'bash';

export class TerminalManager {
  // property declaration
  private sessions: { [id: string]: { terminal: IPty; replId: string } } = {};

  //   private sessions: { [id: string]: Session } = {};  // for spawn

  constructor() {
    this.sessions = {};
  }

  // create a pseudo-terminal
  createPty(
    id: string,
    replId: string,
    onData: (data: string, id: number) => void // callback fun to handle incoming data
  ) {
    let term = fork(SHELL, [], {
      cols: 100,
      name: 'xterm',
      cwd: `/workspace`,
    });

    term.on('data', (data: string) => onData(data, term.pid));
    this.sessions[id] = {
      terminal: term,
      replId,
    };
    term.on('exit', () => {
      delete this.sessions[term.pid];
    });
    return term;
  }

  // for spawn
  //   createPty(
  //     id: string,
  //     replId: string,
  //     onData: (data: string, pid: number) => void
  //   ): IPty {
  //     const term = spawn(SHELL, [], {
  //       cols: 100,
  //       name: 'xterm',
  //       cwd: `/workspace`,
  //     });

  //     term.on('data', (data: string) => onData(data, term.pid));

  //     this.sessions[id] = {
  //       terminal: term,
  //       replId,
  //     };

  //     term.on('exit', () => {
  //       delete this.sessions[id];
  //     });

  //     return term;
  //   }

  write(terminalId: string, data: string) {
    this.sessions[terminalId]?.terminal.write(data);
  }

  clear(terminalId: string) {
    this.sessions[terminalId].terminal.kill();
    delete this.sessions[terminalId];
  }
}
