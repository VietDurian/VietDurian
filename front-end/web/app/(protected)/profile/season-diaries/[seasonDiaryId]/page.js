import SeasonDiaryDetailPage from "./SeasonDiaryDetailPage";

export function generateStaticParams() {
  return [{ seasonDiaryId: "_" }];
}

export default function Page() {
  return <SeasonDiaryDetailPage />;
}
