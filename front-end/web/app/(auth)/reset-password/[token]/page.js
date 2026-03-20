import ResetPasswordPage from "./ResetPasswordPage";

export function generateStaticParams() {
  return [{ token: "_" }];
}
export default function Page() {
  return <ResetPasswordPage />;
}
