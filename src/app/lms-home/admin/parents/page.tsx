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

export default function AdminParentsPage() {
  const router = useRouter();
  const [parents, setParents] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async (searchTerm?: string) => {
    setIsLoading(true);
    const [res] = await GetUsersAction({ role: UserRole.PARENT, search: searchTerm });
    setParents(res?.data ?? []);
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
      <h1 className="text-2xl font-bold mb-6">Parents</h1>

      <form onSubmit={handleSearchSubmit} className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search parents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading parents...</p>
      ) : parents.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No parents found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={parent.avatarUrl || parent.profilePicture} alt={parent.firstName} />
                    <AvatarFallback>{parent.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  {parent.firstName} {parent.lastName}
                </TableCell>
                <TableCell className="text-sm text-gray-500">{parent.email || "Hidden"}</TableCell>
                <TableCell className="text-sm text-gray-500">{parent.phone || "—"}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {parent.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/lms-home/admin/parents/${parent.id}`)}>
                        Parent Profile
                      </DropdownMenuItem>
                      {parent.phone && (
                        <DropdownMenuItem asChild>
                          <a href={`tel:${parent.phone}`}>Call Parent</a>
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
