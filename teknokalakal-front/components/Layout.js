import { useState } from "react";
import Header from "./Header";
import BarrIcon from "./icons/BarrIcon";

export default function Layout({children}) {
    const [showNav,setShowNav] = useState(false);
    return (
      <div className="min-h-screen">
        <div className=" md:hidden text-white flex items-center p-2">
          <button onClick={() => setShowNav(true)}>
            <BarrIcon />
          </button>
          <div className="flex grow justify-center mr-6">
            Logo here
          </div>
        </div>
        <Header show={showNav} />
        <main className="flex-grow">{children}</main>
        <footer className="text-center py-4">
          <p>
            &copy; {new Date().getFullYear()} Teknokalakal. All rights reserved.
          </p>
        </footer>
      </div>
    );
}