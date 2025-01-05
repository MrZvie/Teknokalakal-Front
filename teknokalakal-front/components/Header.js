import Link from "next/link";
import Center from "./Center";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import XIcon from "./icons/XIcon";
import { useSession } from "next-auth/react";
import CartIcon from "./icons/CartIcon";
import ContactIcon from "./icons/ContactIcon";
import ForumIcon from "./icons/ForumIcon";
import AllProductIcon from "./icons/AllProductscon";
import HomeIcon from "./icons/HomeIcon";
import AboutIcon from "./icons/AboutIcon";
import AccountIcon from "./icons/AccountIcon";

export default function Header({ showNav, closeNav }) {
    const { cartProducts } = useContext(CartContext);
    const {data: session} = useSession();

    return (
      <header className="border-b border-black">
        <Center>
          <div className="py-3 px-0 hidden md:flex justify-between items-center">
            <Link className="text-aqua-forest-600 font-bold md:text-base lg:text-xl block" href="/">
              TeknoKalakal
            </Link>

            <nav className="flex gap-5">
              <Link href="/" className="flex items-center text-sm lg:text-lg  gap-1">
                <HomeIcon className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>Home</span>
              </Link>
              <Link href="/products" className="flex items-center text-sm lg:text-lg  gap-1">
                <AllProductIcon className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>All Products</span>
              </Link>
              <Link href="/forum" className="flex items-center text-base lg:text-lg  gap-1">
                <ForumIcon className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>Forum</span>
              </Link>
              <Link href="/about" className="flex items-center text-base lg:text-lg  gap-1">
                <AboutIcon className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>About</span>
              </Link>
              <Link href="/contact" className="flex items-center text-base lg:text-lg  gap-1">
                <ContactIcon className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>Contact</span>
              </Link>
              <Link href="/account" className="flex items-center text-base lg:text-lg  gap-1">
                <AccountIcon className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>Account</span>
              </Link>
              <Link href="/cart" className="flex items-center text-base lg:text-lg  gap-1">
                <CartIcon className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>({cartProducts.length})</span>
              </Link>
            </nav>
          </div>
        </Center>

        {/* Mobile navigation overlay */}
        {showNav && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex md:hidden"
            onClick={closeNav}
          >
            {/* Navigation Drawer */}
            <div
              className="bg-white w-[90%] max-w-[90%] h-full shadow-lg relative transition-transform duration-300 ease-in-out transform translate-x-0 rounded-r-lg"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the drawer
            >
              {/* Profile Section */}
              <div className="flex items-center gap-4 px-6 py-4 bg-gray-100 border-b">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  {/* Placeholder Profile Icon */}
                  <img
                    src="https://cdn-icons-gif.flaticon.com/8819/8819071.gif"
                    alt="profile"
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Welcome,
                    <span className="text-red-400 px-1">
                      {session?.user?.name || "Guest"}
                    </span>
                  </p>
                  <Link
                    href="/account"
                    className="text-sm flex justify-center items-center gap-1 text-aqua-forest-600 hover:underline"
                    onClick={closeNav}
                  >
                    View Account
                    <span>
                      <AccountIcon />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeNav}
                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-aqua-forest-600 transition-colors"
              >
                <XIcon />
              </button>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-4 text-left px-6 mt-6 text-base font-medium">
                {/* Home */}
                <Link
                  href="/"
                  onClick={closeNav}
                  className="flex items-center gap-3 text-gray-700 hover:text-aqua-forest-800 transition-colors py-2"
                >
                  <HomeIcon />
                  Home
                </Link>

                {/* All Products */}
                <Link
                  href="/products"
                  onClick={closeNav}
                  className="flex items-center gap-3 text-gray-700 hover:text-aqua-forest-800 transition-colors py-2"
                >
                  <AllProductIcon />
                  All Products
                </Link>

                {/* Forum */}
                <Link
                  href="/forum"
                  onClick={closeNav}
                  className="flex items-center gap-3 text-gray-700 hover:text-aqua-forest-800 transition-colors py-2"
                >
                  <ForumIcon />
                  Forum
                </Link>

                {/* Other Links */}
                <Link
                  href="/about"
                  onClick={closeNav}
                  className="flex items-center gap-3 text-gray-700 hover:text-aqua-forest-800 transition-colors py-2"
                >
                  <AboutIcon />
                  About
                </Link>

                {/* Contact */}
                <Link
                  href="/contact"
                  onClick={closeNav}
                  className="flex items-center gap-3 text-gray-700 hover:text-aqua-forest-800 transition-colors py-2"
                >
                  <ContactIcon />
                  Contact
                </Link>

                {/* Cart */}
                <Link
                  href="/cart"
                  onClick={closeNav}
                  className="flex items-center gap-3 text-gray-700 hover:text-aqua-forest-800 transition-colors py-2"
                >
                  <CartIcon />
                  Cart ({cartProducts.length})
                </Link>
              </nav>

              {/* Footer */}
              <div className="absolute bottom-6 left-6 text-xs text-gray-400">
                © 2024 TeknoKalakal
              </div>
            </div>
          </div>
        )}
      </header>
    );
}
