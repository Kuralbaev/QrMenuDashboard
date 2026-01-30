import {
  getRestaurantsFromApi,
  getRestaurantById,
  updateRestaurant,
  publishRestaurant,
  unpublishRestaurant,
  type GetRestaurantsParams,
  type UpdateRestaurantData,
} from '../api/restaurant'
import type { Restaurant } from '../types/api'

export function useRestaurantService() {
  async function getAll(params: GetRestaurantsParams) {
    const response = await getRestaurantsFromApi(params)
    return response
  }

  async function getById(id: string): Promise<Restaurant> {
    return await getRestaurantById(id)
  }

  async function update(id: string, data: UpdateRestaurantData): Promise<Restaurant> {
    return await updateRestaurant(id, data)
  }

  async function publish(id: string): Promise<Restaurant> {
    return await publishRestaurant(id)
  }

  async function unpublish(id: string): Promise<Restaurant> {
    return await unpublishRestaurant(id)
  }

  return {
    getAll,
    getById,
    update,
    publish,
    unpublish,
  }
}
