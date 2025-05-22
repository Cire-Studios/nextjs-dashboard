import { useState } from "react";

export function useSubmitHandler(asyncFunction: (data: FormData) => void) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    try {
      await asyncFunction(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit, isLoading };
}
