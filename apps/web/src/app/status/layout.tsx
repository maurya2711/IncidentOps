import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Status — IncidentOps',
  description: 'Real-time status and uptime information for all IncidentOps services.',
  openGraph: {
    title: 'IncidentOps System Status',
    description: 'Check the current status of all IncidentOps services.',
    type: 'website',
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
