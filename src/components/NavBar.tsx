import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
    return (
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center border-b z-20">

            <div className="w-full flex pl-8">
                <div className="flex items-center gap-2.5 w-full">
                    <Image src="/logo.svg" alt="logo" width={29} height={29} />
                    <Image src="/01.svg" alt="logo" width={50} height={29} />
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/apps/invoicing" className="bg-blue-600 text-white border-l px-4 py-2 hover:bg-blue-700 hover:cursor-pointer transition-colors">
                        📧 Invoicing
                    </Link>
                    <button className="bg-secondary border-l mr-4 text-nowrap px-4 py-2 hover:bg-primary hover:text-white hover:cursor-pointer">
                        {" Get In Touch →"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NavBar;