import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Управление событием',
  robots: { index: false, follow: false },
}

// The admin panel is a full-page, self-contained screen with its own top bar,
// so this layout is a pass-through. No auth gate: in the no-registration model
// anyone can manage an event they created (via its host link); the «Войти»
// button inside the panel is an optional upgrade, not a wall.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
