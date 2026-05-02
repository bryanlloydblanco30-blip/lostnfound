import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect the root landing page pointing perfectly to to the LS (Login/Signup)
  redirect('/LS');
}
