import { CheckIcon } from "@/components/ui/Icons";
import styles from "./forms.module.css";

interface FormSuccessProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function FormSuccess({ title, message, actionLabel, onAction }: FormSuccessProps) {
  return (
    <div role="status" className={styles.done}>
      <div className={styles.doneIcon}>
        <CheckIcon size={30} strokeWidth={2.4} />
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      <button type="button" className="btn btn-secondary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}
