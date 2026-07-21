export function PageWrapper({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  return (
    <div className="container mx-auto pt-4">
      <h4 className="text-lg font-semibold mb-4">{pageTitle}</h4>
      {children}
    </div>
  );
}
