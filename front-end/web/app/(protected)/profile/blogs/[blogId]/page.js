import BlogDetailPage from "./BlogDetailPage";

export function generateStaticParams() {
    return [{ blogId: "_" }];
}
export default function Page() {
    return <BlogDetailPage />;
}
