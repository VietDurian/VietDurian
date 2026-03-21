import ProductDetailPage from "./ProductDetailPage";

export function generateStaticParams() {
    return [{ blogId: "_" }];
}
export default function Page() {
    return <ProductDetailPage />;
}
