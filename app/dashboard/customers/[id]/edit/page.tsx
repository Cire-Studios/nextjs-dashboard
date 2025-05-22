import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchCustomerById } from "@/app/lib/data";
import { Metadata } from "next";
import Form from "@/app/ui/customers/edit-form";

export const metadata: Metadata = {
  title: "Edit Customer",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const customer = await fetchCustomerById(id);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Customers", href: "/dashboard/customers" },
          {
            label: "Edit Customer",
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}
