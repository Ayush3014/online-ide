import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { saveToS3 } from './aws';
import path from 'path';
import { fetchDir, fetchFileContent, saveFile } from './fs';
import { TerminalManager } from './pty';

const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      // should restrict this more
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', async (socket) => {
    // add Auth checks here
    const host = socket.handshake.headers.host;
    console.log(`host is ${host}`);
    const replId = host?.split('.')[0]; // ${replId}.domainName.com
    // const replId = 'humanforclose';

    // update replId => it is passed as query params
    console.log(replId);

    if (!replId) {
      socket.disconnect();
      terminalManager.clear(socket.id);
      return;
    }

    socket.emit('loaded', {
      rootContent: await fetchDir('/workspace', ''),
    });

    console.log('Socket loaded!!');
    initHandlers(socket, replId);
  });
}

function initHandlers(socket: Socket, replId: string) {
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('fetchDir', async (dir: string, callback) => {
    const dirPath = `/workspace/${dir}`;
    const contents = await fetchDir(dirPath, dir);
    callback(contents);
  });

  socket.on(
    'fetchContent',
    async ({ path: filePath }: { path: string }, callback) => {
      const fullPath = `/workspace/${filePath}`;
      const data = await fetchFileContent(fullPath);
      callback(data);
    }
  );

  // contents should be diff, not full file
  // should be validated for size
  // should be throttled before updating S3 (or use an S3 mount)
  socket.on(
    'updateContent',
    async ({ path: filePath, content }: { path: string; content: string }) => {
      const fullPath = `/workspace/${filePath}`;
      await saveFile(fullPath, content);
      await saveToS3(`code/${replId}`, filePath, content);
    }
  );

  socket.on('requestTerminal', async () => {
    terminalManager.createPty(socket.id, replId, (data, id) => {
      socket.emit('terminal', {
        data: Buffer.from(data, 'utf-8'),
      });
    });
  });

  socket.on(
    'terminalData',
    async ({ data }: { data: string; terminalId: number }) => {
      terminalManager.write(socket.id, data);
    }
  );
}
