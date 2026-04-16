import { parseResponse, rpc, type DetailedError } from "@auth-practices/rpc";
import { Button } from "@auth-practices/ui/components/button";
import { Field, FieldError, FieldGroup } from "@auth-practices/ui/components/field";
import { Input } from "@auth-practices/ui/components/input";
import { Label } from "@auth-practices/ui/components/label";
import { Spinner } from "@auth-practices/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const CheckFeature = () => {
  const [result, setResult] = useState<boolean | null>(null);

  const { mutateAsync } = useMutation({
    mutationKey: ["check-feature"],
    mutationFn: async (v: { featureKey: string }) =>
      await parseResponse(
        rpc.user["feature"]["check"][":key"].$get({
          param: { key: v.featureKey },
        }),
      ),
    onSuccess: (data) => {
      setResult(data.isEnabled);
    },
    onError: (e: DetailedError) => {
      if (typeof e.detail?.data?.message === "string") {
        toast.error(e.detail.data.message);
      } else {
        toast.error("Failed to check feature");
      }
    },
  });

  const form = useForm({
    defaultValues: {
      featureKey: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.featureKey) {
          return {
            featureKey: "Feature key is required",
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
    },
  });

  return (
    <div className="min-w-sm space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4 w-full"
      >
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
                    placeholder="e.g. new_dashboard"
                  />

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? <Spinner /> : "Check Feature"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      {/* Result */}
      {result !== null && (
        <div className="text-sm font-medium">
          Result:{" "}
          {result ? (
            <span className="text-green-600">Enabled</span>
          ) : (
            <span className="text-red-600">Disabled</span>
          )}
        </div>
      )}
    </div>
  );
};
