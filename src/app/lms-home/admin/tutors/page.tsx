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
import { TutorFilterBar, emptyTutorFilters, tutorFiltersToParams, type TutorFilterValues } from "@/components/tutor-filters/tutor-filter-bar";
import { User, UserRole } from "@/types/user";
import { ExportCsvButton } from "@/components/export-csv-button";
import { fetchAllPages, formatDate, type CsvColumn } from "@/lib/csv-export";

const EXPORT_COLUMNS: CsvColumn<User>[] = [
  { header: "First name", value: (u) => u.firstName },
  { header: "Last name", value: (u) => u.lastName },
  { header: "Email", value: (u) => u.email ?? "Hidden" },
  { header: "Phone", value: (u) => u.phone ?? "" },
  { header: "Country", value: (u) => u.country ?? "" },
  { header: "Status", value: (u) => u.status ?? "ACTIVE" },
  { header: "Email verified", value: (u) => (u.emailVerified === undefined ? "" : u.emailVerified ? "Yes" : "No") },
  { header: "Joined", value: (u) => formatDate(u.createdAt) },
  { header: "User ID", value: (u) => u.id },
];

export default function AdminTutorsPage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TutorFilterValues>(emptyTutorFilters());

  const load = async (searchTerm?: string, tutorFilters: TutorFilterValues = filters) => {
    setIsLoading(true);
    const [res] = await GetUsersAction({ role: UserRole.TUTOR, search: searchTerm, limit: 1000 }, tutorFiltersToParams({ ...tutorFilters, q: "" }));
    setTutors(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => {
      load(search, filters);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Every tutor matching the current search + filters, paged.
  const fetchExportRows = () =>
    fetchAllPages<User>((page, limit) =>
      GetUsersAction({ role: UserRole.TUTOR, search: search || undefined, page, limit }, tutorFiltersToParams({ ...filters, q: "" }))
    );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <h1 className="text-2xl font-bold">Tutors</h1>
        <ExportCsvButton filenameBase="tutors" columns={EXPORT_COLUMNS} fetchRows={fetchExportRows} />
      </div>

      <TutorFilterBar value={filters} onChange={setFilters} hideSearch />

      <form onSubmit={handleSearchSubmit} className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
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
              <TableHead>Country</TableHead>
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
                <TableCell className="text-sm text-gray-500">{tutor.country || "—"}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {tutor.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger aria-label="Row actions">
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
