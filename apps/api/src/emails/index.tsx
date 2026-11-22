import React from "react";
import { render } from "@react-email/render";

import VerifyEmail, { VerifyEmailProps } from "./VerifyEmail";
import ChangeEmail, { ChangeEmailProps } from "./ChangeEmail";
import ResetPassword, { ResetPasswordProps } from "./ResetPassword";
import DeleteAccount, { DeleteAccountProps } from "./DeleteAccount";

export const renderVerifyEmail = async (props: VerifyEmailProps) => {
  const html = await render(<VerifyEmail {...props} />);
  return html;
};

export const renderChangeEmail = async (props: ChangeEmailProps) => {
  const html = await render(<ChangeEmail {...props} />);
  return html;
};

export const renderResetPassword = async (props: ResetPasswordProps) => {
  const html = await render(<ResetPassword {...props} />);
  return html;
};

export const renderDeleteAccount = async (props: DeleteAccountProps) => {
  const html = await render(<DeleteAccount {...props} />);
  return html;
};
