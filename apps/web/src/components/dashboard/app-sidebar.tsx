import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  AlertTriangle,
  BarChart2,
  Bell,
  HelpCircle,
  LayoutDashboard,
  PhoneCall,
  Server,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

import { UserRole } from '@incidentops/shared';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/providers/auth-provider';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useAuth();

  const userRole = user?.role as UserRole | undefined;
  const canAccessAdmin =
    userRole === UserRole.SUPER_ADMIN ||
    userRole === UserRole.ADMIN ||
    userRole === UserRole.MANAGER;

  const navGroups = [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Incidents',
          url: '/dashboard/incidents',
          icon: AlertTriangle,
        },
        {
          title: 'Services',
          url: '/dashboard/services',
          icon: Server,
        },
        {
          title: 'Teams',
          url: '/dashboard/teams',
          icon: Users,
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          title: 'Analytics',
          url: '/dashboard/analytics',
          icon: BarChart2,
        },
        {
          title: 'On-Call',
          url: '/dashboard/on-call',
          icon: PhoneCall,
        },
      ],
    },
    ...(canAccessAdmin
      ? [
          {
            title: 'Administration',
            items: [
              {
                title: 'User Management',
                url: '/dashboard/admin/users',
                icon: Shield,
              },
            ],
          },
        ]
      : []),
    {
      title: 'Settings',
      items: [
        {
          title: 'Notifications',
          url: '/dashboard/settings/notifications',
          icon: Bell,
        },
        {
          title: 'Settings',
          url: '/dashboard/settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center px-4 font-bold text-lg text-primary">
          IncidentOps
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
