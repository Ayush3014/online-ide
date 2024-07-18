import { useSearchParams } from 'react-router-dom';

export const Output = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get('replId') ?? '';

  // domain name update
  const URI = `http://${replId}.mydomain2.online`;

  return (
    <div className="bg-white flex-1 min-h-0">
      <iframe src={`${URI}`} className="w-full h-full border-none"></iframe>
    </div>
  );
};
