"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export type InvoiceState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
  };
  message?: string | null;
};

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce.number().gt(0, {
    message: "Please enter an amount greater than $0.",
  }), // coerce converts to number while also validating
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z
    .string({
      invalid_type_error: "Please enter a name.",
    })
    .min(1, {
      message: "Please enter a name.",
    }),
  email: z
    .string({
      invalid_type_error: "Please enter an email.",
    })
    .email({
      message: "Please enter a valid email.",
    }),
  image_url: z
    .string({
      invalid_type_error: "Please upload an image.",
    })
    .min(1, {
      message: "Please upload an image.",
    }),
});

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    console.log("Deleting invoice", id);
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.warn("Database Error:", error);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

const CreateCustomer = CustomerFormSchema.omit({ id: true });

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData
) {
  const file = formData.get("image");
  let image_url = "";
  if (file instanceof File) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${uuid()}-${file.name.toLowerCase()}`;
    const filepath = path.join(process.cwd(), "public", "customers", filename);

    try {
      await writeFile(filepath, buffer);
      image_url = `/customers/${filename}`;
    } catch (err) {
      return { message: "Failed to save image to server." };
    }
  }

  const validatedFields = CreateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    image_url,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Customer.",
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await sql`INSERT INTO customers (name, email, image_url) VALUES (${name}, ${email}, ${image_url})`;
  } catch (error) {
    console.warn("Error creating customer", error);
    return {
      message: "Database Error: Failed to Create Customer.",
    };
  }
  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

const UpdateCustomer = CustomerFormSchema.omit({ id: true });

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData
) {
  const file = formData.get("image");
  let image_url = null;
  let old_image_url = null;

  try {
    const result = await sql`SELECT image_url FROM customers WHERE id = ${id}`;
    old_image_url = result[0]?.image_url;
  } catch (error) {
    console.warn("Failed to fetch current image URL:", error);
    return { message: "Failed to fetch current image URL." };
  }

  if (file instanceof File && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${uuid()}-${file.name.toLowerCase()}`;
    const filepath = path.join(process.cwd(), "public", "customers", filename);

    try {
      await writeFile(filepath, buffer);
      image_url = `/customers/${filename}`;
    } catch (err) {
      return { message: "Failed to save image to server." };
    }
  }

  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    image_url: image_url || old_image_url,
  });

  console.log("Validated fields", validatedFields, validatedFields.success);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Customer.",
    };
  }

  const { name, email } = validatedFields.data;

  console.log(
    "Validated fields",
    validatedFields.data,
    image_url,
    old_image_url
  );

  try {
    await sql`UPDATE customers SET name = ${name}, email = ${email}, image_url = ${
      image_url || old_image_url
    } WHERE id = ${id}`;
  } catch (error) {
    // If database update fails, remove the newly uploaded image
    if (image_url) {
      const newFilePath = path.join(process.cwd(), "public", image_url);
      await unlink(newFilePath);
      image_url = null; // unset so we don't delete the previous image below.
    }
    return {
      message: "Database Error: Failed to Update Customer.",
    };
  }

  // Remove the old image file if a new one was uploaded
  if (old_image_url && image_url) {
    const oldFilePath = path.join(process.cwd(), "public", old_image_url);
    try {
      await unlink(oldFilePath);
    } catch (error) {
      console.warn("Failed to remove old image:", error);
    }
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
  } catch (error) {
    console.warn("Database Error:", error);
  }

  revalidatePath("/dashboard/customers");
}
