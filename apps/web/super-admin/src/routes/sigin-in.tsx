import { parseResponse, rpc } from "@auth-practices/rpc";
import { Button } from "@auth-practices/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@auth-practices/ui/components/field";
import { Input } from "@auth-practices/ui/components/input";
import { Spinner } from "@auth-practices/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/context/auth";
export const Route = createFileRoute("/sigin-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const { mutateAsync } = useMutation({
    mutationFn: async ({ name, password }: { name: string; password: string }) =>
      await parseResponse(rpc["super-admin"].login.$post({ json: { name, password } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"], exact: true });
    },
  });
  const form = useForm({
    defaultValues: {
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(value);
    },
  });

  if (auth) return <Navigate to="/" />;

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-md">
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
              <FieldLegend>Super Admin Sign-in</FieldLegend>
              <FieldDescription>All transactions are secure and encrypted</FieldDescription>

              <div className="space-y-4 mt-4">
                <form.Field name="name">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input
                        id="name"
                        placeholder="Type your name"
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
                <Field orientation="horizontal" className="pt-4">
                  <Button disabled={!canSubmit} type="submit" className="w-full">
                    {isSubmitting ? <Spinner /> : "Sign In"}
                  </Button>
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
