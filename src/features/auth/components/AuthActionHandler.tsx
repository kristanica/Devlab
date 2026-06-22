import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ForgotPasswordLink from "./ForgotPasswordLink";
import VerifyEmail from "./VerifyEmail"; // you'll create this

export default function AuthActionHandler() {
  const [params] = useSearchParams();
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (!mode || !oobCode) setValid(false);
  }, [mode, oobCode]);

  if (!valid) return <p>Invalid request.</p>;

  switch (mode) {
    case "resetPassword":
      return <ForgotPasswordLink oobCode={oobCode} />;

    case "verifyEmail":
      return <VerifyEmail oobCode={oobCode} />;

    // OPTIONAL: support recoverEmail, verifyBeforeUpdate
    default:
      return <p>Unsupported action.</p>;
  }
}
