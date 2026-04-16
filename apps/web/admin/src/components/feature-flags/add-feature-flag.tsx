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
import { Button } from "@auth-practices/ui/components/button";
import { Input } from "@auth-practices/ui/components/input";
import { Label } from "@auth-practices/ui/components/label";
import { Spinner } from "@auth-practices/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseResponse, rpc, type DetailedError } from "@auth-practices/rpc";
import { useState } from "react";
import { Checkbox } from "@auth-practices/ui/components/checkbox";
import { toast } from "sonner";

export const featuereFlagSchema = z.object({
  featureKey: z.string().min(1, "Feature key is required"),

  isEnabled: z.boolean({
    error: "Enabled status is required",
  }),
});
export const AddFeatureFlags = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { mutateAsync } = useMutation({
    mutationFn: async (v: { featureKey: string; isEnabled: boolean }) =>
      await parseResponse(rpc.admin["create-feature-flag"].$post({ json: v })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flag-list"] });
    },
    onError: (e: DetailedError) => {
      if (typeof e.detail?.data?.message === "string") {
        toast.error(e.detail.data.message);
      }
    },
  });
  const form = useForm({
    defaultValues: {
      featureKey: "",
      isEnabled: false,
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
      <DialogTrigger render={<Button variant="default">Create Feature Flag</Button>} />
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
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Create a new feature flag by providing a unique feature key and setting its enabled
              status.
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
                  {isSubmitting ? <Spinner /> : "Create"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
