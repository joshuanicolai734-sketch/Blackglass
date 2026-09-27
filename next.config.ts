import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Short, guessable routes people type or paste from posts.
  async redirects() {
    return [
      { source: "/download", destination: "/get", permanent: true },
      { source: "/android", destination: "/get", permanent: true },
      { source: "/app", destination: "/get", permanent: true },
      { source: "/apply", destination: "/coaching#enquire", permanent: true },
      { source: "/bio", destination: "/links", permanent: true },
    ];
  },
};

export default nextConfig;
