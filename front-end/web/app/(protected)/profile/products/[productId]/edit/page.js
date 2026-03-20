import EditProduct from "./EditProduct";

export function generateStaticParams() {
  return [{ productId: "_" }];
}
export default function Page() {
  return <EditProduct />;
}
