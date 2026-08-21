import { Tour, type TourProps } from "antd";
import { useTranslation } from "react-i18next";
import { useMarkTourSeen } from "../../hooks/useMarkTourSeen";
import { useTourRefs } from "../../tour/TourRefsContext";

interface AppTourProps {
  open: boolean;
  onClose: () => void;
}

/**
 * First-time onboarding tour, built from scratch on the same architecture fe-movements already
 * uses: antd's spotlight `Tour` anchored to real nav/toolbar elements via refs registered in
 * TourRefsContext (this app's equivalent of fe-movements' navRefsMap), plus a "mark tour seen"
 * mutation backed by the same `PUT /onboarding/tour` endpoint / `hasSeenTour` flag both apps
 * already share through api-identity.
 */
export default function AppTour({ open, onClose }: AppTourProps) {
  const { t } = useTranslation();
  const { refsMap } = useTourRefs();
  const { mutate: markSeen } = useMarkTourSeen();

  const handleClose = () => {
    markSeen();
    onClose();
  };

  // Cast a HTMLElement (no null) es el patrón que espera antd Tour para `target` como función —
  // mismo enfoque que ya usa fe-movements en su NavTour. Si el ref todavía no está montado en el
  // primer render, el paso correspondiente simplemente no muestra spotlight hasta que se abra.
  const steps: NonNullable<TourProps["steps"]> = [
    {
      title: t("tour.upload.title"),
      description: t("tour.upload.description"),
      target: () => refsMap.current.upload as HTMLElement,
    },
    {
      title: t("tour.search.title"),
      description: t("tour.search.description"),
      target: () => refsMap.current.search as HTMLElement,
    },
    {
      title: t("tour.favorites.title"),
      description: t("tour.favorites.description"),
      target: () => refsMap.current.favorites as HTMLElement,
    },
    {
      title: t("tour.storage.title"),
      description: t("tour.storage.description"),
      target: () => refsMap.current.storage as HTMLElement,
    },
    {
      title: t("tour.viewToggle.title"),
      description: t("tour.viewToggle.description"),
      target: () => refsMap.current.viewToggle as HTMLElement,
    },
    {
      title: t("tour.trash.title"),
      description: t("tour.trash.description"),
      target: () => refsMap.current.trash as HTMLElement,
    },
    {
      title: t("tour.share.title"),
      description: t("tour.share.description"),
    },
    {
      title: t("tour.help.title"),
      description: t("tour.help.description"),
    },
  ];

  return (
    <Tour
      open={open}
      onClose={handleClose}
      onFinish={handleClose}
      steps={steps}
      indicatorsRender={(current, total) => (
        <span>
          {current + 1} / {total}
        </span>
      )}
    />
  );
}
