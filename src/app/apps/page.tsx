import Image from "next/image";
import Link from "next/link";
export default function Apps() {
    const apps = [
        {
            name: "TODOS",
            image: "/assets/svgs/todos.svg",
            route: "/apps/todos",
        },
        {
            name: "INVOICING",
            image: "/assets/svgs/invoicing.svg",
            route: "/apps/invoicing",
        },
        {
            name: "SUBSCRIPTIONS",
            image: "/assets/svgs/subscriptions.svg",
            route: "/apps/subscriptions",
        },
        {
            name: "CALENDAR",
            image: "/assets/svgs/calendar.svg", 
            route: "/apps/calendar",
        },


    ]
    return (
        <div className="w-full py-[20px] px-[20px]">
            <div className="max-w-[1024px] mx-auto">
                <header className="flex w-full justify-between items-center">
                    <div className="flex items-center gap-3"><h1 className="text-3xl font-regular">{new Date().getHours() < 12 ? "GOOD MORNING" : "WELCOME BACK"}, Aisle</h1>
                        <Image src="/assets/icons/face.svg" alt="aisle" width={28} height={28} className="pt-[1px]" /></div>
                    <h1 className="text-3xl font-regular">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }).toUpperCase()} - {new Date().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }).toUpperCase()}
                    </h1>
                </header>
                <section className="flex flex-col mt-[20px]">
                    <div className="flex">
                        <div className="border-t border-x border-primary px-[5px] py-[5px] bg-white">
                            <h1 className="text-base font-regular">Personal Tools →</h1>
                        </div>
                    </div>
                    <div className="border flex gap-[10px] p-[20px] bg-white">
                        {apps.map((app) => (
                            <Link href={app.route} key={app.name} className="flex">
                                <div className="cursor-pointer group flex flex-col gap-2 bg-black p-[5px] max-w-[140px] max-h-[140px] w-[140px] h-[140px] hover:bg-secondary border">
                                    <div className="flex w-full border h-full bg-white justify-end items-end">
                                        <Image draggable={false} width={100} height={100} src={app.image} alt={app.name} className="object-cover -mb-[1px] -mr-[1px]" />
                                    </div>
                                    <h1 className="text-base text-white group-hover:text-black">{app.name}</h1>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}