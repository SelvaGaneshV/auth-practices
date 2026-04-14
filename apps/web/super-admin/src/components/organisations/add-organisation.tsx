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
import { parseResponse, rpc } from "@auth-practices/api";

export const organisationSchema = z.object({
  orgCode: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => /^OG\d+$/.test(val), {
      message: "Must start with 'OG' followed by only numbers",
    }),
  orgName: z.string().min(1, "Organisation name is required"),
});
export const AddOrganisation = () => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (v: { orgCode: string; orgName: string }) =>
      await parseResponse(rpc["super-admin"]["create-org"].$post({ json: v })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs-list"] });
    },
  });
  const form = useForm({
    defaultValues: {
      orgCode: "",
      orgName: "",
    },
    validators: {
      onSubmit: organisationSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
    },
  });
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="default">Create Organisation</Button>} />
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
            <DialogTitle>Create Organisation</DialogTitle>
            <DialogDescription>
              Add a new organisation by providing a unique organisation code (e.g., OG123) and a
              name.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <form.Field name="orgCode">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <Label htmlFor="name-1">Organisation Code</Label>
                    <Input
                      prefix="OG"
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
            <form.Field name="orgName">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <Label htmlFor="name-1">Organisation Name</Label>
                    <Input
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
          </FieldGroup>
          <DialogFooter>
            <DialogClose
              onClick={() => form.reset()}
              render={<Button variant="outline">Cancel</Button>}
            />
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? <Spinner /> : "Create Organisation"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
