"use client";

import { useEffect, useState } from "react";
import TeamMember from "./TeamMember";
import { GetTeamMembersAction } from "@/server/content";
import { TeamMember as TeamMemberData } from "@/types/content";

const DEFAULT_TEAM: TeamMemberData[] = [
  {
    id: "default-1",
    name: "Oladayo Ayodeji",
    role: "Project Manager",
    imageUrl: "/image/Mr Dayo.jpg",
    linkedin: "https://www.linkedin.com/in/oladayostc/",
    instagram: "https://www.instagram.com/oladayostc/",
  },
  {
    id: "default-2",
    name: "Wuraola Shoaga",
    role: "Chief Technical Administrator",
    imageUrl: "/image/Wura.jpg",
    linkedin: "https://www.linkedin.com/in/wuraola-shoaga-b35387263",
    twitter: "https://x.com/wu_ra_leeh?t=UvLy6SxRU3QM0XywoIihAA&s=09",
  },
  {
    id: "default-3",
    name: "Aanuoluwapo Liasu",
    role: "Lead Developer",
    imageUrl: "/team/anu.jpg",
    linkedin: "https://www.linkedin.com/in/laoj",
    twitter: "https://x.com/SlimTallJosh",
  },
  {
    id: "default-4",
    name: "Ayomide Alaka",
    role: "Product Designer",
    imageUrl: "/team/ayomide.jpg",
    linkedin:
      "https://www.linkedin.com/in/ayomide-alaka-36690527a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    behance: "https://www.behance.net/ayomide21",
  },
  {
    id: "default-5",
    name: "Abiola Ayodeji",
    role: "Administrative Officer",
    imageUrl: "/team/abiola.jpg",
    linkedin: "https://www.linkedin.com/in/adeniji-abiola-a20b61187",
  },
  {
    id: "default-6",
    name: "Tosin Sanni",
    role: "Human Resources Officer",
    imageUrl: "/image/Tosin.jpg",
    linkedin: "https://www.linkedin.com/sanni-oluwatsoin-31821a278",
  },
];

export default function TeamSection() {
  const [team, setTeam] = useState<TeamMemberData[]>(DEFAULT_TEAM);

  useEffect(() => {
    GetTeamMembersAction().then(([res]) => {
      if (res?.data && res.data.length > 0) setTeam(res.data);
    });
  }, []);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">We Are Your Bridge to Educational Excellence</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {team.map((member) => (
            <TeamMember
              key={member.id}
              name={member.name}
              role={member.role}
              imageUrl={member.imageUrl}
              socialLinks={{
                linkedin: member.linkedin,
                twitter: member.twitter,
                instagram: member.instagram,
                behance: member.behance,
                github: member.github,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
