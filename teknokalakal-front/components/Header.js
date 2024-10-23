import Link from "next/link";
import Center from "./Center";

export default function Header() {
  return (
    <header className="border-b border-black ">
      <Center>
        <div className=" py-3 px-0 flex justify-between items-center ">
            <Link className="text-aqua-forest-600 font-bold" href="/">
              TeknoKalakal
            </Link>
            <nav className="flex gap-5">
              <Link href={"/"}>Home</Link>
              <Link href={"/forum"}>Forum</Link>
              <Link href={"/about"}>About</Link>
              <Link href={"/contact"}>Contact</Link>
              <Link href={"/account"}>Account</Link>
              <Link href={"/cart"}>Cart (0)</Link>
            </nav>
        </div>
      </Center>
    </header>
  );
}
