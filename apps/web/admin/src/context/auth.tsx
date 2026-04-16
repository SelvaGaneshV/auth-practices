import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, type FC, type ReactNode } from "react";
import { rpc, parseResponse } from "@auth-practices/rpc";

export interface AuthState {
  isAuthPending: boolean;
  auth?: boolean;
  ensureAuth: () => Promise<
    | {
        auth: boolean;
      }
    | undefined
  >;
}

const AuthContext = createContext<AuthState | null>(null);

const authOptions = queryOptions({
  queryKey: ["auth"],
  queryFn: async () => await parseResponse(rpc.admin.introspect.$get()),
  throwOnError: false,
  staleTime: 1000 * 60 * 60,
  retry: false,
});
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { isPending, data } = useQuery(authOptions);

  const ensureAuth = async () => {
    try {
      return await queryClient.ensureQueryData(authOptions);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthPending: isPending, auth: data?.auth, ensureAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Must be used within Auth Provider");
  return context;
};
