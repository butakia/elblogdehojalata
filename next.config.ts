import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde el celular por la red local
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
