import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "./Header";
import BarrIcon from "./icons/BarrIcon";
import Green from "./Green";
import Link from "next/link";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  // console.log('User: ', session);

  // Redirect unauthenticated users before rendering
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Display loading indicator while session is loading
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-aqua-forest-300 z-50">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Green />
      <div className="md:hidden text-aqua-forest-600 flex items-center p-1">
        <button onClick={() => setShowNav(true)}>
          <BarrIcon />
        </button>
        <Link href="/" className="flex grow justify-center font-bold text-xl mr-6">
          TeknoKalakal
        </Link>
      </div>
      <Header showNav={showNav} closeNav={() => setShowNav(false)} />
      <div className="flex-grow">{children}</div>
      <footer className="text-center py-4">
        <p>&copy; {new Date().getFullYear()} Teknokalakal. All rights reserved.</p>
      </footer>
    </div>
  );
}
