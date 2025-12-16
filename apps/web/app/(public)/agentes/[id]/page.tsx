import { AgentListingsGrid } from "@/components/agent-profile/agent-listings-grid";
import { AgentProfileHeader } from "@/components/agent-profile/agent-profile-header";
import { db, propertyRepository } from "@repo/database";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

interface AgentProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  props: AgentProfilePageProps
): Promise<Metadata> {
  const params = await props.params;
  const agent = await db.user.findUnique({
    where: { id: params.id },
    select: { name: true, role: true },
  });

  if (!agent || (agent.role !== "AGENT" && agent.role !== "ADMIN")) {
    return {
      title: "Agente no encontrado | InmoApp",
    };
  }

  return {
    title: `${agent.name || "Agente Inmobiliario"} | InmoApp`,
    description: `Conoce las propiedades y contacta a ${agent.name || "este agente"} en InmoApp.`,
  };
}

export default async function AgentProfilePage(props: AgentProfilePageProps) {
  const params = await props.params;
  
  // 1. Fetch Agent
  const agent = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      licenseId: true,
      website: true,
      brandColor: true,
      logoUrl: true,
      role: true,
      createdAt: true,
      subscriptionTier: true,
      _count: {
        select: { properties: true },
      },
    },
  });

  // 2. Validate Agent
  if (!agent) {
    notFound();
  }

  // Only allow viewing profiles of actual agents (or admins)
  if (agent.role !== "AGENT" && agent.role !== "ADMIN") {
    notFound();
  }

  // 3. Fetch Agent's Active Properties
  const { properties } = await propertyRepository.list({
    filters: {
      agentId: agent.id,
      status: "AVAILABLE", // Only show active properties
    },
    take: 20, // Initial limit
  });

  return (
    <div className="min-h-screen bg-oslo-gray-50/50 dark:bg-oslo-gray-950/50">
      <AgentProfileHeader agent={agent} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AgentListingsGrid properties={properties} />
      </div>
    </div>
  );
}
