import StatisticsPage from "./StatisticsPage";

export function generateStaticParams() {
  return [{ seasonDiaryId: "_" }];
}

export default function Page() {
  return <StatisticsPage />;
}
