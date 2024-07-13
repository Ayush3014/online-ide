import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLUGS = [
  'car',
  'dog',
  'computer',
  'person',
  'human',
  'music',
  'inside',
  'word',
  'for',
  'please',
  'cool',
  'to',
  'open',
  'close',
  'source',
];

const URL = 'http://localhost:3001';

function getRandomSlug() {
  let slug = '';
  for (let i = 0; i < 3; i++) {
    slug += SLUGS[Math.floor(Math.random() * SLUGS.length)];
  }

  return slug;
}

export default function Landing() {
  const [language, setLanguage] = useState('node-js');
  const [replId, setReplId] = useState(getRandomSlug());

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div id="container" className="p-5 flex flex-col items-center">
      <h1 className="text-white">Online IDE</h1>
      <input
        className="mx-3 my-0 p-3 border border-solid border-[#ccc] rounded-[5px]"
        onChange={(e) => setReplId(e.target.value)}
        type="text"
        placeholder="Repl ID"
        value={replId}
      />
      <select
        className="mx-3 p-3 border border-solid border-[#ccc] rounded-[5px]"
        name="language"
        id="language"
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="node-js">Node.js</option>
        <option value="python">Python</option>
      </select>
      <button
        className="px-[10px] py-[20px] bg-[#007bff] text-white border-none rounded-[5px] cursor-pointer hover:bg-[#0056b3] "
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await axios.post(`${URL}/project`, { replId, language });
          setLoading(false);
          navigate(`/coding/?replId=${replId}`);
        }}
      >
        {loading ? 'Creating a Repl...' : 'Repl created'}
      </button>
    </div>
  );
}
