import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import i18n from "../../src/i18n/config";
import { UploadQueueProvider } from "../../src/uploads/UploadQueueProvider";
import { useUploadQueue } from "../../src/uploads/UploadQueueContext";
import { WorkspaceContext, type WorkspaceContextValue } from "../../src/workspace/WorkspaceContext";

vi.mock("../../src/hooks/useUploadFileToFolder", () => ({
  useUploadFileToFolder: vi.fn(),
}));

const messageErrorMock = vi.fn();
const messageSuccessMock = vi.fn();

// `AntdApp.useApp()`'s message/notification/modal are bound to whichever <App> instance mounted
// them — spying on the static `antd` `message` export wouldn't see calls made through that
// context-bound instance, so the hook itself is mocked instead.
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({
        message: { error: messageErrorMock, success: messageSuccessMock },
        notification: { error: vi.fn() },
        modal: {},
      }),
    },
  };
});

import { useUploadFileToFolder } from "../../src/hooks/useUploadFileToFolder";

const uploadFileMock = vi.fn();

function axiosErrorWithDetail(status: number, detail: string): AxiosError {
  const error = new AxiosError("Request failed");
  error.response = {
    status,
    statusText: "",
    headers: {},
    // @ts-expect-error minimal config stub for the test
    config: {},
    data: { statusCode: String(status), title: "Error", detail },
  };
  return error;
}

function makeFile(name: string, sizeBytes: number, type = "text/plain") {
  const file = new File(["x".repeat(Math.min(sizeBytes, 10))], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

function makeWorkspace(): WorkspaceContextValue {
  return {
    currentWorkspace: {
      id: 1,
      workspaceId: 5,
      workspaceName: "Familia",
      metadata: { members: [], memberDetails: [], role: "OWNER", joinedAt: "", isDefault: true },
    },
    workspaces: [],
    setCurrentWorkspace: () => {},
    isLoading: false,
  };
}

function renderQueue() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={makeWorkspace()}>
        <UploadQueueProvider>{children}</UploadQueueProvider>
      </WorkspaceContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(() => useUploadQueue(), { wrapper });
}

beforeEach(() => {
  vi.mocked(useUploadFileToFolder).mockReturnValue({
    mutateAsync: uploadFileMock,
  } as unknown as ReturnType<typeof useUploadFileToFolder>);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("UploadQueueProvider - error paths", () => {
  it("marks an item as error and keeps it in the queue immediately after a failed upload", async () => {
    uploadFileMock.mockRejectedValue(new Error("network down"));
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads("folder-1", [makeFile("a.txt", 100)], i18n.t);
    });

    expect(result.current.uploads).toEqual([
      expect.objectContaining({ fileName: "a.txt", status: "error" }),
    ]);
  });

  it("gives a name-collision item the specific conflicting-name message, not a generic one", async () => {
    uploadFileMock.mockRejectedValue(
      axiosErrorWithDetail(400, "Ya existe un archivo con el nombre 'a.txt' en ese destino"),
    );
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads("folder-1", [makeFile("a.txt", 100)], i18n.t);
    });

    expect(result.current.uploads[0].errorMessage).toBe(i18n.t("files.nameConflict", { name: "a.txt" }));
  });

  it("gives a checksum-duplicate item the specific duplicate-content message", async () => {
    uploadFileMock.mockRejectedValue(
      axiosErrorWithDetail(409, "El contenido ya existe en este workspace como 'existing.txt'"),
    );
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads("folder-1", [makeFile("a.txt", 100)], i18n.t);
    });

    expect(result.current.uploads[0].errorMessage).toBe(
      i18n.t("files.checksumConflict", { name: "existing.txt" }),
    );
  });

  it("falls back to a generic per-item message for an unrecognized failure", async () => {
    uploadFileMock.mockRejectedValue(new Error("network down"));
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads("folder-1", [makeFile("a.txt", 100)], i18n.t);
    });

    expect(result.current.uploads[0].errorMessage).toBe(i18n.t("files.uploadItemFailed"));
  });

  it("shows the failed-count toast, not the success toast, when an upload fails", async () => {
    const errorSpy = messageErrorMock;
    const successSpy = messageSuccessMock;
    uploadFileMock.mockRejectedValue(new Error("network down"));
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads("folder-1", [makeFile("a.txt", 100)], i18n.t);
    });

    expect(errorSpy).toHaveBeenCalledWith(i18n.t("files.uploadFailedCount", { failed: 1, total: 1 }));
    expect(successSpy).not.toHaveBeenCalled();
  });

  it("reports a partial failure count when only some uploads in the batch fail", async () => {
    const errorSpy = messageErrorMock;
    uploadFileMock.mockImplementation(({ file }: { file: File }) =>
      file.name === "bad.txt" ? Promise.reject(new Error("nope")) : Promise.resolve(),
    );
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads(
        "folder-1",
        [makeFile("good.txt", 100), makeFile("bad.txt", 100)],
        i18n.t,
      );
    });

    expect(errorSpy).toHaveBeenCalledWith(i18n.t("files.uploadFailedCount", { failed: 1, total: 2 }));
  });

  it("rejects an oversized file before ever calling the upload mutation, and shows why", async () => {
    const errorSpy = messageErrorMock;
    const { result } = renderQueue();
    const tooLarge = makeFile("huge.zip", 51 * 1024 * 1024, "application/zip");

    await act(async () => {
      await result.current.runUploads("folder-1", [tooLarge], i18n.t);
    });

    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      i18n.t("files.uploadRejectedTooLarge", { name: "huge.zip", maxSize: "50.0 MB" }),
    );
  });

  it("rejects an image/video file before ever calling the upload mutation", async () => {
    const { result } = renderQueue();
    const photo = makeFile("vacaciones.jpg", 1000, "image/jpeg");

    await act(async () => {
      await result.current.runUploads("folder-1", [photo], i18n.t);
    });

    expect(uploadFileMock).not.toHaveBeenCalled();
  });

  it("removes a failed item from the queue after the completed-item TTL", async () => {
    vi.useFakeTimers();
    uploadFileMock.mockRejectedValue(new Error("network down"));
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads("folder-1", [makeFile("a.txt", 100)], i18n.t);
    });
    expect(result.current.uploads).toHaveLength(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(result.current.uploads).toHaveLength(0);
    vi.useRealTimers();
  });

  it("does nothing when the file list is empty or null", async () => {
    const { result } = renderQueue();

    await act(async () => {
      await result.current.runUploads("folder-1", [], i18n.t);
      await result.current.runUploads("folder-1", null, i18n.t);
    });

    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(result.current.uploads).toEqual([]);
  });
});
