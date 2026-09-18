import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "後台名單",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
