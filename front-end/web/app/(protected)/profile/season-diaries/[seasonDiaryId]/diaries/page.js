import DiaryPage from "./DiaryPage";

export function generateStaticParams() {
  return [{ seasonDiaryId: "_" }];
}

export default function Page() {
  return <DiaryPage />;
}
