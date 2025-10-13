import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import styles from "./styles.module.css";

const PasswordInput = ({ value, onChange, label = "Password" }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [hoverAction, setHoverAction] = useState(false);

  const handleShow = () => setShowPassword((prev) => !prev);
  const handleMouseDown = (event) => event.preventDefault();

  const isPasswordVisible = showPassword || hoverAction;

  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      type={isPasswordVisible ? "text" : "password"}
      value={value}
      onChange={onChange}
      className={styles.input}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleShow}
              onMouseDown={handleMouseDown}
              onMouseEnter={() => setHoverAction(true)}
              onMouseLeave={() => setHoverAction(false)}
              edge="end"
            >
              {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordInput;
