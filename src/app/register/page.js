// src/app/register/page.js
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register - Restaurant Feedback",
  description: "Register your restaurant with our feedback system",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
