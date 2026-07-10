import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src', // Thư mục chứa code chính của bạn
  publicDir: resolve(__dirname, 'public'), // Ép Vite tìm thư mục public ở ngoài cùng
});