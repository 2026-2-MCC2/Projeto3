import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import TextField from "./TextField.jsx";

export default function PasswordField(props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <TextField
      icon={Lock}
      autoComplete="current-password"
      {...props}
      type={visivel ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
        >
          {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
}
