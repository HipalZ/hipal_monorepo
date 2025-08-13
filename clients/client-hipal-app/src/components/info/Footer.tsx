"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BusinessDetails } from "@/components/types/businessData";

interface FooterProps {
  businessData: BusinessDetails;
}

export default function Footer({ businessData }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Normalize & validate helpers
  const normalizePlatform = (p?: string) => p?.trim().toLowerCase() ?? "";
  const isValidHttpUrl = (url?: string) =>
    !!url && /^https?:\/\//i.test(url.trim());

  // Map platform names to icons; support "x" alias for twitter
  const platformIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    x: Twitter,
  };

  // Build social links ONLY when platform + url are valid and platform is recognized
  const rawLinks = businessData?.socialMediaLinks ?? [];
  const socialLinks = rawLinks
    .map((link) => {
      const key = normalizePlatform((link as any)?.platform);
      const url = (link as any)?.url?.trim();
      const Icon = platformIcons[key];
      return Icon && isValidHttpUrl(url)
        ? { name: key, icon: Icon, url }
        : null;
    })
    .filter(Boolean) as { name: string; icon: any; url: string }[];

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact-section");
    contactSection?.scrollIntoView({ behavior: "smooth" });
  };

  const desc =
    businessData.footerDescription?.trim() ||
    businessData.description?.trim() ||
    "";

  return (
    <footer
      id="contact-section"
      className="border-t border-white/10 bg-transparent"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-white">
              {businessData.name}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {desc.length > 120 ? `${desc.substring(0, 120)}...` : desc}
            </p>

            {/* Legal Info */}
            <div className="space-y-2">
              {businessData.gst && (
                <Badge
                  variant="outline"
                  className="text-xs border-white/20 text-white/80 bg-white/5"
                >
                  GST: {businessData.gst}
                </Badge>
              )}
              {businessData.fssai && (
                <Badge
                  variant="outline"
                  className="text-xs border-white/20 text-white/80 bg-white/5"
                >
                  FSSAI: {businessData.fssai}
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Contact Us</h3>
            <div className="space-y-3">
              {!!businessData.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-emerald-300 mt-1 flex-shrink-0" />
                  <p className="text-sm text-white/80">
                    {businessData.address}
                  </p>
                </div>
              )}
              {!!businessData.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                  <a
                    href={`tel:${businessData.phone}`}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {businessData.phone}
                  </a>
                </div>
              )}
            </div>

            <Button
              onClick={scrollToContact}
              className="w-full sm:w-auto text-white bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-500/90 hover:to-emerald-400/90 shadow-lg shadow-emerald-500/20"
            >
              Schedule Site Visit
            </Button>
          </motion.div>

          {/* Social Links (only if valid links exist) */}
          {socialLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Follow Us</h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Button
                      key={`${social.name}-${social.url}`}
                      variant="outline"
                      size="icon"
                      asChild
                      className="bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/30"
                    >
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow us on ${social.name}`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="border-t border-white/10 mt-8 pt-8 text-center"
        >
          <p className="text-sm text-white/70">
            © {currentYear} {businessData.name}. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
