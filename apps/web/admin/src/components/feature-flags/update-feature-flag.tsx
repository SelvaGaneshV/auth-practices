import { parseResponse, rpc, type DetailedError } from "@auth-practices/api";
import { Button } from "@auth-practices/ui/components/button";
import { Checkbox } from "@auth-practices/ui/components/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@auth-practices/ui/components/dialog";
import { Field, FieldError, FieldGroup } from "@auth-practices/ui/components/field";
import { Input } from "@auth-practices/ui/components/input";
import { Label } from "@auth-practices/ui/components/label";
import { Spinner } from "@auth-practices/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import { useState, type FC } from "react";
import { featuereFlagSchema } from "./add-feature-flag";
import { toast } from "sonner";

interface Flag {
  id: string;
  featureKey: string;
  isEnabled: boolean;
  createdAt: string | null;
}

export const UpdateFeatureFlag: FC<{ flag: Flag }> = ({ flag }) => {
  const queryClient = useQueryClient();
  const { page, pagesize } = useSearch({ from: "/" });
  const [open, setOpen] = useState(false);

  const { mutateAsync } = useMutation({
    mutationKey: ["update-feature-flag", flag.id],
    mutationFn: async (v: { featureKey: string; isEnabled: boolean }) =>
      await parseResponse(
        rpc.admin["update-feature-flag"][":id"].$patch({ param: { id: flag.id }, json: v }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature-flag-list", page, pagesize],
        exact: true,
      });
    },
    onError: (e: DetailedError) => {
      if (typeof e.detail?.data?.message === "string") {
        toast.error(e.detail.data.message);
      }
    },
  });
  const form = useForm({
    defaultValues: {
      featureKey: flag.featureKey,
      isEnabled: flag.isEnabled,
    },
    validators: {
      onSubmit: featuereFlagSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
      setOpen(false);
    },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        form.reset();
        setOpen(o);
      }}
    >
      <DialogTrigger
        render={
          <Button size={"icon-sm"} variant={"secondary"}>
            <Edit />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex gap-2 flex-col"
        >
          <DialogHeader>
            <DialogTitle>Update Feature Flag</DialogTitle>
            <DialogDescription>
              Update the feature key or toggle its enabled status.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field name="featureKey">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <Label htmlFor="featureKey">Feature Key</Label>
                    <Input
                      id="featureKey"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="isEnabled">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation={"horizontal"} data-invalid={isInvalid}>
                    <Label htmlFor="isEnabled">Is Enabled</Label>
                    <Checkbox
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onCheckedChange={(e) => field.handleChange(e)}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose
              onClick={() => form.reset()}
              render={<Button variant="outline">Cancel</Button>}
            />
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <Spinner /> : "Update"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
