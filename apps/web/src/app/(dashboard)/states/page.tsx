"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SortingState, RowSelectionState } from "@tanstack/react-table";
import type { State, PaginationMeta } from "@repo/shared";
import { StateService } from "@/services/state.service";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { getStateColumns } from "@/components/state/state-columns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/use-debounce";

export default function StatesPage() {
  const router = useRouter();

  // ── Filter / pagination state ──────────────────────────────────────
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue, 500);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // ── Data state ────────────────────────────────────────────────────
  const [data, setData] = useState<State[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Delete state ──────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────
  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((k) => rowSelection[k]).map(Number),
    [rowSelection]
  );

  const sortBy = sorting[0]?.id ?? "name";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await StateService.search({
        query: debouncedQuery || undefined,
        isActive: statusFilter,
        page,
        pageSize,
        sortBy,
        sortOrder,
      });
      if (res.success && res.data) {
        setData(res.data);
        setMeta(res.meta ?? null);
      }
    } catch {
      toast.error("Failed to load states. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, statusFilter, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setInputValue(value);
    setPage(1);
    setRowSelection({});
  };

  const handleStatusChange = (value: "all" | "active" | "inactive") => {
    setStatusFilter(value);
    setPage(1);
    setRowSelection({});
  };

  const handleSortingChange = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    setSorting(next);
    setPage(1);
  };

  // ── Single delete ────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await StateService.delete(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      setRowSelection({});
      fetchData();
    } catch {
      toast.error("Failed to delete state.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Bulk delete ──────────────────────────────────────────────────
  const handleConfirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await StateService.bulkDelete(selectedIds);
      toast.success(`${selectedIds.length} states deleted.`);
      setIsBulkConfirmOpen(false);
      setRowSelection({});
      fetchData();
    } catch {
      toast.error("Failed to delete selected states.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Column definitions (memoised) ────────────────────────────────
  const columns = useMemo(
    () =>
      getStateColumns({
        onEdit: (id) => router.push(`/states/${id}/edit`),
        onDelete: (id, name) => setDeleteTarget({ id, name }),
      }),
    [router]
  );

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <DataTableToolbar
          searchValue={inputValue}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusChange}
          selectedCount={selectedIds.length}
          onBulkDelete={() => setIsBulkConfirmOpen(true)}
          onAdd={() => router.push("/states/new")}
          addLabel="Add State"
          searchPlaceholder="Search states…"
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          meta={meta}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          getRowId={(row) => String(row.id)}
          selectedCount={selectedIds.length}
          emptyMessage="No states found. Add your first state to get started."
        />
      </div>

      {/* Single delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete state?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> will be permanently deleted.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={isBulkConfirmOpen} onOpenChange={setIsBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} states?</AlertDialogTitle>
            <AlertDialogDescription>
              All {selectedIds.length} selected states will be permanently
              deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : `Delete ${selectedIds.length}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
