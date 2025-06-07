import { ReactNode } from "react"

export default function InvoicingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="w-full">
            {children}
        </div>
    )
} 