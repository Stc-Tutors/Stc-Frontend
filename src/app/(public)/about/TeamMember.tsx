// components/TeamMember.tsx
import Image from 'next/image';
import { FaLinkedin, FaTwitter, FaGithub, FaBehance } from 'react-icons/fa';

interface TeamMemberProps {
  name: string;
  role: string;
  imageUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    behance?: string;
  };
}

export default function TeamMember({ 
  name, 
  role, 
  imageUrl = '/team/default-avatar.jpg',
  socialLinks = {}
}: TeamMemberProps) {
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      {/* Avatar with hover effect */}
      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white group-hover:border-indigo-100 transition-colors duration-300 relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Member Info */}
      <h3 className="text-lg font-bold mb-1">{name}</h3>
      <p className="text-indigo-600 mb-4">{role}</p>

      {/* Social Links - Appear on hover */}
      <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {socialLinks.linkedin && (
          <a 
            href={socialLinks.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-600 transition-colors"
            aria-label={`${name}'s LinkedIn`}
          >
            <FaLinkedin size={18} />
          </a>
        )}
        {socialLinks.twitter && (
          <a 
            href={socialLinks.twitter} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
            aria-label={`${name}'s Twitter`}
          >
            <FaTwitter size={18} />
          </a>
        )}
        {socialLinks.github && (
          <a 
            href={socialLinks.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={`${name}'s GitHub`}
          >
            <FaGithub size={18} />
          </a>
        )}
        {socialLinks.behance && (
          <a 
            href={socialLinks.behance} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={`${name}'s Behance`}
          >
            <FaBehance size={18} />
          </a>
        )}
      </div>
    </div>
  );
}