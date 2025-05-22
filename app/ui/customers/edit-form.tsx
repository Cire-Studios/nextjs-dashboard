"use client";

import Link from "next/link";
import { AtSymbolIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Button, SubmitButton } from "@/app/ui/button";
import { CustomerState, updateCustomer } from "@/app/lib/actions";
import { useActionState, useState } from "react";
import { CustomerField } from "@/app/lib/definitions";
import Image from "next/image";

export default function Form({ customer }: { customer: CustomerField }) {
  const initialState: CustomerState = { message: null, errors: {} };
  const [newImageSelected, setNewImageSelected] = useState(false);
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, formAction] = useActionState(
    updateCustomerWithId,
    initialState
  );

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Customer Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter customer name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={customer.name}
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div id="customer-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter customer email"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue={customer.email}
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {state.errors?.email &&
            state.errors.email.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>

        {/* Invoice Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Customer Image
          </label>
          <div className="flex items-center">
            <Image
              src={customer.image_url}
              alt="Original image"
              width={64}
              height={64}
              className="mr-4 rounded-full h-[64px] w-[64px]"
            />
            <span className="mx-2 text-gray-500">→</span>
            <div className="relative flex flex-col items-center">
              <img
                id="image-preview"
                alt="New image preview"
                className="rounded-full h-[64px] w-[64px] mb-2"
                style={{ display: newImageSelected ? "block" : "none" }}
              />
              <button
                id="remove-image"
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                style={{ display: newImageSelected ? "block" : "none" }}
                onClick={() => {
                  setNewImageSelected(false);
                }}
              >
                ×
              </button>

              <input
                type="file"
                name="image"
                accept="image/*"
                aria-label="Upload customer image"
                className="hidden"
                style={{ display: "none" }}
                id="image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewImageSelected(true);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const imgElement = document.getElementById(
                        "image-preview"
                      ) as HTMLImageElement;
                      if (imgElement) {
                        imgElement.src = event.target?.result as string;
                        imgElement.style.display = "block";
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 rounded-md hover:bg-blue-100"
                style={{ display: newImageSelected ? "none" : "block" }}
              >
                Choose Image
              </label>
            </div>
          </div>
        </div>
        <div id="image_url-error" aria-live="polite" aria-atomic="true">
          {state.errors?.image_url &&
            state.errors.image_url.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <SubmitButton spinnerClassName="text-white">Edit Customer</SubmitButton>
      </div>
    </form>
  );
}
