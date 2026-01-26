import * as React from "react"
import { ChevronRight, Icon } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    navMain: [
        {
            title: "CRUD Administration",
            url: "#",
            items: [
                {
                    title: "Books",
                    slug: "books",
                    url: "#",
                    is_active: false,
                },
                {
                    title: "Readers",
                    slug: "readers",
                    url: "#",
                    is_active: false,
                },
            ],
        },
        {
            title: "Application",
            url: "#",
            items: [
                {
                    title: "Catalogue",
                    slug: "catalogue",
                    url: "#",
                    is_active: false,
                },
                {
                    title: "Active Loans",
                    slug: "active-loans",
                    url: "#",
                    is_active: false,
                },
            ],
        },
    ],
}
type MySidebarProps = {
    active: string
}
export function AppSidebar({ active, ...props }: React.ComponentProps<typeof Sidebar> & MySidebarProps) {
    data.navMain.forEach(nav => {
        nav.items.forEach(item => {
            if (item.slug === active) {
                item.is_active = true;
            }
        });
    });
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <div className="flex flex-col">
                    Authenticated as Admin
                    Logout
                </div>
            </SidebarHeader>
            <SidebarContent className="gap-0">
                {/* We create a collapsible SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
                    <Collapsible
                        key={item.title}
                        title={item.title}
                        defaultOpen
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel
                                asChild
                                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                            >
                                <CollapsibleTrigger>
                                    {item.title}{" "}
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {item.items.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton asChild isActive={item.is_active}>
                                                    <a href={item.url}>{item.title}</a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
