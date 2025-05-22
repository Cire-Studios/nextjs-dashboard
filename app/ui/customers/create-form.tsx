"use client";

import Link from "next/link";
import { AtSymbolIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { SubmitButton } from "@/app/ui/button";
import { createCustomer, CustomerState } from "@/app/lib/actions";
import { useActionState, useState } from "react";
import Image from "next/image";

export default function Form() {
  const [newImageSelected, setNewImageSelected] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(
    "/customers/default.png"
  );
  const initialState: CustomerState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCustomer, initialState);

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
            <input
              type="file"
              name="image"
              accept="image/*"
              aria-label="Upload customer image"
              className="hidden"
              style={{ display: "none" }}
              id="create-image-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setNewImageSelected(true);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setImagePreviewSrc(event.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label
              htmlFor="create-image-upload"
              className="cursor-pointer bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 rounded-md hover:bg-blue-100"
            >
              Choose Image
            </label>
          </div>
          <div className="relative flex items-center h-[132px] w-[132px]">
            <Image
              id="create-image-preview"
              src={imagePreviewSrc}
              alt="Image preview"
              className="mt-2 rounded-full h-[132px] w-[132px]"
              style={{ display: newImageSelected ? "block" : "none" }}
              width={132}
              height={132}
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
        <SubmitButton spinnerClassName="text-white">
          Create Customer
        </SubmitButton>
      </div>
    </form>
  );
}
