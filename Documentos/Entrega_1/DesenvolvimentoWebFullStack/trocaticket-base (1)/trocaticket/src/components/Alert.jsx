import { CircleAlert } from "lucide-react";
import "./Alert.css";

export default function Alert({ children }) {
  return (
    <div className="alert" role="alert">
      <CircleAlert size={16} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
