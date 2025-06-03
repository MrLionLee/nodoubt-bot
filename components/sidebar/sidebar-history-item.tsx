
import type { Chat } from '@/lib/db/schema';
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction
} from '@/components/ui/sidebar';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    TrashIcon,
    MoreHorizontalIcon
} from '@/components/icons';
import Link from 'next/link';


const ChatItem = ({
    chat,
    isActive,
    onDelete,
}: {
    chat: Chat;
    isActive: boolean;
    onDelete: (chatId: string) => void;
}) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={`/chat/${chat.id}`}>
                    <span>{chat.title}</span>
                </Link>
            </SidebarMenuButton>

            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
                        showOnHover={!isActive}
                    >
                        <MoreHorizontalIcon />
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>


                <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                        onSelect={() => onDelete(chat.id)}
                    >
                        <TrashIcon />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};


export { ChatItem }