import { browseSchools } from "./service";
import { SchoolsBrowser } from "./_components/schools-browser";

export const metadata = { title: "Schools — Qoollege" };

// Server component: reads the filters from the URL, fetches one page of the
// catalog, and hands it to the client browser (which edits the URL to refilter).
export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    search: sp.q || undefined,
    state: sp.state || undefined,
    setting: sp.setting || undefined,
    size: sp.size || undefined,
    sort: sp.sort || undefined,
    page: Math.max(1, Number(sp.page) || 1),
  };
  const result = await browseSchools(filters);
  return <SchoolsBrowser result={result} filters={filters} />;
}
