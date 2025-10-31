export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout já está sendo aplicado no root layout (AppShell)
  return <>{children}</>
}
