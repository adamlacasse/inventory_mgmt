import { redirect } from "next/navigation";
import { requireSession } from "../../../src/server/auth";
import { listUsers } from "../../../src/server/users";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const actor = await requireSession().catch(() => {
    redirect("/login");
  });
  if (actor.role !== "admin") {
    redirect("/");
  }
  const users = await listUsers();
  return <AdminUsersClient initialUsers={users} actorId={actor.id} />;
}
