import PublicProfilePage from "./PublicProfilePage";

export function generateStaticParams() {
  return [{ userId: "_" }];
}
export default function Page() {
  return <PublicProfilePage />;
}
