import EditSeasonDiary from "./EditSeasonDiary";

export function generateStaticParams() {
  return [{ seasonDiaryId: "_" }];
}

export default function Page() {
  return <EditSeasonDiary />;
}
