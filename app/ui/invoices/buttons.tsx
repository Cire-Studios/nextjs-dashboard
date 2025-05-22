"use client";

import { deleteInvoice } from "@/app/lib/actions";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import Spinner from "../spinner";

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Link
      onClick={() => setIsLoading(true)}
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      {isLoading ? <Spinner /> : <PencilIcon className="w-5" />}
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Deleting invoice", id);
    setIsLoading(true);
    try {
      console.log("Deleting invoice", id);
      await deleteInvoiceWithId();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        {isLoading ? <Spinner /> : <TrashIcon className="w-5" />}
      </button>
    </form>
  );
}
