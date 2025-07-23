import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

export interface Password {
  _id: string;
  name: string;
  isActive: boolean;
}

export const useGetAllPasswords = () => {
  const businessId = useParams().businessId as string;

  if (businessId === "") {
    return;
  }

  const fetchAllPasswords = async () => {
    const response = await apiRpc.password_manager.fetch_without_password.$get({
      query: {
        businessId: businessId,
      },
    });
    const res = await response.json();
    const passwords = res?.data as Password[];
    return passwords;
  };

  const { isLoading, data: passwords } = useQuery({
    queryKey: ["getAllPasswords", businessId],
    queryFn: fetchAllPasswords,
    enabled: !!businessId,
  });

  return {
    isLoading,
    passwords,
  };
};

export type PasswordName = "DISCOUNT" | "DELETE_KOT" | "SERVICE_CHARGE";

export const useIsPasswordActive = (passwordName: PasswordName) => {
  const { isLoading, passwords } = useGetAllPasswords();
  const isActive = useMemo(() => {
    if (!passwords) return false;
    return passwords.some((pw) => pw.name === passwordName && pw.isActive);
  }, [passwords, passwordName]);

  return { isLoading, isActive };
};
