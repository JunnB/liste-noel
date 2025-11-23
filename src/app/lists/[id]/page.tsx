import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getListById } from "@/actions/lists";
import ListDetailWrapper from "./ListDetailWrapper";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const result = await getListById(id);

  if (!result.success) {
    redirect("/dashboard");
  }

  const list = result.data;

  return (
    <ListDetailWrapper
      list={list}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}
