import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocation } from "react-router"

export default function AdminSidebar() {
    const { pathname } = useLocation();
    const last_path_seg = pathname.substring(pathname.lastIndexOf('/') + 1);
    console.log(last_path_seg);
    return (
        <SidebarProvider>
            <AppSidebar active={last_path_seg}/>
            <SidebarInset>
                <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-10">
                    <SidebarTrigger className="-ml-1" />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {Array.from({ length: 24 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="h-12 w-full rounded-lg"
                        />
                    ))}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
