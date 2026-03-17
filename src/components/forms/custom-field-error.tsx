import type { ValidationError } from "@tanstack/react-form";
import { z } from "zod";

import { FieldError } from "@/components/ui/field";

type ZodError = z.core.$ZodIssueInvalidStringFormat | z.core.$ZodIssueTooSmall;

interface CustomFieldErrorProps {
  errors: Array<ValidationError>;
}

export default function CustomFieldError({ errors }: CustomFieldErrorProps) {
  if (!errors || errors.length === 0) return null;

  const issues = errors as Array<ZodError>;

  const tooSmall = issues.find((err) => err.code === "too_small");
  const invalidFormat = issues.find((err) => err.code === "invalid_format");

  const message = tooSmall
    ? tooSmall.message
    : invalidFormat
      ? invalidFormat.message
      : issues[0].message;

  return <FieldError>{message}</FieldError>;
}
