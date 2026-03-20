import ProductDetailPage from "./ProductDetailPage";

export function generateStaticParams() {
  return [{ productId: "_" }];
}
export default function Page() {
  return <ProductDetailPage />;
}
