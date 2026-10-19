// Gives every sign-in / sign-up page a main landmark so screen-reader users can jump straight to the form.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
