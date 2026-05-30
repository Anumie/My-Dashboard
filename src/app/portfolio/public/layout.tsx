export default function PublicPortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No sidebar for public-facing pages
  return <div className="min-h-screen bg-cream">{children}</div>;
}
