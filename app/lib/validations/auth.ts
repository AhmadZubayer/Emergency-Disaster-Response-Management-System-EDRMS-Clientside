import { z } from "zod";

export const signInSchema = () =>
  z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
  });

export const signUpSchema = () =>
  z
    .object({
      name: z.string().trim().min(2, "Enter at least 2 characters"),
      email: z.string().email("Enter a valid email"),
      password: z.string().min(8, "Use at least 8 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });