import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

const Recording = dynamic(() => import('../../components/Recording'), { ssr: false });

export default function Home() {
  const cookieStore = cookies();
  const accessToken = cookieStore.getAll("next-auth.session-token");

  return (
    <main>
      <Recording />
    </main>
  );
}
