import { api } from "./axios";
import type { CreateWorkspaceForm, Workspace } from "../models/Workspace";

const baseUrl = "/workspace";

export const getAllUserWorkspaces = () =>
  api.get<Workspace[]>(baseUrl).then((r) => r.data);

export const addWorkspaceApi = (workspace: CreateWorkspaceForm) =>
  api.post(baseUrl, workspace).then((r) => r.data);
