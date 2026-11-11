import { AdminLogin } from "@/components/admin/AdminLogin";
import styles from "@/components/admin/admin.module.css";

export default function AdminLoginPage() {
  return <main className={styles.loginPage}><AdminLogin /></main>;
}
