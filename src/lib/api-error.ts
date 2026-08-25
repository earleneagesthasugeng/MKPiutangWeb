import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Data yang dikirim tidak valid.", issues: error.issues },
      { status: 422 }
    );
  }
  if (error instanceof Error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
  return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
}
