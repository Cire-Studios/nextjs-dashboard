"use client";
import { deleteCustomer, deleteInvoice } from "@/app/lib/actions";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import Spinner from "../spinner";

export function CreateCustomer() {
  return (
    <Link
      href="/dashboard/customers/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Customer</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateCustomer({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Link
      onClick={() => setIsLoading(true)}
      href={`/dashboard/customers/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      {isLoading ? <Spinner /> : <PencilIcon className="w-5" />}
    </Link>
  );
}

export function DeleteCustomer({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const deleteCustomerWithId = deleteCustomer.bind(null, id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await deleteCustomerWithId();
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <button
        disabled={isLoading}
        type="submit"
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <span className="sr-only">Delete</span>
        {isLoading ? <Spinner /> : <TrashIcon className="w-5" />}
      </button>
    </form>
  );
}
