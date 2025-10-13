import { Button, Typography } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { auth } from "../../config/firebase";
import { handleFirebaseAuth } from "../../store/actions/auth";
import styles from "./styles.module.css";

const GoogleAuth = ({ setError, mode = "login" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const result1 = await dispatch(
        handleFirebaseAuth(
          user.uid,
          user.email,
          user.displayName || user.email.split("@")[0]
        )
      );

      if (result1.success) {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Google login/register failed");
    }
  };

  return (
    <>
      <Typography align="center" className={styles.orText}>
        OR
      </Typography>

      <Button
        fullWidth
        className={`${styles.button} ${styles.secondaryButton}`}
        onClick={handleGoogleAuth}
      >
        {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
      </Button>
    </>
  );
};

export default GoogleAuth;
