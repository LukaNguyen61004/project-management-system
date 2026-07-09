import { apiClient } from "./client"
import type { CreateEpicInput, Epic } from "../types/epic.types"

export const epicApi = {
    getByProject: (projectId: number) =>
        apiClient.get<{ message: string, data: Epic[] }>(
            `/epics/projects/${projectId}`
        ),

    create: (projectId: number, data: CreateEpicInput) =>
        apiClient.post<{ message: string, data: Epic }>(
            `/epics/projects/${projectId}`,
            data
        ),
}