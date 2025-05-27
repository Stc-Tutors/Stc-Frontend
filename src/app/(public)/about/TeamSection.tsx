// components/TeamSection.tsx
import TeamMember from './TeamMember';

export default function TeamSection() {
  const team = [
    {
      name: "Ajayi Araoluwanimi",
      role: "Product Designer",
      imageUrl: "/team/ajayi.jpg",
      socialLinks: {
        linkedin: "https://linkedin.com/in/username",
        twitter: "https://twitter.com/username"
      }
    },

    {
        name: "Ajayi Araoluwanimi",
        role: "Product Designer",
        imageUrl: "/team/ajayi.jpg",
        socialLinks: {
          linkedin: "https://linkedin.com/in/username",
          twitter: "https://twitter.com/username"
        }
      },

      {
        name: "Ajayi Araoluwanimi",
        role: "Product Designer",
        imageUrl: "/team/ajayi.jpg",
        socialLinks: {
          linkedin: "https://linkedin.com/in/username",
          twitter: "https://twitter.com/username"
        }
      },

      {
        name: "Ajayi Araoluwanimi",
        role: "Product Designer",
        imageUrl: "/team/ajayi.jpg",
        socialLinks: {
          linkedin: "https://linkedin.com/in/username",
          twitter: "https://twitter.com/username"
        }
      },

      {
        name: "Ajayi Araoluwanimi",
        role: "Product Designer",
        imageUrl: "/team/ajayi.jpg",
        socialLinks: {
          linkedin: "https://linkedin.com/in/username",
          twitter: "https://twitter.com/username"
        }
      },

      {
        name: "Ajayi Araoluwanimi",
        role: "Product Designer",
        imageUrl: "/team/ajayi.jpg",
        socialLinks: {
          linkedin: "https://linkedin.com/in/username",
          twitter: "https://twitter.com/username"
        }
      },

    // Add other team members...
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