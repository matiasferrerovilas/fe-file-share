import { createFileRoute, useRouter } from "@tanstack/react-router";
import { onBoardingGuard } from "../auth/onBoardingGuard";
import { Card, Col, Row, Steps, Typography } from "antd";
import { useKeycloak } from "@react-keycloak/web";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finishOnboarding, type OnboardingForm } from "../api/onboarding/onboardinApi";
import WelcomeOnboarding from "../components/onboarding/WelcomeOnboarding";
import WorkspaceOnboarding from "../components/onboarding/WorkspaceOnboarding";
import { CURRENT_USER_QUERY_KEY } from "../hooks/useCurrentUser";
import { USER_WORKSPACES_QUERY_KEY } from "../hooks/useWorkspaces";
import { USER_DEFAULTS_QUERY_KEY } from "../hooks/useSettings";
const { Title, Text } = Typography;

export const Route = createFileRoute("/onboarding")({
  beforeLoad: onBoardingGuard,
  component: RouteComponent,
});

function RouteComponent() {
  const { keycloak } = useKeycloak();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingForm>>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const handleNext = (values: Partial<OnboardingForm>) => {
    setDirection("forward");
    setFormData((prev) => ({ ...prev, ...values }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection("back");
    setCurrentStep((prev) => prev - 1);
  };

  const finishMutation = useMutation({
    mutationFn: (form: OnboardingForm) => finishOnboarding(form),
    onSuccess: async () => {
      try {
        await keycloak.updateToken(0);
      } catch {
        console.error("Error refreshing token after onboarding");
      }
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: USER_WORKSPACES_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: [USER_DEFAULTS_QUERY_KEY] });
      router.invalidate();
      router.navigate({ to: "/", replace: true });
    },
  });

  const steps = [
    {
      title: "Workspace",
      description: "Elegí dónde guardar tus archivos",
      content: <WorkspaceOnboarding initialValues={formData} onNext={handleNext} />,
    },
    {
      title: "Bienvenido",
      description: "Organizá tus archivos",
      content: (
        <WelcomeOnboarding
          initialValues={formData}
          isLoading={finishMutation.isPending}
          onPrev={handlePrev}
          onFinish={(values: Pick<OnboardingForm, "filesToAdd">) => {
            const finalData: OnboardingForm = {
              workspacesToAdd: formData.workspacesToAdd ?? [],
              existingDefaultWorkspaceId: formData.existingDefaultWorkspaceId,
              filesToAdd: values.filesToAdd,
            };
            setFormData(finalData);
            finishMutation.mutate(finalData);
          }}
        />
      ),
    },
  ];
  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card
          style={{
            margin: 20,
            paddingInline: 20,
            maxWidth: 900,
            animation: "onboarding-card-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <Title level={2} style={{ margin: 0 }}>
              Bienvenido
            </Title>
            <Text type="secondary">
              Bienvenido a Keep, {keycloak?.tokenParsed?.preferred_username}. Antes de
              comenzar, necesitamos que completes el proceso de configuración inicial. Esto nos
              ayudará a personalizar tu experiencia y asegurarnos de que todo esté listo para ti.
            </Text>
          </div>

          <Steps
            current={currentStep}
            items={steps.map((s) => ({ title: s.title, description: s.description }))}
            style={{ marginBottom: 40 }}
            size="small"
          />

          <div
            key={currentStep}
            className={direction === "forward" ? "step-enter-right" : "step-enter-left"}
          >
            {steps[currentStep].content}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
