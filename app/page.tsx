import { redirect } from 'next/navigation';

export default function Home() {
  // Ensure default redirect to Persian locale when accessing '/'
  redirect('/fa');
}
