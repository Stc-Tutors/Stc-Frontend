// components/TeamSection.tsx
import TeamMember from './TeamMember';

export default function TeamSection() {
  const team = [
    {
        name: "Oladayo Ayodeji",
        role: "Project Manager",
        imageUrl: "/image/Mr Dayo.jpg",
        socialLinks: {
          linkedin: "https://www.linkedin.com/in/oladayostc/",
          instagram: "https://www.instagram.com/oladayostc/"
        }
      },

      {
        name: "Wuraola Shoaga",
        role: "Chief Technical Administrator",
        imageUrl: "/image/Wura.jpg",
        socialLinks: {
          linkedin: "https://www.linkedin.com/in/wuraola-shoaga-b35387263",
          twitter: "https://x.com/wu_ra_leeh?t=UvLy6SxRU3QM0XywoIihAA&s=09"
        }
      },
      
      {
        name: "Aanuoluwapo Liasu",
        role: "Lead Developer",
        imageUrl: "/team/anu.jpg",
        socialLinks: {
          linkedin: "https://www.linkedin.com/in/laoj",
          twitter: "https://x.com/SlimTallJosh"
        }
      },

      {
      name: "Ayomide Alaka",
      role: "Product Designer",
      imageUrl: "/team/ayomide.jpg",
      socialLinks: {
        linkedin: "https://www.linkedin.com/in/ayomide-alaka-36690527a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
        behance: "https://www.behance.net/ayomide21"
      }
    },

      {
        name: "Abiola Ayodeji",
        role: "Administrative Officer",
        imageUrl: "/team/abiola.jpg",
        socialLinks: {
          linkedin: "https://www.linkedin.com/in/adeniji-abiola-a20b61187"
        }
      },

      {
        name: "Tosin Sanni",
        role: "Human Resources Officer",
        imageUrl: "/image/Tosin.jpg",
        socialLinks: {
          linkedin: "https://www.linkedin.com/sanni-oluwatsoin-31821a278"
        }
      },

  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          We Are Your Bridge to Educational Excellence
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <TeamMember 
              key={index}
              name={member.name}
              role={member.role}
              imageUrl={member.imageUrl}
              socialLinks={member.socialLinks}
            />
          ))}
        </div>
      </div>
    </section>
  );
}