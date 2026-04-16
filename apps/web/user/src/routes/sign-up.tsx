import { z } from "zod";

import { parseResponse, rpc, type DetailedError } from "@auth-practices/rpc";
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
const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),

    orgCode: z.string().min(3, "Org code is required").regex(/^OG/i, "Org code must start with OG"),

    email: z.email("Invalid email address"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const Route = createFileRoute("/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const { mutateAsync } = useMutation({
    mutationFn: async (v: { name: string; email: string; password: string; orgCode: string }) =>
      await parseResponse(rpc.admin["sign-up"].$post({ json: v })),

    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["auth"], exact: true });
    },

    onError: (e: DetailedError) => {
      if (typeof e.detail?.data?.message === "string") {
        toast.error(e.detail.data.message);
      }
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      orgCode: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validators: {
      onSubmit: signUpSchema,
    },

    onSubmit: async ({ value }) => {
      await mutateAsync({
        name: value.name,
        email: value.email,
        password: value.password,
        orgCode: value.orgCode,
      });
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
              <FieldLegend>User Sign-up</FieldLegend>
              <FieldDescription>Create your account securely</FieldDescription>

              <div className="space-y-4 mt-4">
                <form.Field name="name">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Name</FieldLabel>
                        <Input
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="orgCode">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label>Organisation Code</Label>
                        <Input
                          prefix="OG"
                          placeholder="OGXXX"
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
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                          type="email"
                          placeholder="Type your email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="password">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Password</FieldLabel>

                        <div className="relative">
                          <Input
                            type={showPass ? "text" : "password"}
                            className="pr-10"
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
                            {showPass ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>

                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="confirmPassword">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Confirm Password</FieldLabel>

                        <Input
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />

                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </div>
            </FieldSet>

            {/* Submit */}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Field orientation="vertical" className="pt-4 items-center">
                  <Button disabled={!canSubmit} type="submit" className="w-full">
                    {isSubmitting ? <Spinner /> : "Sign Up"}
                  </Button>

                  <div className="w-full text-xs text-muted-foreground text-center">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="hover:underline">
                      Sign-in
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
