'use client';

import { usePathname, useRouter } from 'next/navigation';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, ExternalLink, Search } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { notificationsApi } from '@/lib/api/settings';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();

  const paths = pathname.split('/').filter(Boolean);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.findAll(1, 10),
    refetchInterval: 30000,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = notifData?.data ?? [];
  const unreadCount = notifData?.meta?.unreadCount ?? 0;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger className="-ml-1" />
      <div className="mr-2 h-4 w-px bg-border" />

      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const title = path.charAt(0).toUpperCase() + path.slice(1);
            return (
              <div key={path} className="flex items-center gap-1.5 sm:gap-2.5">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={`/${paths.slice(0, index + 1).join('/')}`}>
                      {title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="relative w-full max-w-sm hidden sm:flex items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search... (⌘K)"
            className="w-full rounded-lg bg-background pl-8 sm:w-[280px]"
          />
        </div>

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs text-primary hover:underline font-normal"
                >
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <>
                {notifications.slice(0, 5).map((n: any) => (
                  <DropdownMenuItem
                    key={n._id}
                    className={cn(
                      'flex flex-col items-start gap-0.5 py-3 cursor-pointer',
                      !n.read && 'bg-primary/3',
                    )}
                    onClick={() => {
                      if (n.link) router.push(n.link);
                      notificationsApi
                        .markAsRead(n._id)
                        .then(() => qc.invalidateQueries({ queryKey: ['notifications'] }));
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      <p
                        className={cn(
                          'text-sm leading-snug flex-1',
                          !n.read ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {n.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-3.5 line-clamp-1">{n.body}</p>
                    <p className="text-xs text-muted-foreground/60 pl-3.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-primary text-sm"
                  onClick={() => router.push('/dashboard/settings/notifications')}
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" /> View all notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/status')}
              className="text-muted-foreground"
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Status Page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:text-destructive"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
