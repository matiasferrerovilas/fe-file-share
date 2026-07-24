import { api } from "../axios";

export interface OnboardingForm {
  filesToAdd: File[];
}

export async function finishOnboarding(form: OnboardingForm) {
  const formData = new FormData();
  form.filesToAdd.forEach((file) => formData.append("filesToAdd", file));

  return api
    .post("/onboarding", formData, { headers: { "Content-Type": undefined } })
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}
