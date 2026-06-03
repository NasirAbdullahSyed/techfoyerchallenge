import { apiClient } from "./api-client";
import type {
  APIResponse,
  Country,
  CreateCountryInput,
  UpdateCountryInput,
  SearchParams,
} from "@repo/shared";

// ─── Country Service ─────────────────────────────────────────────────
// All API communication for the Country module goes through this class.
// Pages must NOT call APIs directly — they must use this service.

export class CountryService {
  static async search(
    params: Partial<SearchParams>
  ): Promise<APIResponse<Country[]>> {
    const { data } = await apiClient.get<APIResponse<Country[]>>(
      "/countries/search",
      { params }
    );
    return data;
  }

  static async getById(id: number): Promise<APIResponse<Country>> {
    const { data } = await apiClient.get<APIResponse<Country>>(
      `/countries/${id}`
    );
    return data;
  }

  static async create(
    input: CreateCountryInput
  ): Promise<APIResponse<Country>> {
    const { data } = await apiClient.post<APIResponse<Country>>(
      "/countries",
      input
    );
    return data;
  }

  static async update(
    id: number,
    input: UpdateCountryInput
  ): Promise<APIResponse<Country>> {
    const { data } = await apiClient.put<APIResponse<Country>>(
      `/countries/${id}`,
      input
    );
    return data;
  }

  static async delete(id: number): Promise<APIResponse<null>> {
    const { data } = await apiClient.delete<APIResponse<null>>(
      `/countries/${id}`
    );
    return data;
  }

  static async bulkDelete(ids: number[]): Promise<APIResponse<null>> {
    const { data } = await apiClient.post<APIResponse<null>>(
      "/countries/bulk-delete",
      { ids }
    );
    return data;
  }

  static async list(): Promise<APIResponse<Country[]>> {
    const { data } = await apiClient.get<APIResponse<Country[]>>(
      "/countries/list"
    );
    return data;
  }
}
