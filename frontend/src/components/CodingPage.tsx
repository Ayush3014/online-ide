import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Editor } from './Editor';
import { File, RemoteFile, Type } from './external/editor/utils/file-manager';
import { useSearchParams } from 'react-router-dom';
import { Output } from './Output';
import { TerminalComponent as Terminal } from './Terminal';
import axios from 'axios';

function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // const newSocket = io(`http://localhost:3001`, {
    //   query: { replId },
    // });
    const newSocket = io(`ws://${replId}.mydomain1.online`);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

export const CodingPage = () => {
  const [podCreated, setPodCreated] = useState(false);
  const [searchParams] = useSearchParams();
  const replId = searchParams.get('replId') ?? '';

  useEffect(() => {
    if (replId) {
      axios
        .post(`http://localhost:3002/start`, { replId })
        .then(() => setPodCreated(true))
        .catch((err) => console.error(err));
    }
  }, []);

  if (!podCreated) {
    return <>Booting...</>;
  }

  return <CodingPagePostPodCreation />;
};

export const CodingPagePostPodCreation = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get('replId') ?? '';
  const [loaded, setLoaded] = useState(false);
  const socket = useSocket(replId);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
        setLoaded(true);
        setFileStructure(rootContent);
        console.log('socket loaded');
      });
    }
  }, [socket]);

  const onSelect = (file: File) => {
    if (!file) {
      console.error('No file selected');
      return;
    }
    if (file.type === Type.DIRECTORY) {
      socket?.emit('fetchDir', file.path, (data: RemoteFile[]) => {
        setFileStructure((prev) => {
          const allFiles = [...prev, ...data];
          return allFiles.filter(
            (file, index, self) =>
              index === self.findIndex((f) => f.path === file.path)
          );
        });
      });
    } else {
      socket?.emit('fetchContent', { path: file.path }, (data: string) => {
        file.content = data;
        setSelectedFile(file);
      });
    }
  };

  if (!loaded) {
    return 'Loading...';
  }

  return (
    <div className="flex flex-col w-[100%]">
      <div className="flex justify-end p-[10px]">
        <button onClick={() => setShowOutput(!showOutput)}>See output</button>
      </div>
      <div className="flex m-0 text-base w-[100%] ">
        <div className="flex w-[100%]">
          {/* change */}
          {socket && (
            <>
              <div className="flex w-[60%]">
                <Editor
                  socket={socket}
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                  files={fileStructure}
                />
              </div>
              <div className="flex w-[40%]">
                {showOutput && <Output />}
                <Terminal socket={socket} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
