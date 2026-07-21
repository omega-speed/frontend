"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
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
} from "@/components/ui/sidebar";
import { APP_NAME } from "@/lib/config";

// Add your app's navigation here. Badge counts can be wired in via the
// `badges` map below (e.g. unread counts fetched from a provider).
const navMain = [
  {
    title: "Platform",
    items: [
      { title: "Home", url: "/home" },
      { title: "Profile", url: "/profile" },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const badges: Record<string, number> = {};

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link
          href="/home"
          className="flex h-16 items-center justify-center text-lg font-black uppercase tracking-[0.2em] text-foreground"
        >
          {APP_NAME}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <LayoutGroup id="sidebar-nav">
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                    const badge = badges[item.url];
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.url} className="relative overflow-hidden">
                            {isActive && (
                              <motion.div
                                layoutId="active-sidebar-pill"
                                className="absolute inset-0 bg-sidebar-accent ring-1 ring-primary/50"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10 flex-1">{item.title}</span>
                            {badge > 0 && (
                              <span className="relative z-10 ml-auto min-w-4 h-4 px-1 flex items-center justify-center bg-primary text-primary-foreground text-[0.5rem] font-bold leading-none">
                                {badge > 99 ? "99+" : badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </LayoutGroup>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
