import { parseResponse, rpc, type DetailedError } from "@auth-practices/rpc";
import { Button } from "@auth-practices/ui/components/button";
import { Spinner } from "@auth-practices/ui/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { type FC } from "react";
import { toast } from "sonner";

export const DeleteFeatureFlag: FC<{ id: string }> = ({ id }) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      await parseResponse(rpc.admin["delete-feature-flag"][":id"].$delete({ param: { id } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flag-list"] });
    },
    onError: (e: DetailedError) => {
      if (typeof e.detail?.data?.message === "string") {
        toast.error(e.detail.data.message);
      }
    },
  });
  return (
    <Button
      onClick={() => {
        mutate();
      }}
      size={"icon-sm"}
      variant={"destructive"}
    >
      {isPending ? <Spinner /> : <Trash />}
    </Button>
  );
};
