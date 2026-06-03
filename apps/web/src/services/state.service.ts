import { apiClient } from "./api-client";
import type {
  APIResponse,
  State,
  CreateStateInput,
  UpdateStateInput,
  SearchParams,
} from "@repo/shared";

// ─── State Service ───────────────────────────────────────────────────
// All API communication for the State module goes through this class.
// Pages must NOT call APIs directly — they must use this service.

export class StateService {
  static async search(
    params: Partial<SearchParams>
  ): Promise<APIResponse<State[]>> {
    const { data } = await apiClient.get<APIResponse<State[]>>(
      "/states/search",
      { params }
    );
    return data;
  }

  static async getById(id: number): Promise<APIResponse<State>> {
    const { data } = await apiClient.get<APIResponse<State>>(
      `/states/${id}`
    );
    return data;
  }

  static async create(input: CreateStateInput): Promise<APIResponse<State>> {
    const { data } = await apiClient.post<APIResponse<State>>(
      "/states",
      input
    );
    return data;
  }

  static async update(
    id: number,
    input: UpdateStateInput
  ): Promise<APIResponse<State>> {
    const { data } = await apiClient.put<APIResponse<State>>(
      `/states/${id}`,
      input
    );
    return data;
  }

  static async delete(id: number): Promise<APIResponse<null>> {
    const { data } = await apiClient.delete<APIResponse<null>>(
      `/states/${id}`
    );
    return data;
  }

  static async bulkDelete(ids: number[]): Promise<APIResponse<null>> {
    const { data } = await apiClient.post<APIResponse<null>>(
      "/states/bulk-delete",
      { ids }
    );
    return data;
  }
}
