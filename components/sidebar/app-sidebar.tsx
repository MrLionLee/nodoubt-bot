'use client';
import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
// import type { User } from 'next-auth';
import { SidebarHistory } from '@/components/sidebar/sidebar-history';


import Link from 'next/link';
import {Tooltip} from 'antd'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    useSidebar,
  } from '@/components/ui/sidebar';


export function AppSidebar({ user }: { user: User | undefined }) {
    const router = useRouter();
  
    return (
      <Sidebar className="group-data-[side=left]:border-r-0">
        <SidebarHeader>
          <SidebarMenu>
            <div className="flex flex-row justify-between items-center">
              <Link
                href="/"
              
                className="flex flex-row gap-3 items-center"
              >
                <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                  Chatbot
                </span>
              </Link>
              <Tooltip>
                {/* <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit"
                    onClick={() => {
                      router.push('/');
                      router.refresh();
                    }}
                  >
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">New Chat</TooltipContent> */}
                头部右侧按钮
              </Tooltip>
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarHistory user={user} />
        </SidebarContent>
        <SidebarFooter>
            {/* {user && <SidebarUserNav user={user} />} */}
            footer
        </SidebarFooter>
      </Sidebar>
    );
}


// 应用的 sidebar 内容