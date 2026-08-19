import { api } from "../axios";

export interface OnboardingForm {
  filesToAdd: File[];
  existingDefaultWorkspaceId?: number;
  workspacesToAdd: string[];
}

export async function finishOnboarding(form: OnboardingForm) {
  const formData = new FormData();
  form.filesToAdd.forEach((file) => formData.append("filesToAdd", file));
  form.workspacesToAdd.forEach((name) => formData.append("workspacesToAdd", name));
  if (form.existingDefaultWorkspaceId !== undefined) {
    formData.append("existingDefaultWorkspaceId", String(form.existingDefaultWorkspaceId));
  }

  return api
    .post("/onboarding", formData, { headers: { "Content-Type": undefined } })
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}

export const markTourAsSeen = (): Promise<void> => api.put("/onboarding/tour").then(() => undefined);
