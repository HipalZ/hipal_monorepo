"use client";

import { motion } from "framer-motion";
import GalleryCarousel from "./GalleryCarousel";
import MasonryGrid from "./MasonryGrid";

export type Img = { _id: string; name: string; imageUrl: string };
export type Category = {
  categoryName: string;
  categoryId: string;
  images: Img[];
};

interface GalleryProps {
  // Accept either: { data: Category[] } OR Category[]
  propertyImages: { data: Category[] } | Category[];
}

/** Normalize the incoming prop to Category[] */
function normalizeCategories(
  input: { data?: Category[] } | Category[] | undefined,
): Category[] {
  if (!input) return [];
  if (Array.isArray((input as any).data)) return (input as any).data ?? [];
  if (Array.isArray(input)) return input as Category[];
  return [];
}

export default function Gallery({ propertyImages }: GalleryProps) {
  const categories = normalizeCategories(propertyImages);

  const hasImages =
    categories.length > 0 &&
    categories.some((c) => (c.images?.length ?? 0) > 0);

  if (!hasImages) {
    return (
      <section className="py-16 bg-transparent min-h-screen !overflow-auto">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Property Gallery
            </h2>
            <div className="rounded-xl p-12 border border-white/10 bg-white/5">
              <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full grid place-items-center">
                <svg
                  className="w-12 h-12 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-white/70">
                Property images will be available soon
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // All images for masonry grid
  const allImages = categories.flatMap((c) =>
    (c.images ?? []).map((img) => ({ ...img, categoryName: c.categoryName })),
  );

  // First non-empty category for the featured carousel
  const firstCategory = categories.find((c) => (c.images?.length ?? 0) > 0);

  return (
    <section className="py-16 bg-transparent overflow-auto">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Property Gallery
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Explore our premium spaces and world-class amenities through this
            curated collection of images
          </p>
        </motion.div>

        <div className="space-y-16">
          {/* Featured Carousel */}
          {firstCategory && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Featured: {firstCategory.categoryName}
              </h3>
              <GalleryCarousel images={firstCategory.images} />
            </motion.div>
          )}

          {/* Masonry Grid - All Images */}
          {allImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Complete Gallery
              </h3>
              <MasonryGrid images={allImages} />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
