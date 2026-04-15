import { parseResponse, rpc } from "@auth-practices/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@auth-practices/ui/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@auth-practices/ui/components/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Check, XCircle } from "lucide-react";
import type { FC } from "react";
import { DeleteFeatureFlag } from "./delete-feature-flag";
import { UpdateFeatureFlag } from "./update-feature-flag";

interface PaginationMeta {
  page: number;
  pagesize: number;
  total: number;
  totalPages: number;
}
export const FeatureFlagsTable = () => {
  const { page = 1, pagesize = 10 } = useSearch({ from: "/" });

  const { data, isLoading } = useQuery({
    queryKey: ["feature-flag-list", page, pagesize],
    queryFn: async () =>
      await parseResponse(
        rpc.admin["get-feature-flags"].$get({
          query: { page: String(page), pagesize: String(pagesize) },
        }),
      ),
    placeholderData: keepPreviousData,
  });

  const featureFlagList = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="rounded-md border  shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-100">Feature Key</TableHead>
              <TableHead className="w-45">Is Enabled</TableHead>
              <TableHead className="w-45">Created At</TableHead>
              <TableHead className="w-45">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Loading organisations...
                </TableCell>
              </TableRow>
            ) : featureFlagList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  No organisations found
                </TableCell>
              </TableRow>
            ) : (
              featureFlagList.map((flag) => (
                <TableRow key={flag.featureKey} className="text-muted-foreground">
                  <TableCell className="font-medium text-foreground">{flag.featureKey}</TableCell>
                  <TableCell>
                    {flag.isEnabled ? <Check size={15} /> : <XCircle size={15} />}
                  </TableCell>
                  <TableCell>{new Date(flag.createdAt!).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <UpdateFeatureFlag flag={flag} />
                      <DeleteFeatureFlag id={flag.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <div className="flex items-center justify-between px-4">
          <div className="text-xs text-muted-foreground">
            Showing page <span className="font-medium">{meta.page}</span> of{" "}
            <span className="font-medium">{meta.totalPages}</span> ({meta.total} total)
          </div>

          <OrganisationPagination meta={meta} />
        </div>
      )}
    </div>
  );
};

const OrganisationPagination: FC<{ meta?: PaginationMeta }> = ({ meta }) => {
  const navigate = useNavigate({ from: "/" });
  const { page = 1, pagesize = 10 } = useSearch({ from: "/" });

  if (!meta) return null;

  const { totalPages } = meta;

  const goToPage = (p: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: p,
        pagesize,
      }),
    });
  };

  return (
    <Pagination className="min-w-0 flex-1 justify-end">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) goToPage(page - 1);
            }}
          />
        </PaginationItem>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, page - 3), page + 2)
          .map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                className={`cursor-pointer ${
                  p === page ? "bg-primary  hover:bg-primary" : "hover:bg-muted"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(p);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) goToPage(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
