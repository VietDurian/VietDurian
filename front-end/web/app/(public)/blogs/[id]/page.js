import BlogDetailPage from "./BlogDetailPage";

export function generateStaticParams() {
  return [{ id: "_" }];
}
export default function Page() {
  return <BlogDetailPage />;
}
