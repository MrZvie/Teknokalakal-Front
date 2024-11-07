import Link from "next/link";
import Center from "./Center";
import { useContext } from "react";
import { CartContext } from "./CartContext";

export default function Header() {
  // Accessing the cart products from CartContext to display the cart count
  const {cartProducts} = useContext(CartContext);

  return (
    <header className="border-b border-black ">
      <Center>
        <div className=" py-3 px-0 flex justify-between items-center ">
            <Link className="text-aqua-forest-600 font-bold" href="/">
              TeknoKalakal
            </Link>
            <nav className="flex gap-5">
              <Link href={"/"}>Home</Link>
              <Link href={"/products"}>All Products</Link>
              <Link href={"/forum"}>Forum</Link>
              <Link href={"/about"}>About</Link>
              <Link href={"/contact"}>Contact</Link>
              <Link href={"/account"}>Account</Link>
              <Link href={"/cart"}>Cart ({cartProducts.length})</Link>
            </nav>
        </div>
      </Center>
    </header>
  );
}
