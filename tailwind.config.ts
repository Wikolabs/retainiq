import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",500:"#f59e0b",600:"#d97706",700:"#b45309",900:"#78350f" }
      },
      fontFamily: { display:["'Lora'","serif"], body:["'Nunito'","sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
