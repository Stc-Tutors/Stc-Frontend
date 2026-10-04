"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetUsersAction } from "@/server/admin";
import { User, UserRole } from "@/types/user";

export default function AdminTutorsPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async (searchTerm?: string) => {
    setIsLoading(true);
    const [res] = await GetUsersAction({ role: UserRole.TUTOR, search: searchTerm });
    setTutors(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">Tutors</h1>

      <form onSubmit={handleSearchSubmit} className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search tutors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading tutors...</p>
      ) : tutors.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No tutors found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutors.map((tutor) => (
              <TableRow key={tutor.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={tutor.avatarUrl || tutor.profilePicture} alt={tutor.firstName} />
                    <AvatarFallback>{tutor.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  {tutor.firstName} {tutor.lastName}
                </TableCell>
                <TableCell className="text-sm text-gray-500">{tutor.email || "Hidden"}</TableCell>
                <TableCell className="text-sm text-gray-500">{tutor.phone || "—"}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {tutor.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/lms-home/admin/users/${tutor.id}`)}>
                        Tutor Profile
                      </DropdownMenuItem>
                      {tutor.phone && (
                        <DropdownMenuItem asChild>
                          <a href={`tel:${tutor.phone}`}>Call Tutor</a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => router.push("/lms-home/admin/messages")}>
                        Send Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
