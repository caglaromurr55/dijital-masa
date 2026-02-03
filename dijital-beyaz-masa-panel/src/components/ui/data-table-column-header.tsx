"use client"

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps
    extends React.HTMLAttributes<HTMLDivElement> {
    column: {
        id: string
        title: string
    }
}

export function DataTableColumnHeader({
    column,
    className,
}: DataTableColumnHeaderProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentSort = searchParams.get("sort")
    const currentOrder = searchParams.get("order")

    const isSorted = currentSort === column.id
    const isDesc = isSorted && currentOrder === "desc"
    const isAsc = isSorted && currentOrder === "asc"

    const toggleSort = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (isAsc) {
            params.set("sort", column.id)
            params.set("order", "desc")
        } else if (isDesc) {
            params.delete("sort")
            params.delete("order") // Clear sort or cycle to default? Let's cycle: Asc -> Desc -> None/Default
        } else {
            params.set("sort", column.id)
            params.set("order", "asc")
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-900"
                onClick={toggleSort}
            >
                <span>{column.title}</span>
                {isDesc ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                ) : isAsc ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
            </Button>
        </div>
    )
}
