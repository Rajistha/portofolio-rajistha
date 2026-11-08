import type { Metadata } from "next";
import { getTestimonials } from "@/lib/data";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Testimoni",
};

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return <TestimonialsManager initialTestimonials={testimonials} />;
}
