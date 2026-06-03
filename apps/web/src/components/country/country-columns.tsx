"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Country } from "@repo/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

interface GetCountryColumnsOptions {
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => void;
}

export function getCountryColumns({
  onEdit,
  onDelete,
}: GetCountryColumnsOptions): ColumnDef<Country, unknown>[] {
  return [
    // ── Select ──────────────────────────────────────────────────────
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            (table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "mixed"
                : false) as boolean
          }
          onCheckedChange={(checked) =>
            table.toggleAllPageRowsSelected(checked === true)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },

    // ── Code ─────────────────────────────────────────────────────────
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold tracking-wide">
          {row.getValue<string>("code")}
        </span>
      ),
    },

    // ── Name (clickable → edit page) ─────────────────────────────────
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Country Name" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/countries/${row.original.id}/edit`}
          className="font-medium text-primary hover:underline underline-offset-2 transition-colors"
        >
          {row.getValue<string>("name")}
        </Link>
      ),
    },

    // ── Status ────────────────────────────────────────────────────────
    {
      accessorKey: "isActive",
      enableSorting: false,
      header: () => (
        <span className="text-sm font-medium">Status</span>
      ),
      cell: ({ row }) => {
        const active = row.getValue<boolean>("isActive");
        return (
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },

    // ── Created At ────────────────────────────────────────────────────
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {new Date(row.getValue<string>("createdAt")).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "short", day: "numeric" }
          )}
        </span>
      ),
    },

    // ── Actions ───────────────────────────────────────────────────────
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const country = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open row actions"
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => onEdit(country.id)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2 cursor-pointer"
                onClick={() => onDelete(country.id, country.name)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
