import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RENA",
    short_name: "RENA",
    description: "Retrieval-Enhanced Network for Analytics",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0EA5E9",
    icons: [
      { src: "/brand/rena-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/rena-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
