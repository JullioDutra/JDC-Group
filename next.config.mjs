/** @type {import('next').NextConfig} */
const nextConfig = {
  // As fontes das imagens são lidas do disco em tempo de execução.
  outputFileTracingIncludes: {
    '/api/**': ['./assets/fonts/**'],
  },
};
export default nextConfig;
