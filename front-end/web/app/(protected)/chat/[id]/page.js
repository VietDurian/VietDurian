import ChatByIdPage from "./ChatByIdPage";

export function generateStaticParams() {
  return [{ id: "_" }];
}
export default function Page() {
  return <ChatByIdPage />;
}
