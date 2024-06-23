import { useSearchParams } from 'react-router-dom';

export const Output = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get('replId') ?? '';

  // domain name update
  const URI = `http://localhost:3001`;

  return (
    <div className="bg-white h-[40vh]">
      <iframe src={URI} height="100%" width="100%"></iframe>
    </div>
  );
};
