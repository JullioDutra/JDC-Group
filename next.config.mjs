/** @type {import('next').NextConfig} */
const nextConfig = {
  // Na VPS (Docker), o build gera um servidor enxuto em .next/standalone
  // (STANDALONE=1 no Dockerfile). Na Vercel, fica como sempre foi.
  ...(process.env.STANDALONE === '1' ? { output: 'standalone' } : {}),
  // As fontes das imagens são lidas do disco em tempo de execução.
  outputFileTracingIncludes: {
    '/api/**': ['./assets/fonts/**'],
  },
};
export default nextConfig;
