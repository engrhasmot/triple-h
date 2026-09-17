import { redirect } from "next/navigation";

export default async function PaymentRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((item) => [k, item]) : v ? [[k, v]] : []
    )
  ).toString();

  redirect(queryString ? `/pay?${queryString}` : "/pay");
}
