import { ReactNode } from 'react';

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="w-[250px] h-[100vh] border-solid border-white border-r">
      {children}
    </aside>
  );
}
