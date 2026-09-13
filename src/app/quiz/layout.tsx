import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Practice Exam" };

export default function QuizLayout({ children }: { children: ReactNode }) {
  return children;
}
