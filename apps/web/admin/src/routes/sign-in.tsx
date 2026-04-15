import { parseResponse, rpc, type DetailedError } from "@auth-practices/api";
import { Button } from "@auth-practices/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@auth-practices/ui/components/field";
import { Input } from "@auth-practices/ui/components/input";
import { Spinner } from "@auth-practices/ui/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/context/auth";
import { useForm } from "@tanstack/react-form";
import { Label } from "@auth-practices/ui/components/label";
import { toast } from "sonner";

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const { mutateAsync } = useMutation({
    mutationFn: async (v: { email: string; password: string; orgCode: string }) =>
      await parseResponse(rpc.admin["sigin-in"].$post({ json: v })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"], exact: true });
    },
    onError: (e: DetailedError) => {
      if (typeof e.detail?.data?.message === "string") {
        toast.error(e.detail?.data?.message);
      }
    },
  });
  const form = useForm({
    defaultValues: {
      orgCode: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
    },
  });

  if (auth) return <Navigate to="/" />;

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-sm border p-4 rounded-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Admin Sign-in</FieldLegend>
              <FieldDescription>All transactions are secure and encrypted</FieldDescription>

              <div className="space-y-4 mt-4">
                <form.Field name="orgCode">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label htmlFor="org-code">Organisation Code</Label>
                        <Input
                          id="org-code"
                          prefix="OG"
                          placeholder="OGXXX"
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
                <form.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        placeholder="Type your email"
                        type="email"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="password">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>

                      <div className="relative">
                        <Input
                          id="password"
                          type={showPass ? "text" : "password"}
                          placeholder="Enter password"
                          required
                          className="pr-10"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPass((prev) => !prev)}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </Field>
                  )}
                </form.Field>
              </div>
            </FieldSet>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Field orientation="vertical" className="pt-4 items-center">
                  <Button disabled={!canSubmit} type="submit" className="w-full">
                    {isSubmitting ? <Spinner /> : "Sign In"}
                  </Button>
                  <div className="w-full text-xs text-muted-foreground text-center">
                    {" "}
                    Dont have account yet ?{" "}
                    <Link to="/sign-up" className="hover:underline">
                      sign-up{" "}
                    </Link>
                  </div>
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
