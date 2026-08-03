import { redirect } from "next/navigation";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { ClientPortalShell } from "@/components/client-portal-shell";

export default async function PortalLayout({children}:{children:React.ReactNode}){const session=await getCurrentSession();if(!session)redirect("/iniciar-sesion");return <ClientPortalShell>{children}</ClientPortalShell>}
