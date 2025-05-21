
"use client"
import { forwardRef, createContext, useContext, useMemo, useState, useCallback } from 'react'
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { VariantProps, cva } from 'class-variance-authority';
const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContext = {
    state: 'expanded' | 'collapsed';
    open: boolean;
    setOpen: (open: boolean) => void;
    toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContext | null>(null);

function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }

    return context;
}


const SidebarProvider = forwardRef<HTMLDivElement, React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}>(({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
}, ref) => {
    const [_open, _setOpen] = useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === 'function' ? value(open) : value;
            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                _setOpen(openState);
            }

            // 将 sidebar 的状态存储到 cookie 中，有效期为 7 天
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        },
        [setOpenProp, open],
    );

    const state = open ? 'expanded' : 'collapsed';

    // Helper to toggle the sidebar.
    const toggleSidebar = useCallback(() => {
        return setOpen((open) => !open)
    }, [setOpen]);

    const contextValue = useMemo<SidebarContext>(
        () => ({
            state,
            open,
            setOpen,
            toggleSidebar,
        }),
        [
            state,
            open,
            setOpen,
            toggleSidebar,
        ],
    );
    return (
        <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delayDuration={0}>
                <div
                    style={
                        {
                            '--sidebar-width': SIDEBAR_WIDTH,
                            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn(
                        'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
                        className,
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            </TooltipProvider>

        </SidebarContext.Provider>
    )
})



const SidebarInset = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'main'>
>(({ className, ...props }, ref) => {
    return (
        <main
            ref={ref}
            className={cn(
                'relative flex min-h-svh flex-1 flex-col bg-background',
                'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
                className,
            )}
            {...props}
        />
    );
});

const Sidebar = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        side?: 'left' | 'right';
        collapsible?: 'offcanvas' | 'icon' | 'none';
    }
>(({ side = 'left',
    collapsible = 'offcanvas',
    className,
    children, ...props }, ref) => {
    const { state } = useSidebar();

    if (collapsible === 'none') {
        return (
            <div
                className={cn(
                    'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
                    className,
                )}
                ref={ref}
                {...props}
            >
                {children}
            </div>
        );
    }
    return (
        <div
            ref={ref}
            className="group peer hidden md:block text-sidebar-foreground"
            data-state={state}
            data-collapsible={state === 'collapsed' ? collapsible : ''}
            data-side={side}
        >
            {/* This is what handles the sidebar gap on desktop */}
            <div
                className={cn(
                    'duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear',
                    'group-data-[collapsible=offcanvas]:w-0',
                    'group-data-[side=right]:rotate-180',
                )}
            />
            <div
                className={cn(
                    'duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex',
                    side === 'left'
                        ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                        : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                    className,
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
                >
                    {children}
                </div>
            </div>
        </div>
    );
})
Sidebar.displayName = 'Sidebar';

const SidebarHeader = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="header"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="footer"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarContent = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="content"
            className={cn(
                'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
                className,
            )}
            {...props}
        />
    );
});
SidebarContent.displayName = 'SidebarContent';

const SidebarMenu = forwardRef<
    HTMLUListElement,
    React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-sidebar="menu"
        className={cn('flex w-full min-w-0 flex-col gap-1', className)}
        {...props}
    />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarGroup = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="group"
            className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
            {...props}
        />
    );
});
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';

    return (
        <Comp
            ref={ref}
            data-sidebar="group-label"
            className={cn(
                'duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
                className,
            )}
            {...props}
        />
    );
});
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupContent = forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group-content"
        className={cn('w-full text-sm', className)}
        {...props}
    />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';


const SidebarMenuAction = forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        showOnHover?: boolean;
    }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-action"
            className={cn(
                'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
                // Increases the hit area of the button on mobile.
                'after:absolute after:-inset-2 after:md:hidden',
                'peer-data-[size=sm]/menu-button:top-1',
                'peer-data-[size=default]/menu-button:top-1.5',
                'peer-data-[size=lg]/menu-button:top-2.5',
                'group-data-[collapsible=icon]:hidden',
                showOnHover &&
                'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuAction.displayName = 'SidebarMenuAction';

const sidebarMenuButtonVariants = cva(
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                outline:
                    'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
            },
            size: {
                default: 'h-8 text-sm',
                sm: 'h-7 text-xs',
                lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

// 菜单右侧按钮
const SidebarMenuButton = forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        isActive?: boolean;
        tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    } & VariantProps<typeof sidebarMenuButtonVariants>
>(
    (
        {
            asChild = false,
            isActive = false,
            variant = 'default',
            size = 'default',
            tooltip,
            className,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button';
        const { state } = useSidebar();

        const button = (
            <Comp
                ref={ref}
                data-sidebar="menu-button"
                data-size={size}
                data-active={isActive}
                className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
                {...props}
            />
        );

        if (!tooltip) {
            return button;
        }

        if (typeof tooltip === 'string') {
            tooltip = {
                children: tooltip,
            };
        }

        return (
            <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent
                    side="right"
                    align="center"
                    hidden={state !== 'collapsed'}
                    {...tooltip}
                />
            </Tooltip>
        );
    },
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuItem = forwardRef<
    HTMLLIElement,
    React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        data-sidebar="menu-item"
        className={cn('group/menu-item relative', className)}
        {...props}
    />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

export {
    SidebarProvider,
    SidebarInset,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
    SidebarMenu,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem
}