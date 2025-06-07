import { ReactNode } from "react"

export default function AppsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full overflow-hidden py-[20px] px-[20px]">
            {children}
        </div>
    )
}